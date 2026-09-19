import { describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/client';
import {
  closePoll,
  createPoll,
  getPoll,
  getPollAnswers,
  submitPollAnswer,
} from './polls';

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('polls API', () => {
  it('passes signal to apiClient.get in getPoll', async () => {
    const controller = new AbortController();
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        pollId: 'p1',
        question: 'Q',
        status: 'active',
      },
    });

    const result = await getPoll('p1', controller.signal);
    expect(result.pollId).toBe('p1');
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/polls/p1', {
      signal: controller.signal,
    });
  });

  it('passes signal and params to apiClient.get in getPollAnswers', async () => {
    const controller = new AbortController();
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { answers: [{ answer: 'A' }] },
    });

    const result = await getPollAnswers('p1', 20, 0, controller.signal);
    expect(result).toEqual([{ answer: 'A' }]);
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/polls/p1/answers', {
      params: { limit: 20, offset: 0 },
      signal: controller.signal,
    });
  });

  it('passes signal to apiClient.post in createPoll', async () => {
    const controller = new AbortController();
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { pollId: 'p1', creatorToken: 'tok' },
    });

    const result = await createPoll(
      { question: 'Q', description: 'D' },
      controller.signal
    );
    expect(result.pollId).toBe('p1');
    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/v1/polls',
      { question: 'Q', description: 'D' },
      { signal: controller.signal }
    );
  });

  it('passes signal to apiClient.post in submitPollAnswer', async () => {
    const controller = new AbortController();
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: {} });

    await submitPollAnswer('p1', 'Ans', controller.signal);
    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/v1/polls/p1/answers',
      { answer: 'Ans' },
      { signal: controller.signal }
    );
  });

  it('passes signal and creatorToken header to apiClient.patch in closePoll', async () => {
    const controller = new AbortController();
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: {} });

    await closePoll('p1', 'tok-123', controller.signal);
    expect(apiClient.patch).toHaveBeenCalledWith(
      '/api/v1/polls/p1/close',
      undefined,
      {
        headers: { 'x-creator-token': 'tok-123' },
        signal: controller.signal,
      }
    );
  });
});
