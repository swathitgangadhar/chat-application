export const getConversationFromPath = () => {
  const match = window.location.pathname.match(/^\/chat\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
};

export const groupConversationsByType = (conversations) => ({
  groups: conversations.filter((conversation) => conversation.type === 'group'),
  direct: conversations.filter((conversation) => conversation.type === 'direct')
});
