import { useEffect, useRef } from 'react';
import { createPollEventSource } from '@/api/pollEvents';
import type { PollAnswer } from '@/api/polls';

export interface UsePollEventsOptions {
  pollId?: string;
  enabled?: boolean;
  onAnswer?: (answer: PollAnswer) => void;
  onPollClosed?: () => void;
}

const answerEvent = "answer"
const closePollEvent = "poll_closed"

export function usePollEvents({
  pollId,
  enabled = true,
  onAnswer,
  onPollClosed,
}: UsePollEventsOptions) {
  const onAnswerRef = useRef(onAnswer);
  const onPollClosedRef = useRef(onPollClosed);

  useEffect(() => {
    onAnswerRef.current = onAnswer;
    onPollClosedRef.current = onPollClosed;
  });

  useEffect(() => {
    if (!pollId || !enabled) {
      return;
    }

    const eventSource = createPollEventSource(pollId);

    eventSource.addEventListener(answerEvent, (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as PollAnswer;
        if (data && typeof data.answer === 'string') {
          onAnswerRef.current?.(data);
        }
      } catch (error) {
        // Silently ignore malformed SSE event payloads
        console.error("Error with server sent events", error)
      }
    });

    eventSource.addEventListener(closePollEvent, () => {
      onPollClosedRef.current?.();
      eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, [pollId, enabled]);
}
