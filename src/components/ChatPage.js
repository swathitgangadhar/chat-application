import React from 'react';

function ChatPage({
  activeConversation,
  draftMessage,
  selectedFiles,
  fileInputRef,
  error,
  onPickFiles,
  onDraftChange,
  onSendMessage
}) {
  return (
    <main className="app-shell">
      <section className="shadcn-card chat-page">
        <header className="chat-header" style={{ '--accent': activeConversation.accent }}>
          <a className="ghost-button" href="/">← Chats</a>
          <div>
            <h2>{activeConversation.name}</h2>
            <p>
              {activeConversation.type === 'group'
                ? `${activeConversation.participants || 2} participants`
                : 'Individual conversation'}
            </p>
          </div>
        </header>

        {error ? <p className="error-text chat-error">{error}</p> : null}

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
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && onSendMessage()}
          />
          <button className="shadcn-button" onClick={onSendMessage}>Send</button>
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

export default ChatPage;
