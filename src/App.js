import React, { useMemo, useRef, useState } from 'react';
import './App.css';

const seedConversations = [
  {
    id: 'g-1',
    type: 'group',
    name: 'Family Group',
    participants: 6,
    accent: '#22c55e',
    messages: [
      { id: 1, sender: 'Mom', content: 'Dinner is ready at 8 PM 🍽️', time: '7:12 PM', attachments: [] },
      { id: 2, sender: 'You', content: 'Awesome! I will be there.', time: '7:15 PM', attachments: [] }
    ]
  },
  {
    id: 'g-2',
    type: 'group',
    name: 'Project Phoenix',
    participants: 9,
    accent: '#2563eb',
    messages: [
      { id: 1, sender: 'Aisha', content: 'Can we push the release to Friday?', time: '9:02 AM', attachments: [] },
      { id: 2, sender: 'You', content: 'Yes, I am updating the timeline now.', time: '9:08 AM', attachments: [] }
    ]
  },
  {
    id: 'd-1',
    type: 'direct',
    name: 'Rahul',
    accent: '#f97316',
    messages: [
      { id: 1, sender: 'Rahul', content: 'Are we still on for coffee?', time: '11:50 AM', attachments: [] },
      { id: 2, sender: 'You', content: 'Yep! Let us meet at 5 ☕', time: '11:55 AM', attachments: [] }
    ]
  },
  {
    id: 'd-2',
    type: 'direct',
    name: 'Design Team',
    accent: '#a855f7',
    messages: [
      { id: 1, sender: 'Nina', content: 'Shared the latest UI file in Figma.', time: '2:11 PM', attachments: [] }
    ]
  }
];

const getConversationFromPath = () => {
  const match = window.location.pathname.match(/^\/chat\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
};

function App() {
  const [conversations, setConversations] = useState(seedConversations);
  const [draftMessage, setDraftMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeConversationId] = useState(getConversationFromPath);
  const fileInputRef = useRef(null);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId),
    [activeConversationId, conversations]
  );

  const groupedConversations = useMemo(
    () => ({
      groups: conversations.filter((conversation) => conversation.type === 'group'),
      direct: conversations.filter((conversation) => conversation.type === 'direct')
    }),
    [conversations]
  );

  const onPickFiles = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    setSelectedFiles((current) => [...current, ...files]);
    event.target.value = '';
  };

  const sendMessage = () => {
    const content = draftMessage.trim();
    if ((!content && selectedFiles.length === 0) || !activeConversation) {
      return;
    }

    const attachments = selectedFiles.map((file) => ({
      name: file.name,
      type: file.type || 'file'
    }));

    setConversations((current) =>
      current.map((conversation) => {
        if (conversation.id !== activeConversation.id) {
          return conversation;
        }

        return {
          ...conversation,
          messages: [
            ...conversation.messages,
            {
              id: conversation.messages.length + 1,
              sender: 'You',
              content,
              attachments,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      })
    );

    setDraftMessage('');
    setSelectedFiles([]);
  };

  if (!activeConversation) {
    return (
      <main className="app-shell">
        <section className="shadcn-card conversations-page">
          <header className="page-header">
            <div>
              <p className="eyebrow">WhatsApp style</p>
              <h1>Chats</h1>
            </div>
            <span className="badge">Online</span>
          </header>

          <ConversationSection title="Group conversations" conversations={groupedConversations.groups} />
          <ConversationSection title="Individual conversations" conversations={groupedConversations.direct} />
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="shadcn-card chat-page">
        <header className="chat-header" style={{ '--accent': activeConversation.accent }}>
          <a className="ghost-button" href="/">← Chats</a>
          <div>
            <h2>{activeConversation.name}</h2>
            <p>
              {activeConversation.type === 'group'
                ? `${activeConversation.participants} participants`
                : 'Individual conversation'}
            </p>
          </div>
        </header>

        <div className="messages-panel">
          {activeConversation.messages.map((message) => (
            <article key={message.id} className={`message-bubble ${message.sender === 'You' ? 'mine' : ''}`}>
              <strong>{message.sender}</strong>
              {message.content ? <p>{message.content}</p> : null}
              {message.attachments?.length ? (
                <ul className="attachments-list">
                  {message.attachments.map((attachment) => (
                    <li key={`${message.id}-${attachment.name}`}>{attachment.name}</li>
                  ))}
                </ul>
              ) : null}
              <span>{message.time}</span>
            </article>
          ))}
        </div>

        <footer className="composer">
          <button className="add-button" onClick={() => fileInputRef.current?.click()} aria-label="Add files or photos">
            +
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden-file-input"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
            onChange={onPickFiles}
          />
          <input
            className="shadcn-input"
            placeholder="Type a message..."
            value={draftMessage}
            autoFocus
            onChange={(event) => setDraftMessage(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && sendMessage()}
          />
          <button className="shadcn-button" onClick={sendMessage}>Send</button>
        </footer>
        {selectedFiles.length ? (
          <div className="selected-files">
            {selectedFiles.map((file) => (
              <span key={`${file.name}-${file.size}`}>{file.name}</span>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}

function ConversationSection({ title, conversations }) {
  return (
    <section className="conversation-group">
      <h2>{title}</h2>
      <div className="conversation-list">
        {conversations.map((conversation) => {
          const lastMessage = conversation.messages[conversation.messages.length - 1];

          return (
            <article
              key={conversation.id}
              className="conversation-item"
              style={{ '--accent': conversation.accent }}
            >
              <span className="avatar">{conversation.name.slice(0, 2).toUpperCase()}</span>
              <span className="content">
                <strong>{conversation.name}</strong>
                <small>{lastMessage.content}</small>
              </span>
              <a
                className="meta"
                href={`/chat/${conversation.id}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${conversation.name}`}
              >
                Open
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default App;
