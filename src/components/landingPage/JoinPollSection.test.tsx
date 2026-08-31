import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { JoinPollSection } from './JoinPollSection';

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>(
    'react-router'
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('JoinPollSection Logic & Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('given an empty reference input, when form is submitted, then error is displayed and navigation is aborted', () => {
    render(
      <MemoryRouter>
        <JoinPollSection />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /Join poll/i });
    fireEvent.click(submitButton);

    expect(
      screen.getByText('Enter a poll ID or a complete link to a poll.')
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('given invalid characters or malformed link format, when form is submitted, then error message is shown', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <JoinPollSection />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Paste your poll link');
    await user.type(input, 'invalid @#$% characters');

    const submitButton = screen.getByRole('button', { name: /Join poll/i });
    await user.click(submitButton);

    expect(
      screen.getByText('Enter a poll ID or a complete link to a poll.')
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('given a valid alphanumeric poll ID, when form is submitted, then it navigates to that poll page', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <JoinPollSection />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Paste your poll link');
    await user.type(input, 'poll-123_abc');

    const submitButton = screen.getByRole('button', { name: /Join poll/i });
    await user.click(submitButton);

    expect(mockNavigate).toHaveBeenCalledWith('/polls/poll-123_abc');
  });

  it('given a full URL link, when form is submitted, then it extracts the poll ID and navigates', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <JoinPollSection />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Paste your poll link');
    await user.type(
      input,
      'http://localhost:5173/polls/123e4567-e89b-12d3-a456-426614174000'
    );

    const submitButton = screen.getByRole('button', { name: /Join poll/i });
    await user.click(submitButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      '/polls/123e4567-e89b-12d3-a456-426614174000'
    );
  });

  it('given an active error message, when user types into the input, then the error message is cleared', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <JoinPollSection />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /Join poll/i });
    await user.click(submitButton);

    expect(
      screen.getByText('Enter a poll ID or a complete link to a poll.')
    ).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Paste your poll link');
    await user.type(input, 'a');

    expect(
      screen.queryByText('Enter a poll ID or a complete link to a poll.')
    ).not.toBeInTheDocument();
  });
});
