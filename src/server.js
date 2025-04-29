const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));

// Register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashed]);
  res.sendStatus(201);
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
  const user = result.rows[0];
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = user.id;
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

// Get Messages
app.get('/api/messages', async (req, res) => {
  const result = await pool.query('SELECT m.*, u.username FROM messages m JOIN users u ON u.id = m.user_id ORDER BY m.created_at');
  res.json(result.rows);
});

// Post Message
app.post('/api/messages', async (req, res) => {
  const userId = req.session.user;
  const { content } = req.body;
  await pool.query('INSERT INTO messages (user_id, content) VALUES ($1, $2)', [userId, content]);
  res.sendStatus(201);
});

app.listen(5000, () => console.log('Server running on port 5000'));
