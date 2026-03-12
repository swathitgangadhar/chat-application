const http = require('http');
const path = require('path');
const fs = require('fs/promises');

const PORT = Number(process.env.PORT) || 5000;
const DATA_PATH = path.join(__dirname, 'data', 'chats.json');

const accentByType = {
  direct: '#f97316',
  group: '#22c55e'
};

const readStore = async () => {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
};

const writeStore = async (payload) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(payload, null, 2));
};

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
};

const parseBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true });
  }

  try {
    if (req.method === 'GET' && req.url === '/api/conversations') {
      const data = await readStore();
      return sendJson(res, 200, data.conversations);
    }

    if (req.method === 'POST' && req.url === '/api/conversations') {
      const { name, type, participants, members = [] } = await parseBody(req);
      if (!name || !['direct', 'group'].includes(type)) {
        return sendJson(res, 400, { error: 'Provide valid name and type.' });
      }

      const data = await readStore();
      const normalizedType = type === 'group' ? 'group' : 'direct';
      const conversation = {
        id: `${normalizedType[0]}-${Date.now()}`,
        type: normalizedType,
        name,
        participants: normalizedType === 'group' ? participants || 2 : undefined,
        members: normalizedType === 'group' ? members : [],
        accent: accentByType[normalizedType],
        messages: []
      };

      data.conversations.unshift(conversation);
      await writeStore(data);
      return sendJson(res, 201, conversation);
    }

    const messageMatch = req.url.match(/^\/api\/conversations\/([^/]+)\/messages$/);
    if (req.method === 'POST' && messageMatch) {
      const conversationId = decodeURIComponent(messageMatch[1]);
      const { sender = 'You', content = '', attachments = [] } = await parseBody(req);

      if (!content.trim() && !attachments.length) {
        return sendJson(res, 400, { error: 'Message content or attachment is required.' });
      }

      const data = await readStore();
      const conversation = data.conversations.find((item) => item.id === conversationId);
      if (!conversation) {
        return sendJson(res, 404, { error: 'Conversation not found.' });
      }

      const nextMessage = {
        id: conversation.messages.length + 1,
        sender,
        content: content.trim(),
        attachments,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      conversation.messages.push(nextMessage);
      await writeStore(data);
      return sendJson(res, 201, nextMessage);
    }

    return sendJson(res, 404, { error: 'Route not found.' });
  } catch (_error) {
    return sendJson(res, 500, { error: 'Server error.' });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
