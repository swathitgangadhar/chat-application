import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [theme, setTheme] = useState('light');
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const fetchMessages = async () => {
    const res = await axios.get('/api/messages', { withCredentials: true });
    setMessages(res.data);
  };

  const sendMessage = async () => {
    await axios.post('/api/messages', { content }, { withCredentials: true });
    setContent('');
    fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className={`app ${theme}`}>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx}><b>{msg.username}</b>: {msg.content}</div>
        ))}
      </div>
      <input value={content} onChange={(e) => setContent(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
