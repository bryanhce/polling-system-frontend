import { renderHook, act, waitFor } from '@testing-library/react';
import { AxiosError, type AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as pollApi from '@/api/polls';
import type { SSECallbacks } from '@/api/pollEvents';
import { useActivePollPage } from './useActivePollPage';

let currentPollId: string | undefined = 'poll-123';

vi.mock('react-router', () => ({
  useParams: () => ({ pollId: currentPollId }),
}));

vi.mock('@/api/pollEvents', () => ({
  subscribeToPollEvents: vi.fn(),
}));

import { subscribeToPollEvents } from '@/api/pollEvents';

const mockSubscribe = vi.mocked(subscribeToPollEvents);

function createAxiosError(status: number): AxiosError {
  const error = new AxiosError(`Request failed with status code ${status}`);
  error.response = { status } as AxiosResponse;
  return error;
}

let capturedCallbacks: SSECallbacks;
let mockUnsubscribe: ReturnType<typeof vi.fn>;

describe('useActivePollPage Hook Logic & Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    currentPollId = 'poll-123';
    mockUnsubscribe = vi.fn();
    mockSubscribe.mockImplementation((_pollId, callbacks) => {
      capturedCallbacks = callbacks;
      return mockUnsubscribe;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('given an active poll ID, when hook mounts, then it fetches poll and answers, opens SSE connection, and transitions to ready pageState', async () => {
    vi.spyOn(pollApi, 'getPoll').mockResolvedValueOnce({
      pollId: 'poll-123',
      question: 'Favorite food?',
      description: 'Open discussion',
      status: 'active',
    });
    vi.spyOn(pollApi, 'getPollAnswers').mockResolvedValueOnce([
      { answer: 'Pasta' },
      { answer: 'Burgers' },
    ]);

    const { result } = renderHook(() => useActivePollPage());

    expect(result.current.pageState).toBe('loading');

    await waitFor(() => {
      expect(result.current.pageState).toBe('ready');
    });

    expect(result.current.poll).toEqual({
      pollId: 'poll-123',
      question: 'Favorite food?',
      description: 'Open discussion',
      status: 'active',
    });
    expect(result.current.answers).toEqual([
      { answer: 'Pasta' },
      { answer: 'Burgers' },
    ]);
    expect(result.current.canLoadMore).toBe(false);
    expect(mockSubscribe).toHaveBeenCalledWith('poll-123', expect.any(Object));
  });

  it('given an active poll with SSE connected, when an answer event is emitted, then new answer is prepended', async () => {
    vi.spyOn(pollApi, 'getPoll').mockResolvedValueOnce({
      pollId: 'poll-123',
      question: 'Favorite food?',
      status: 'active',
    });
    vi.spyOn(pollApi, 'getPollAnswers').mockResolvedValueOnce([
      { answer: 'Initial answer' },
    ]);

    const { result } = renderHook(() => useActivePollPage());

    await waitFor(() => {
      expect(result.current.pageState).toBe('ready');
    });

    expect(mockSubscribe).toHaveBeenCalledTimes(1);

    act(() => {
      capturedCallbacks.onAnswer?.({ answer: 'Streamed pizza' });
    });

    expect(result.current.answers).toEqual([
      { answer: 'Streamed pizza' },
      { answer: 'Initial answer' },
    ]);
  });

  it('given an active poll with SSE connected, when a poll_closed event is emitted, then status transitions to closed and SSE is closed', async () => {
    vi.spyOn(pollApi, 'getPoll').mockResolvedValueOnce({
      pollId: 'poll-123',
      question: 'Favorite food?',
      status: 'active',
    });
    vi.spyOn(pollApi, 'getPollAnswers').mockResolvedValueOnce([
      { answer: 'First' },
    ]);

    const { result } = renderHook(() => useActivePollPage());

    await waitFor(() => {
      expect(result.current.pageState).toBe('ready');
    });

    expect(mockSubscribe).toHaveBeenCalledTimes(1);

    act(() => {
      capturedCallbacks.onPollClosed?.();
    });

    expect(result.current.poll?.status).toBe('closed');
    expect(result.current.closedMessage).toBe(
      'This poll is closed. The final answers are below.'
    );
  });

  it('given an initial closed poll, when hook mounts, then EventSource is not opened', async () => {
    vi.spyOn(pollApi, 'getPoll').mockResolvedValueOnce({
      pollId: 'poll-123',
      question: 'Favorite food?',
      status: 'closed',
    });
    vi.spyOn(pollApi, 'getPollAnswers').mockResolvedValueOnce([
      { answer: 'Past answer' },
    ]);

    const { result } = renderHook(() => useActivePollPage());

    await waitFor(() => {
      expect(result.current.pageState).toBe('ready');
    });

    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  it('given an active SSE connection, when component unmounts, then EventSource is closed', async () => {
    vi.spyOn(pollApi, 'getPoll').mockResolvedValueOnce({
      pollId: 'poll-123',
      question: 'Favorite food?',
      status: 'active',
    });
    vi.spyOn(pollApi, 'getPollAnswers').mockResolvedValueOnce([]);

    const { result, unmount } = renderHook(() => useActivePollPage());

    await waitFor(() => {
      expect(result.current.pageState).toBe('ready');
    });

    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    expect(mockUnsubscribe).not.toHaveBeenCalled();

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('given a 404 response on initial fetch, when hook mounts, then pageState is set to not-found', async () => {
    vi.spyOn(pollApi, 'getPoll').mockRejectedValueOnce(createAxiosError(404));
    vi.spyOn(pollApi, 'getPollAnswers').mockResolvedValueOnce([]);

    const { result } = renderHook(() => useActivePollPage());

    await waitFor(() => {
      expect(result.current.pageState).toBe('not-found');
    });
  });

  it('given a 500 server error on initial fetch, when hook mounts, then pageState is set to error', async () => {
    vi.spyOn(pollApi, 'getPoll').mockRejectedValueOnce(createAxiosError(500));
    vi.spyOn(pollApi, 'getPollAnswers').mockResolvedValueOnce([]);

    const { result } = renderHook(() => useActivePollPage());

    await waitFor(() => {
      expect(result.current.pageState).toBe('error');
    });
  });

  it('given a valid answer, when handleAnswerSubmit is called, then answer is submitted and hasAnswered is set to true', async () => {
    vi.spyOn(pollApi, 'getPoll').mockResolvedValue({
      pollId: 'poll-123',
      question: 'Favorite food?',
      status: 'active',
    });
    vi.spyOn(pollApi, 'getPollAnswers').mockResolvedValueOnce([
      { answer: 'Pizza' },
    ]);

    const submitSpy = vi
      .spyOn(pollApi, 'submitPollAnswer')
      .mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useActivePollPage());

    await waitFor(() => {
      expect(result.current.pageState).toBe('ready');
    });

    await act(async () => {
      await result.current.handleAnswerSubmit('Sushi', true);
    });

    expect(submitSpy).toHaveBeenCalledWith('poll-123', 'Sushi');
    expect(result.current.hasAnswered).toBe(true);
    expect(result.current.focusConfirmation).toBe(true);
  });

  it('given a closed poll responding with 403, when handleAnswerSubmit is called, then poll status transitions to closed and closedMessage is set', async () => {
    vi.spyOn(pollApi, 'getPoll').mockResolvedValueOnce({
      pollId: 'poll-123',
      question: 'Favorite food?',
      status: 'active',
    });
    vi.spyOn(pollApi, 'getPollAnswers').mockResolvedValueOnce([]);
    vi.spyOn(pollApi, 'submitPollAnswer').mockRejectedValueOnce(
      createAxiosError(403)
    );

    const { result } = renderHook(() => useActivePollPage());

    await waitFor(() => {
      expect(result.current.pageState).toBe('ready');
    });

    await act(async () => {
      await result.current.handleAnswerSubmit('Late submission', false);
    });

    expect(result.current.poll?.status).toBe('closed');
    expect(result.current.closedMessage).toBe(
      'This poll just closed. You can still read the final answers.'
    );
    expect(result.current.hasAnswered).toBe(false);
  });

  it('given a server error during answer submission, when handleAnswerSubmit is called, then answerError is populated', async () => {
    vi.spyOn(pollApi, 'getPoll').mockResolvedValueOnce({
      pollId: 'poll-123',
      question: 'Favorite food?',
      status: 'active',
    });
    vi.spyOn(pollApi, 'getPollAnswers').mockResolvedValueOnce([]);
    vi.spyOn(pollApi, 'submitPollAnswer').mockRejectedValueOnce(
      createAxiosError(500)
    );

    const { result } = renderHook(() => useActivePollPage());

    await waitFor(() => {
      expect(result.current.pageState).toBe('ready');
    });

    await act(async () => {
      await result.current.handleAnswerSubmit('My answer', false);
    });

    expect(result.current.answerError).toBe(
      'We couldn’t send your answer just now. Your words are still here, please try again.'
    );
  });

  it('given an active poll and a creator token in localStorage, when handleClosePoll is called, then it closes the poll and cleans up the token', async () => {
    localStorage.setItem('aethelgard-voice-poll-123', 'secret-creator-token');

    vi.spyOn(pollApi, 'getPoll').mockResolvedValueOnce({
      pollId: 'poll-123',
      question: 'Favorite food?',
      status: 'active',
    });
    vi.spyOn(pollApi, 'getPollAnswers').mockResolvedValueOnce([]);
    const closeSpy = vi
      .spyOn(pollApi, 'closePoll')
      .mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useActivePollPage());

    await waitFor(() => {
      expect(result.current.pageState).toBe('ready');
    });

    expect(result.current.canClose).toBe(true);

    await act(async () => {
      await result.current.handleClosePoll();
    });

    expect(closeSpy).toHaveBeenCalledWith('poll-123', 'secret-creator-token');
    expect(localStorage.getItem('aethelgard-voice-poll-123')).toBeNull();
    expect(result.current.poll?.status).toBe('closed');
    expect(result.current.closedMessage).toBe(
      'This poll is closed. The final answers are below.'
    );
    expect(result.current.canClose).toBe(false);
  });

  it('given an already closed poll returning 409, when handleClosePoll is called, then poll status is updated and dialog is dismissed', async () => {
    localStorage.setItem('aethelgard-voice-poll-123', 'secret-creator-token');

    vi.spyOn(pollApi, 'getPoll').mockResolvedValueOnce({
      pollId: 'poll-123',
      question: 'Favorite food?',
      status: 'active',
    });
    vi.spyOn(pollApi, 'getPollAnswers').mockResolvedValueOnce([]);
    vi.spyOn(pollApi, 'closePoll').mockRejectedValueOnce(createAxiosError(409));

    const { result } = renderHook(() => useActivePollPage());

    await waitFor(() => {
      expect(result.current.pageState).toBe('ready');
    });

    await act(async () => {
      await result.current.handleClosePoll();
    });

    expect(localStorage.getItem('aethelgard-voice-poll-123')).toBeNull();
    expect(result.current.poll?.status).toBe('closed');
    expect(result.current.closedMessage).toBe(
      'This poll was already closed. The final answers are below.'
    );
  });

  it('given an invalid creator token returning 403, when handleClosePoll is called, then closeError is displayed', async () => {
    localStorage.setItem('aethelgard-voice-poll-123', 'invalid-token');

    vi.spyOn(pollApi, 'getPoll').mockResolvedValueOnce({
      pollId: 'poll-123',
      question: 'Favorite food?',
      status: 'active',
    });
    vi.spyOn(pollApi, 'getPollAnswers').mockResolvedValueOnce([]);
    vi.spyOn(pollApi, 'closePoll').mockRejectedValueOnce(createAxiosError(403));

    const { result } = renderHook(() => useActivePollPage());

    await waitFor(() => {
      expect(result.current.pageState).toBe('ready');
    });

    await act(async () => {
      await result.current.handleClosePoll();
    });

    expect(localStorage.getItem('aethelgard-voice-poll-123')).toBeNull();
    expect(result.current.closeError).toBe(
      'Only this poll’s creator can close it.'
    );
  });

  it('given clipboard write success, when handleCopyLink is called, then copyLabel transitions to Link copied', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    const { result } = renderHook(() => useActivePollPage());

    await act(async () => {
      await result.current.handleCopyLink();
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      window.location.href
    );
    expect(result.current.copyLabel).toBe('Link copied');
  });

  it('given clipboard write failure, when handleCopyLink is called, then copyLabel transitions to Couldn’t copy', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('Permission denied')),
      },
    });

    const { result } = renderHook(() => useActivePollPage());

    await act(async () => {
      await result.current.handleCopyLink();
    });

    expect(result.current.copyLabel).toBe('Couldn’t copy');
  });

  it('given an in-flight loadInitial, when component unmounts, then the requests are aborted and pageState does not become error', async () => {
    let capturedPollSignal: AbortSignal | undefined;
    let capturedAnswersSignal: AbortSignal | undefined;

    vi.spyOn(pollApi, 'getPoll').mockImplementation((_id, signal) => {
      capturedPollSignal = signal;
      return new Promise((_resolve, reject) => {
        signal?.addEventListener('abort', () => {
          const cancelError = new AxiosError('canceled', 'ERR_CANCELED');
          reject(cancelError);
        });
      });
    });

    vi.spyOn(pollApi, 'getPollAnswers').mockImplementation(
      (_id, _limit, _offset, signal) => {
        capturedAnswersSignal = signal;
        return new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () => {
            const cancelError = new AxiosError('canceled', 'ERR_CANCELED');
            reject(cancelError);
          });
        });
      }
    );

    const { result, unmount } = renderHook(() => useActivePollPage());

    expect(result.current.pageState).toBe('loading');
    expect(capturedPollSignal).toBeDefined();
    expect(capturedPollSignal?.aborted).toBe(false);
    expect(capturedAnswersSignal).toBeDefined();
    expect(capturedAnswersSignal?.aborted).toBe(false);

    unmount();

    expect(capturedPollSignal?.aborted).toBe(true);
    expect(capturedAnswersSignal?.aborted).toBe(true);
    expect(result.current.pageState).toBe('loading');
  });

  it('given an in-flight refresh triggered after answer submission, when component unmounts, then the request is aborted and feedError is not set', async () => {
    vi.spyOn(pollApi, 'getPoll').mockResolvedValue({
      pollId: 'poll-123',
      question: 'Favorite food?',
      status: 'active',
    });
    vi.spyOn(pollApi, 'getPollAnswers').mockResolvedValueOnce([
      { answer: 'Pasta' },
    ]);
    vi.spyOn(pollApi, 'submitPollAnswer').mockResolvedValueOnce(undefined);

    const { result, unmount } = renderHook(() => useActivePollPage());

    await waitFor(() => {
      expect(result.current.pageState).toBe('ready');
    });

    let refreshSignal: AbortSignal | undefined;
    vi.spyOn(pollApi, 'getPollAnswers').mockImplementation(
      (_id, _limit, _offset, signal) => {
        refreshSignal = signal;
        return new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () => {
            const cancelError = new AxiosError('canceled', 'ERR_CANCELED');
            reject(cancelError);
          });
        });
      }
    );

    void act(() => {
      void result.current.handleAnswerSubmit('Sushi', false);
    });

    await waitFor(() => {
      expect(refreshSignal).toBeDefined();
    });
    expect(refreshSignal?.aborted).toBe(false);

    unmount();

    expect(refreshSignal?.aborted).toBe(true);
    expect(result.current.feedError).toBe('');
  });

  it('given an in-flight loadMoreAnswers, when component unmounts, then the request is aborted and feedError is not set', async () => {
    vi.spyOn(pollApi, 'getPoll').mockResolvedValue({
      pollId: 'poll-123',
      question: 'Favorite food?',
      status: 'active',
    });
    vi.spyOn(pollApi, 'getPollAnswers').mockResolvedValueOnce(
      Array.from({ length: 20 }, (_, index) => ({ answer: `Answer ${index}` }))
    );

    const { result, unmount } = renderHook(() => useActivePollPage());

    await waitFor(() => {
      expect(result.current.pageState).toBe('ready');
    });

    expect(result.current.canLoadMore).toBe(true);

    let loadMoreSignal: AbortSignal | undefined;
    vi.spyOn(pollApi, 'getPollAnswers').mockImplementation(
      (_id, _limit, _offset, signal) => {
        loadMoreSignal = signal;
        return new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () => {
            const cancelError = new AxiosError('canceled', 'ERR_CANCELED');
            reject(cancelError);
          });
        });
      }
    );

    void act(() => {
      void result.current.loadMoreAnswers();
    });

    expect(loadMoreSignal).toBeDefined();
    expect(loadMoreSignal?.aborted).toBe(false);

    unmount();

    expect(loadMoreSignal?.aborted).toBe(true);
    expect(result.current.feedError).toBe('');
  });
});
