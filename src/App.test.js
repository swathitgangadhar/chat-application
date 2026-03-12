import { render, screen } from '@testing-library/react';
import App from './App';

afterEach(() => {
  window.history.pushState({}, '', '/');
});

test('renders conversation sections and open cta', () => {
  render(<App />);
  expect(screen.getByText(/Group conversations/i)).toBeInTheDocument();
  expect(screen.getByText(/Individual conversations/i)).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /Open/i }).length).toBeGreaterThan(0);
});

test('renders chat page with attach button on chat route', () => {
  window.history.pushState({}, '', '/chat/g-1');
  render(<App />);
  expect(screen.getByPlaceholderText(/Type a message/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Add files or photos/i })).toBeInTheDocument();
});
