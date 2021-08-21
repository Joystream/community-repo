import React from 'react';
import { render, screen } from '@testing-library/react';
import LiveStatsWS from './LiveStatsWS';

test('renders learn react link', () => {
  render(<LiveStatsWS />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
