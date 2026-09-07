import { useEffect, useRef } from 'react';
import { subscribeToPollEvents } from '@/api/pollEvents';
import type { PollAnswer } from '@/api/polls';

export interface UsePollEventsOptions {
  pollId?: string;
  enabled?: boolean;
  onAnswer?: (answer: PollAnswer) => void;
  onPollClosed?: () => void;
}

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

    const unsubscribe = subscribeToPollEvents(pollId, {
      onAnswer: (data) => {
        onAnswerRef.current?.(data);
      },
      onPollClosed: () => {
        onPollClosedRef.current?.();
      },
    });

    return () => {
      unsubscribe();
    };
  }, [pollId, enabled]);
}

