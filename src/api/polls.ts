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
  request: CreatePollRequest
): Promise<CreatePollResponse> {
  const response = await apiClient.post<CreatePollResponse>(
    '/api/v1/polls',
    request
  );
  return response.data;
}

export async function getPoll(pollId: string): Promise<Poll> {
  const response = await apiClient.get<Poll>(
    `/api/v1/polls/${encodeURIComponent(pollId)}`
  );
  return response.data;
}

export async function getPollAnswers(
  pollId: string,
  limit: number,
  offset: number
): Promise<PollAnswer[]> {
  const response = await apiClient.get<ListAnswersResponse>(
    `/api/v1/polls/${encodeURIComponent(pollId)}/answers`,
    { params: { limit, offset } }
  );
  return response.data.answers;
}

export async function submitPollAnswer(
  pollId: string,
  answer: string
): Promise<void> {
  await apiClient.post(`/api/v1/polls/${encodeURIComponent(pollId)}/answers`, {
    answer,
  });
}

export async function closePoll(
  pollId: string,
  creatorToken?: string
): Promise<void> {
  await apiClient.patch(
    `/api/v1/polls/${encodeURIComponent(pollId)}/close`,
    undefined,
    creatorToken
      ? {
          headers: {
            'x-creator-token': creatorToken,
          },
        }
      : undefined
  );
}

