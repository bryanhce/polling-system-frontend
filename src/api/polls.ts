import { apiClient } from './client';

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

interface CreatePollResponse {
  pollId: string;
}

interface ListAnswersResponse {
  answers: PollAnswer[];
}

export async function createPoll(request: CreatePollRequest): Promise<string> {
  const response = await apiClient.post<CreatePollResponse>(
    '/api/v1/polls',
    request
  );
  return response.data.pollId;
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

export async function closePoll(pollId: string): Promise<void> {
  await apiClient.patch(`/api/v1/polls/${encodeURIComponent(pollId)}/close`);
}
