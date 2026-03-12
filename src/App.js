import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { createConversationApi, fetchConversations, sendMessageApi } from './api';
import { getConversationFromPath, groupConversationsByType } from './chatUtils';
import DashboardPage from './components/DashboardPage';
import ChatPage from './components/ChatPage';

function App() {
  const [conversations, setConversations] = useState([]);
  const [draftMessage, setDraftMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(getConversationFromPath);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const payload = await fetchConversations();
        setConversations(payload);
      } catch (_requestError) {
        setError('Could not load chats from backend.');
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, []);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId),
    [activeConversationId, conversations]
  );

  const groupedConversations = useMemo(
    () => groupConversationsByType(conversations),
    [conversations]
  );

  const createConversation = async ({ type, name, members = [] }) => {
    if (!name || !name.trim()) {
      return;
    }

    try {
      const createdConversation = await createConversationApi({
        name: name.trim(),
        type,
        participants: type === 'group' ? members.length + 1 : 2,
        members
      });
      setConversations((current) => [createdConversation, ...current]);
      setActiveConversationId(createdConversation.id);
    } catch (_error) {
      setError('Unable to create chat right now.');
    }
  };

  const onPickFiles = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    setSelectedFiles((current) => [...current, ...files]);
    event.target.value = '';
  };

  const sendMessage = async () => {
    const content = draftMessage.trim();
    if ((!content && selectedFiles.length === 0) || !activeConversation) {
      return;
    }

    const attachments = selectedFiles.map((file) => ({
      name: file.name,
      type: file.type || 'file'
    }));

    try {
      const savedMessage = await sendMessageApi({
        conversationId: activeConversation.id,
        sender: 'You',
        content,
        attachments
      });

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversation.id
            ? { ...conversation, messages: [...conversation.messages, savedMessage] }
            : conversation
        )
      );
      setDraftMessage('');
      setSelectedFiles([]);
    } catch (_error) {
      setError('Message could not be sent.');
    }
  };

  if (isLoading) {
    return <main className="app-shell">Loading chats...</main>;
  }

  if (!activeConversation) {
    return (
      <DashboardPage
        groupedConversations={groupedConversations}
        error={error}
        onCreateConversation={createConversation}
      />
    );
  }

  return (
    <ChatPage
      activeConversation={activeConversation}
      draftMessage={draftMessage}
      selectedFiles={selectedFiles}
      fileInputRef={fileInputRef}
      error={error}
      onPickFiles={onPickFiles}
      onDraftChange={setDraftMessage}
      onSendMessage={sendMessage}
    />
  );
}

export default App;
