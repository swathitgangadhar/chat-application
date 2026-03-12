export const fetchConversations = async () => {
  const response = await fetch('/api/conversations');
  if (!response.ok) {
    throw new Error('Unable to fetch conversations.');
  }

  return response.json();
};

export const createConversationApi = async ({ name, type, participants, members }) => {
  const response = await fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type, participants, members })
  });

  if (!response.ok) {
    throw new Error('Unable to create conversation.');
  }

  return response.json();
};

export const sendMessageApi = async ({ conversationId, sender, content, attachments }) => {
  const response = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender, content, attachments })
  });

  if (!response.ok) {
    throw new Error('Unable to send message.');
  }

  return response.json();
};
