import { apiClient } from './client';

export interface CreatePollRequest {
  question: string;
  description?: string;
}

interface CreatePollResponse {
  pollId: string;
}

export async function createPoll(request: CreatePollRequest): Promise<string> {
  const response = await apiClient.post<CreatePollResponse>(
    '/api/v1/polls',
    request
  );
  return response.data.pollId;
}
