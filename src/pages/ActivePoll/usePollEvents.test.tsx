import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usePollEvents } from './usePollEvents';

class MockEventSource {
  url: string;
  listeners: Record<string, ((event: MessageEvent) => void)[]> = {};
  closed = false;

  constructor(url: string) {
    this.url = url;
    mockEventSourceInstances.push(this);
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: (event: MessageEvent) => void) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter((l) => l !== listener);
    }
  }

  close() {
    this.closed = true;
  }

  emit(type: string, data: unknown) {
    const event = {
      data: typeof data === 'string' ? data : JSON.stringify(data),
    } as MessageEvent;
    this.listeners[type]?.forEach((listener) => listener(event));
  }
}

let mockEventSourceInstances: MockEventSource[] = [];

describe('usePollEvents Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEventSourceInstances = [];
    vi.stubGlobal('EventSource', MockEventSource);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('given enabled is false, when hook mounts, then it does not create EventSource', () => {
    renderHook(() =>
      usePollEvents({
        pollId: 'poll-123',
        enabled: false,
      })
    );

    expect(mockEventSourceInstances).toHaveLength(0);
  });

  it('given no pollId, when hook mounts, then it does not create EventSource', () => {
    renderHook(() =>
      usePollEvents({
        pollId: undefined,
        enabled: true,
      })
    );

    expect(mockEventSourceInstances).toHaveLength(0);
  });

  it('given valid pollId and enabled is true, when hook mounts, then it creates EventSource for poll events', () => {
    renderHook(() =>
      usePollEvents({
        pollId: 'poll-abc',
        enabled: true,
      })
    );

    expect(mockEventSourceInstances).toHaveLength(1);
    expect(mockEventSourceInstances[0].url).toContain(
      '/api/v1/polls/poll-abc/events'
    );
  });

  it('given active EventSource, when answer event arrives, then onAnswer callback is invoked with parsed data', () => {
    const onAnswer = vi.fn();

    renderHook(() =>
      usePollEvents({
        pollId: 'poll-abc',
        enabled: true,
        onAnswer,
      })
    );

    expect(mockEventSourceInstances).toHaveLength(1);
    const es = mockEventSourceInstances[0];

    act(() => {
      es.emit('answer', { answer: 'Delicious Tacos' });
    });

    expect(onAnswer).toHaveBeenCalledWith({ answer: 'Delicious Tacos' });
  });

  it('given active EventSource, when poll_closed event arrives, then onPollClosed is called and EventSource is closed', () => {
    const onPollClosed = vi.fn();

    renderHook(() =>
      usePollEvents({
        pollId: 'poll-abc',
        enabled: true,
        onPollClosed,
      })
    );

    expect(mockEventSourceInstances).toHaveLength(1);
    const es = mockEventSourceInstances[0];

    act(() => {
      es.emit('poll_closed', {});
    });

    expect(onPollClosed).toHaveBeenCalled();
    expect(es.closed).toBe(true);
  });

  it('given active EventSource, when component unmounts, then EventSource is closed', () => {
    const { unmount } = renderHook(() =>
      usePollEvents({
        pollId: 'poll-abc',
        enabled: true,
      })
    );

    expect(mockEventSourceInstances).toHaveLength(1);
    const es = mockEventSourceInstances[0];
    expect(es.closed).toBe(false);

    unmount();
    expect(es.closed).toBe(true);
  });
});
