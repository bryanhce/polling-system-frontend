function getPollEventsUrl(pollId: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
  return `${baseUrl}/api/v1/polls/${encodeURIComponent(pollId)}/events`;
}

export function createPollEventSource(pollId: string): EventSource {
  return new EventSource(getPollEventsUrl(pollId));
}
