import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usePollEvents } from './usePollEvents';
import type { SSECallbacks } from '@/api/pollEvents';

vi.mock('@/api/pollEvents', () => ({
  subscribeToPollEvents: vi.fn(),
}));

import { subscribeToPollEvents } from '@/api/pollEvents';

const mockSubscribe = vi.mocked(subscribeToPollEvents);

describe('usePollEvents Hook', () => {
  let capturedCallbacks: SSECallbacks;
  let mockUnsubscribe: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUnsubscribe = vi.fn();
    mockSubscribe.mockImplementation((_pollId, callbacks) => {
      capturedCallbacks = callbacks;
      return mockUnsubscribe;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('given enabled is false, when hook mounts, then it does not subscribe', () => {
    renderHook(() =>
      usePollEvents({
        pollId: 'poll-123',
        enabled: false,
      })
    );

    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  it('given no pollId, when hook mounts, then it does not subscribe', () => {
    renderHook(() =>
      usePollEvents({
        pollId: undefined,
        enabled: true,
      })
    );

    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  it('given valid pollId and enabled is true, when hook mounts, then it subscribes to poll events', () => {
    renderHook(() =>
      usePollEvents({
        pollId: 'poll-abc',
        enabled: true,
      })
    );

    expect(mockSubscribe).toHaveBeenCalledWith('poll-abc', expect.any(Object));
  });

  it('given active subscription, when answer event arrives, then onAnswer callback is invoked with parsed data', () => {
    const onAnswer = vi.fn();

    renderHook(() =>
      usePollEvents({
        pollId: 'poll-abc',
        enabled: true,
        onAnswer,
      })
    );

    expect(mockSubscribe).toHaveBeenCalledTimes(1);

    act(() => {
      capturedCallbacks.onAnswer?.({ answer: 'Delicious Tacos' });
    });

    expect(onAnswer).toHaveBeenCalledWith({ answer: 'Delicious Tacos' });
  });

  it('given active subscription, when poll_closed event arrives, then onPollClosed is called', () => {
    const onPollClosed = vi.fn();

    renderHook(() =>
      usePollEvents({
        pollId: 'poll-abc',
        enabled: true,
        onPollClosed,
      })
    );

    expect(mockSubscribe).toHaveBeenCalledTimes(1);

    act(() => {
      capturedCallbacks.onPollClosed?.();
    });

    expect(onPollClosed).toHaveBeenCalled();
  });

  it('given active subscription, when component unmounts, then unsubscribe is called', () => {
    const { unmount } = renderHook(() =>
      usePollEvents({
        pollId: 'poll-abc',
        enabled: true,
      })
    );

    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    expect(mockUnsubscribe).not.toHaveBeenCalled();

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
