import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login screen', () => {
  render(<App />);
  const titleElement = screen.getByText(/EtherX/i);
  expect(titleElement).toBeInTheDocument();
});
