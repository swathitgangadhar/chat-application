import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => {
  global.fetch = jest.fn((url, options) => {
    if (!options && url === '/api/conversations') {
      return Promise.resolve({
        ok: true,
        json: async () => ([
          {
            id: 'g-1',
            type: 'group',
            name: 'Family Group',
            participants: 5,
            accent: '#22c55e',
            messages: [{ id: 1, sender: 'Mom', content: 'Hello', time: '7:12 PM', attachments: [] }]
          },
          {
            id: 'd-1',
            type: 'direct',
            name: 'Rahul',
            accent: '#f97316',
            messages: [{ id: 1, sender: 'Rahul', content: 'Hey', time: '7:12 PM', attachments: [] }]
          }
        ])
      });
    }

    if (url === '/api/conversations' && options?.method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          id: 'd-99',
          type: 'direct',
          name: 'Aisha Khan',
          accent: '#f97316',
          messages: []
        })
      });
    }

    if (url === '/api/conversations/g-1/messages') {
      return Promise.resolve({
        ok: true,
        json: async () => ({ id: 2, sender: 'You', content: 'Sent', attachments: [], time: '08:00 PM' })
      });
    }

    return Promise.resolve({ ok: true, json: async () => ({}) });
  });
});

afterEach(() => {
  window.history.pushState({}, '', '/');
  jest.resetAllMocks();
});

test('new chat cta opens searchable contacts and selecting creates a chat', async () => {
  render(<App />);

  expect(await screen.findByText(/Group conversations/i)).toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: /New Chat/i }));

  expect(screen.getByPlaceholderText(/Search contact name/i)).toBeInTheDocument();
  userEvent.type(screen.getByPlaceholderText(/Search contact name/i), 'Aisha');
  userEvent.click(screen.getByRole('button', { name: /Aisha Khan/i }));

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/conversations',
      expect.objectContaining({ method: 'POST' })
    );
  });
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /Aisha Khan/i })).toBeInTheDocument();
  });
});

test('renders chat page with attach button on chat route', async () => {
  window.history.pushState({}, '', '/chat/g-1');
  render(<App />);

  await waitFor(() => expect(screen.getByPlaceholderText(/Type a message/i)).toBeInTheDocument());
  expect(screen.getByRole('button', { name: /Add files or photos/i })).toBeInTheDocument();
});
