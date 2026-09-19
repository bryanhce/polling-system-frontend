export interface SSECallbacks {
  onAnswer?: (data: { answer: string }) => void;
  onPollClosed?: () => void;
  onError?: (error: unknown) => void;
}

function getPollEventsUrl(pollId: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
  return `${baseUrl}/api/v1/polls/${encodeURIComponent(pollId)}/events`;
}

const answerEvent = 'answer';
const closePollEvent = 'poll_closed';
const payloadEventStartingIdx = 7;
const payloadDataStartingIdx = 6;

/**
 * Connects to the poll SSE stream using fetch instead of native EventSource.
 * This allows sending custom headers (e.g. ngrok-skip-browser-warning)
 * which EventSource does not support.
 *
 * Returns an abort function to close the connection.
 */
export function subscribeToPollEvents(
  pollId: string,
  callbacks: SSECallbacks
): () => void {
  const controller = new AbortController();
  const url = getPollEventsUrl(pollId);

  (async () => {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'text/event-stream',
          'ngrok-skip-browser-warning': '1',
        },
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        callbacks.onError?.(
          new Error(`SSE connection failed: ${response.status}`)
        );
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() ?? '';

        for (const block of blocks) {
          if (!block.trim()) continue;

          let eventType = '';
          let data = '';

          for (const line of block.split('\n')) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(payloadEventStartingIdx);
            } else if (line.startsWith('data: ')) {
              data = line.slice(payloadDataStartingIdx);
            }
          }

          if (eventType === answerEvent && data) {
            try {
              const parsed = JSON.parse(data) as { answer: string };
              if (parsed && typeof parsed.answer === 'string') {
                callbacks.onAnswer?.(parsed);
              }
            } catch (parseError) {
              console.error('Failed to parse SSE event data:', parseError);
            }
          } else if (eventType === closePollEvent) {
            callbacks.onPollClosed?.();
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      callbacks.onError?.(err);
    }
  })();

  return () => controller.abort();
}
