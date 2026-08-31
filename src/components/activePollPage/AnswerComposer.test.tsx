import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AnswerComposer } from './AnswerComposer';

describe('AnswerComposer Component Logic & Edge Cases', () => {
  it('given an empty initial state, when component renders, then submit button is disabled and counter shows 0/1000', () => {
    render(<AnswerComposer isSubmitting={false} error="" onSubmit={vi.fn()} />);

    const textarea = screen.getByPlaceholderText('Share your thoughts…');
    const submitButton = screen.getByRole('button', { name: /Send answer/i });

    expect(textarea).toHaveValue('');
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('0/1000')).toBeInTheDocument();
  });

  it('given whitespace-only input, when user types spaces, then submit button remains disabled', async () => {
    const user = userEvent.setup();
    render(<AnswerComposer isSubmitting={false} error="" onSubmit={vi.fn()} />);

    const textarea = screen.getByPlaceholderText('Share your thoughts…');
    const submitButton = screen.getByRole('button', { name: /Send answer/i });

    await user.type(textarea, '     ');
    expect(submitButton).toBeDisabled();
  });

  it('given an empty textarea, when user blurs the input, then it displays the required field validation error', async () => {
    const user = userEvent.setup();
    render(<AnswerComposer isSubmitting={false} error="" onSubmit={vi.fn()} />);

    const textarea = screen.getByPlaceholderText('Share your thoughts…');
    await user.click(textarea);
    await user.tab();

    expect(
      screen.getByText('Write an answer before sending it.')
    ).toBeInTheDocument();
  });

  it('given an empty answer, when form submit is triggered, then it blocks submission and displays error message', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <AnswerComposer isSubmitting={false} error="" onSubmit={onSubmit} />
    );

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    expect(
      screen.getByText('Write an answer before sending it.')
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('given valid input text, when user clicks submit, then onSubmit is called with trimmed answer and initiatedWithKeyboard false', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <AnswerComposer isSubmitting={false} error="" onSubmit={onSubmit} />
    );

    const textarea = screen.getByPlaceholderText('Share your thoughts…');
    const submitButton = screen.getByRole('button', { name: /Send answer/i });

    await user.type(textarea, '  This is my thoughtful response  ');
    expect(screen.getByText('34/1000')).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();

    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('This is my thoughtful response', false);
  });

  it('given valid input, when user submits via Enter key on the submit button, then onSubmit is called with initiatedWithKeyboard true', async () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <AnswerComposer isSubmitting={false} error="" onSubmit={onSubmit} />
    );

    const textarea = screen.getByPlaceholderText('Share your thoughts…');
    fireEvent.change(textarea, { target: { value: 'Keyboard submit text' } });

    const submitButton = screen.getByRole('button', { name: /Send answer/i });
    fireEvent.keyDown(submitButton, { key: 'Enter' });

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    expect(onSubmit).toHaveBeenCalledWith('Keyboard submit text', true);
  });

  it('given text exceeding 1000 characters, when form submit is triggered, then it displays character limit error and disables submit', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <AnswerComposer isSubmitting={false} error="" onSubmit={onSubmit} />
    );

    const textarea = screen.getByPlaceholderText('Share your thoughts…');
    const longText = 'a'.repeat(1001);
    fireEvent.change(textarea, { target: { value: longText } });

    const submitButton = screen.getByRole('button', { name: /Send answer/i });
    expect(submitButton).toBeDisabled();

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    expect(
      screen.getByText('Keep your answer to 1000 characters or fewer.')
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('given an external error prop, when component renders, then it displays the error alert', () => {
    render(
      <AnswerComposer
        isSubmitting={false}
        error="Server failed to accept answer."
        onSubmit={vi.fn()}
      />
    );

    expect(
      screen.getByText('Server failed to accept answer.')
    ).toBeInTheDocument();
  });

  it('given isSubmitting true, when component renders, then submit button is disabled and shows loading indicator text', () => {
    render(<AnswerComposer isSubmitting={true} error="" onSubmit={vi.fn()} />);

    const submitButton = screen.getByRole('button', {
      name: /Sending answer…/i
    });
    expect(submitButton).toBeDisabled();
  });
});
