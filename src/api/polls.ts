import { apiClient } from '@/api/client';

export interface CreatePollRequest {
  question: string;
  description?: string;
}

export interface Poll {
  pollId: string;
  question: string;
  description?: string;
  status: 'active' | 'closed';
}

export interface PollAnswer {
  answer: string;
}

export interface CreatePollResponse {
  pollId: string;
  creatorToken: string;
}

interface ListAnswersResponse {
  answers: PollAnswer[];
}

export async function createPoll(
  request: CreatePollRequest,
  signal?: AbortSignal
): Promise<CreatePollResponse> {
  const response = await apiClient.post<CreatePollResponse>(
    '/api/v1/polls',
    request,
    { signal }
  );
  return response.data;
}

export async function getPoll(
  pollId: string,
  signal?: AbortSignal
): Promise<Poll> {
  const response = await apiClient.get<Poll>(
    `/api/v1/polls/${encodeURIComponent(pollId)}`,
    { signal }
  );
  return response.data;
}

export async function getPollAnswers(
  pollId: string,
  limit: number,
  offset: number,
  signal?: AbortSignal
): Promise<PollAnswer[]> {
  const response = await apiClient.get<ListAnswersResponse>(
    `/api/v1/polls/${encodeURIComponent(pollId)}/answers`,
    { params: { limit, offset }, signal }
  );
  return response.data.answers;
}

export async function submitPollAnswer(
  pollId: string,
  answer: string,
  signal?: AbortSignal
): Promise<void> {
  await apiClient.post(
    `/api/v1/polls/${encodeURIComponent(pollId)}/answers`,
    { answer },
    { signal }
  );
}

export async function closePoll(
  pollId: string,
  creatorToken?: string,
  signal?: AbortSignal
): Promise<void> {
  await apiClient.patch(
    `/api/v1/polls/${encodeURIComponent(pollId)}/close`,
    undefined,
    {
      headers: creatorToken
        ? {
            'x-creator-token': creatorToken,
          }
        : undefined,
      signal,
    }
  );
}
