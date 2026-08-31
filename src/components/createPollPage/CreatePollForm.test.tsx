import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as pollApi from '@/api/polls';
import { CreatePollForm } from './CreatePollForm';

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

describe('CreatePollForm Component Logic & Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('given an empty question, when user attempts to submit, then it shows validation error and prevents API call', async () => {
    const createPollSpy = vi.spyOn(pollApi, 'createPoll');
    render(
      <MemoryRouter>
        <CreatePollForm />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /Launch poll/i });
    fireEvent.click(submitButton);

    expect(
      screen.getByText('Enter a question before launching your poll.')
    ).toBeInTheDocument();
    expect(createPollSpy).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('given whitespace-only question, when user submits form, then validation error is shown and submission is aborted', async () => {
    const user = userEvent.setup();
    const createPollSpy = vi.spyOn(pollApi, 'createPoll');

    render(
      <MemoryRouter>
        <CreatePollForm />
      </MemoryRouter>
    );

    const questionInput = screen.getByPlaceholderText(
      'What would you like to ask?'
    );
    await user.type(questionInput, '     ');

    const submitButton = screen.getByRole('button', { name: /Launch poll/i });
    await user.click(submitButton);

    expect(
      screen.getByText('Enter a question before launching your poll.')
    ).toBeInTheDocument();
    expect(createPollSpy).not.toHaveBeenCalled();
  });

  it('given question exceeding 500 characters, when user submits form, then character limit validation error is displayed', () => {
    const createPollSpy = vi.spyOn(pollApi, 'createPoll');
    const { container } = render(
      <MemoryRouter>
        <CreatePollForm />
      </MemoryRouter>
    );

    const questionInput = screen.getByPlaceholderText(
      'What would you like to ask?'
    );
    fireEvent.change(questionInput, { target: { value: 'q'.repeat(501) } });

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    expect(
      screen.getByText('Keep your question to 500 characters or fewer.')
    ).toBeInTheDocument();
    expect(createPollSpy).not.toHaveBeenCalled();
  });

  it('given description exceeding 2000 characters, when user submits form, then description limit validation error is displayed', () => {
    const createPollSpy = vi.spyOn(pollApi, 'createPoll');
    const { container } = render(
      <MemoryRouter>
        <CreatePollForm />
      </MemoryRouter>
    );

    const questionInput = screen.getByPlaceholderText(
      'What would you like to ask?'
    );
    const descriptionInput = screen.getByPlaceholderText(
      'Add helpful context, if you’d like.'
    );

    fireEvent.change(questionInput, { target: { value: 'Valid question?' } });
    fireEvent.change(descriptionInput, { target: { value: 'd'.repeat(2001) } });

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    expect(
      screen.getByText('Keep the description to 2000 characters or fewer.')
    ).toBeInTheDocument();
    expect(createPollSpy).not.toHaveBeenCalled();
  });

  it('given valid question and description, when user submits form, then it creates poll, persists creator token in localStorage, and navigates', async () => {
    const user = userEvent.setup();
    const createPollSpy = vi.spyOn(pollApi, 'createPoll').mockResolvedValueOnce({
      pollId: 'test-poll-id-123',
      creatorToken: 'test-creator-token-456'
    });

    render(
      <MemoryRouter>
        <CreatePollForm />
      </MemoryRouter>
    );

    const questionInput = screen.getByPlaceholderText(
      'What would you like to ask?'
    );
    const descriptionInput = screen.getByPlaceholderText(
      'Add helpful context, if you’d like.'
    );

    await user.type(questionInput, 'What is your favourite programming language?');
    await user.type(descriptionInput, 'Feel free to explain why.');

    const submitButton = screen.getByRole('button', { name: /Launch poll/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(createPollSpy).toHaveBeenCalledWith({
        question: 'What is your favourite programming language?',
        description: 'Feel free to explain why.'
      });
      expect(localStorage.getItem('aethelgard-voice-test-poll-id-123')).toBe(
        'test-creator-token-456'
      );
      expect(mockNavigate).toHaveBeenCalledWith('/polls/test-poll-id-123');
    });
  });

  it('given API failure on submission, when user submits form, then error banner is displayed', async () => {
    const user = userEvent.setup();
    vi.spyOn(pollApi, 'createPoll').mockRejectedValueOnce(
      new Error('Network error')
    );

    render(
      <MemoryRouter>
        <CreatePollForm />
      </MemoryRouter>
    );

    const questionInput = screen.getByPlaceholderText(
      'What would you like to ask?'
    );
    await user.type(questionInput, 'Valid Question?');

    const submitButton = screen.getByRole('button', { name: /Launch poll/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'We couldn’t launch your poll just now. Your words are safe, please try again.'
        )
      ).toBeInTheDocument();
    });
  });
});
