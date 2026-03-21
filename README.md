# Chat application

Chat application with these technologies and features:

- Backend with Node.js + file-backed API server
- Frontend with React
- REST API for messages and conversations
- Dark/Light mode toggle
- Mobile responsiveness

## Run locally

Use **two terminals** so the frontend can reach the backend API:

1. Start backend (port 5000):

```bash
npm run server
```

2. Start frontend (port 3000):

```bash
npm start
```

The frontend proxies `/api/*` calls to `http://localhost:5000`.


![Screenshot 2026-03-21 095004](https://github.com/user-attachments/assets/14734a26-afa1-427d-9f9a-958557b853bc)
