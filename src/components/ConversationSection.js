import React from 'react';

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
                <small>{lastMessage?.content || 'No messages yet'}</small>
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

export default ConversationSection;
