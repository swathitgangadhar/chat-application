import React, { useMemo, useState } from 'react';
import ConversationSection from './ConversationSection';

const CONTACTS = ['Aisha Khan', 'Rahul Verma', 'Nina Patel', 'Arjun Mehta', 'Sara Ali', 'Daniel Roy'];

function DashboardPage({ groupedConversations, error, onCreateConversation }) {
  const [chatSearch, setChatSearch] = useState('');
  const [showChatPicker, setShowChatPicker] = useState(false);

  const [showGroupBuilder, setShowGroupBuilder] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  const filteredChatContacts = useMemo(
    () => CONTACTS.filter((contact) => contact.toLowerCase().includes(chatSearch.toLowerCase())),
    [chatSearch]
  );

  const filteredGroupContacts = useMemo(
    () => CONTACTS.filter(
      (contact) =>
        contact.toLowerCase().includes(memberSearch.toLowerCase()) &&
        !selectedMembers.includes(contact)
    ),
    [memberSearch, selectedMembers]
  );

  const onCreateDirect = async (name) => {
    await onCreateConversation({ type: 'direct', name });
    setShowChatPicker(false);
    setChatSearch('');
  };

  const onCreateGroup = async () => {
    if (!groupName.trim()) {
      return;
    }

    await onCreateConversation({
      type: 'group',
      name: groupName.trim(),
      members: selectedMembers
    });

    setShowGroupBuilder(false);
    setGroupName('');
    setMemberSearch('');
    setSelectedMembers([]);
  };

  return (
    <main className="app-shell">
      <section className="shadcn-card conversations-page">
        <header className="page-header">
          <div>
            <p className="eyebrow">Chat board</p>
            <h1>Chats</h1>
          </div>
          <div className="actions-row">
            <button
              className="shadcn-button"
              onClick={() => {
                setShowChatPicker((current) => !current);
                setShowGroupBuilder(false);
              }}
            >
              New Chat
            </button>
            <button
              className="shadcn-button secondary"
              onClick={() => {
                setShowGroupBuilder((current) => !current);
                setShowChatPicker(false);
              }}
            >
              New Group
            </button>
          </div>
        </header>

        {showChatPicker ? (
          <section className="picker-card">
            <h3>Start new chat</h3>
            <input
              className="shadcn-input"
              placeholder="Search contact name"
              value={chatSearch}
              onChange={(event) => setChatSearch(event.target.value)}
            />
            <div className="picker-list">
              {filteredChatContacts.map((contact) => (
                <button key={contact} className="picker-item" onClick={() => onCreateDirect(contact)}>
                  {contact}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {showGroupBuilder ? (
          <section className="picker-card">
            <h3>Create new group</h3>
            <input
              className="shadcn-input"
              placeholder="Enter group name"
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
            />
            <input
              className="shadcn-input"
              placeholder="Search members"
              value={memberSearch}
              onChange={(event) => setMemberSearch(event.target.value)}
            />
            <div className="picker-list">
              {filteredGroupContacts.map((contact) => (
                <button
                  key={contact}
                  className="picker-item"
                  onClick={() => setSelectedMembers((current) => [...current, contact])}
                >
                  + {contact}
                </button>
              ))}
            </div>
            {selectedMembers.length ? (
              <div className="selected-members">
                {selectedMembers.map((member) => (
                  <span key={member}>{member}</span>
                ))}
              </div>
            ) : null}
            <button className="shadcn-button" onClick={onCreateGroup}>Create Group</button>
          </section>
        ) : null}

        {error ? <p className="error-text">{error}</p> : null}

        <ConversationSection title="Group conversations" conversations={groupedConversations.groups} />
        <ConversationSection title="Individual conversations" conversations={groupedConversations.direct} />
      </section>
    </main>
  );
}

export default DashboardPage;
