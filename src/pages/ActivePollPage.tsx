import { isAxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import {
  closePoll,
  getPoll,
  getPollAnswers,
  submitPollAnswer,
} from '../api/polls';
import { AnswerComposer } from '../components/activePollPage/AnswerComposer';
import { AnswerFeed } from '../components/activePollPage/AnswerFeed';
import { ClosePollDialog } from '../components/activePollPage/ClosePollDialog';
import { ClosedPollNotice } from '../components/activePollPage/ClosedPollNotice';
import { EmptyState } from '../components/activePollPage/EmptyState';
import { LoadingPollPage } from '../components/activePollPage/LoadingPollPage';
import { PageFrame } from '../components/activePollPage/PageFrame';
import { PollHeader } from '../components/activePollPage/PollHeader';
import { QuestionCard } from '../components/activePollPage/QuestionCard';
import { SubmittedAnswerConfirmation } from '../components/activePollPage/SubmittedAnswerConfirmation';
import type { Poll, PollAnswer } from '../api/polls';

const ANSWER_PAGE_SIZE = 20;

interface PollLocationState {
  isCreator?: boolean;
}

function statusCode(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

export function ActivePollPage() {
  const { pollId } = useParams();
  const location = useLocation();
  const isCreator = Boolean(
    (location.state as PollLocationState | null)?.isCreator
  );
  const [poll, setPoll] = useState<Poll | null>(null);
  const [answers, setAnswers] = useState<PollAnswer[]>([]);
  const [pageState, setPageState] = useState<
    'loading' | 'ready' | 'not-found' | 'error'
  >('loading');
  const [feedError, setFeedError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(false);
  const [answerError, setAnswerError] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [focusConfirmation, setFocusConfirmation] = useState(false);
  const [closedMessage, setClosedMessage] = useState('');
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [closeError, setCloseError] = useState('');

  const loadInitial = useCallback(async () => {
    if (!pollId) {
      setPageState('not-found');
      return;
    }

    setPageState('loading');
    setFeedError('');
    try {
      const [nextPoll, nextAnswers] = await Promise.all([
        getPoll(pollId),
        getPollAnswers(pollId, ANSWER_PAGE_SIZE, 0),
      ]);
      setPoll(nextPoll);
      setAnswers(nextAnswers);
      setCanLoadMore(nextAnswers.length === ANSWER_PAGE_SIZE);
      setPageState('ready');
    } catch (error) {
      setPageState(statusCode(error) === 404 ? 'not-found' : 'error');
    }
  }, [pollId]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const refreshAnswers = useCallback(async () => {
    if (!pollId) return;
    setIsRefreshing(true);
    setFeedError('');
    try {
      const [nextPoll, nextAnswers] = await Promise.all([
        getPoll(pollId),
        getPollAnswers(pollId, ANSWER_PAGE_SIZE, 0),
      ]);
      setPoll(nextPoll);
      setAnswers(nextAnswers);
      setCanLoadMore(nextAnswers.length === ANSWER_PAGE_SIZE);
      setPageState('ready');
    } catch (error) {
      if (statusCode(error) === 404) {
        setPageState('not-found');
      } else {
        setFeedError(
          'We couldn’t refresh the answers just now. Please try again.'
        );
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [pollId]);

  async function loadMoreAnswers() {
    if (!pollId || isLoadingMore) return;
    setIsLoadingMore(true);
    setFeedError('');
    try {
      const nextAnswers = await getPollAnswers(
        pollId,
        ANSWER_PAGE_SIZE,
        answers.length
      );
      setAnswers((current) => [...current, ...nextAnswers]);
      setCanLoadMore(nextAnswers.length === ANSWER_PAGE_SIZE);
    } catch (error) {
      if (statusCode(error) === 404) setPageState('not-found');
      else
        setFeedError(
          'We couldn’t load more answers just now. Please try again.'
        );
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function handleAnswerSubmit(
    answer: string,
    initiatedWithKeyboard: boolean
  ) {
    if (!pollId) return;
    setAnswerError('');
    setIsSubmittingAnswer(true);
    try {
      await submitPollAnswer(pollId, answer);
      // TODO: Persist participant state once the API provides viewer identity and duplicate-answer enforcement.
      // This local lock intentionally disappears after a page refresh in the MVP.
      setHasAnswered(true);
      setFocusConfirmation(initiatedWithKeyboard);
      await refreshAnswers();
    } catch (error) {
      const status = statusCode(error);
      if (status === 403) {
        setPoll((current) =>
          current ? { ...current, status: 'closed' } : current
        );
        setClosedMessage(
          'This poll just closed. You can still read the final answers.'
        );
      } else if (status === 404) {
        setPageState('not-found');
      } else {
        setAnswerError(
          'We couldn’t send your answer just now. Your words are still here—please try again.'
        );
      }
    } finally {
      setIsSubmittingAnswer(false);
    }
  }

  async function handleClosePoll() {
    if (!pollId) return;
    setCloseError('');
    setIsClosing(true);
    try {
      await closePoll(pollId);
      setPoll((current) =>
        current ? { ...current, status: 'closed' } : current
      );
      setClosedMessage('This poll is closed. The final answers are below.');
      setIsCloseDialogOpen(false);
    } catch (error) {
      const status = statusCode(error);
      if (status === 404) {
        setIsCloseDialogOpen(false);
        setPageState('not-found');
      } else if (status === 409) {
        setPoll((current) =>
          current ? { ...current, status: 'closed' } : current
        );
        setClosedMessage(
          'This poll was already closed. The final answers are below.'
        );
        setIsCloseDialogOpen(false);
      } else {
        setCloseError(
          'We couldn’t close this poll just now. Please try again.'
        );
      }
    } finally {
      setIsClosing(false);
    }
  }

  if (pageState === 'loading') {
    return <LoadingPollPage />;
  }

  if (pageState === 'not-found') {
    return (
      <PageFrame>
        <EmptyState
          title="We couldn’t find that poll."
          description="Check the link or enter another poll ID to join a conversation."
        />
      </PageFrame>
    );
  }

  if (pageState === 'error' || !poll) {
    return (
      <PageFrame>
        <EmptyState
          title="We couldn’t load this poll."
          description="Please check your connection and try again."
          retryLabel="Try again"
          onRetry={() => void loadInitial()}
        />
      </PageFrame>
    );
  }

  // TODO: Replace transient navigation state with API-provided creator permissions.
  // The close action intentionally vanishes on refresh until viewer identity exists.
  const canClose = isCreator && poll.status === 'active';

  return (
    <div className="relative isolate flex min-h-svh flex-col overflow-hidden bg-canvas">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <span className="absolute top-[18%] left-[4%] size-4 rounded-full bg-highlight" />
        <span className="absolute top-[32%] right-[5%] size-7 rounded-full bg-secondary/80" />
        <span className="absolute right-[11%] bottom-[11%] text-4xl text-primary">
          ✦
        </span>
      </div>
      <PollHeader
        status={poll.status}
        canClose={canClose}
        onCloseRequest={() => setIsCloseDialogOpen(true)}
      />
      <main className="mx-auto w-full max-w-290 flex-1 px-4 py-7 sm:px-8 sm:py-10 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-start lg:gap-12">
          <div className="min-w-0 lg:sticky lg:top-7">
            <QuestionCard poll={poll} />
            {poll.status === 'active' && !hasAnswered ? (
              <AnswerComposer
                isSubmitting={isSubmittingAnswer}
                error={answerError}
                onSubmit={handleAnswerSubmit}
              />
            ) : null}
            {poll.status === 'active' && hasAnswered ? (
              <SubmittedAnswerConfirmation focusOnMount={focusConfirmation} />
            ) : null}
            {poll.status === 'closed' ? (
              <ClosedPollNotice message={closedMessage} />
            ) : null}
          </div>
          <div className="min-w-0">
            <AnswerFeed
              answers={answers}
              isLoading={false}
              isRefreshing={isRefreshing}
              error={feedError}
              canLoadMore={canLoadMore}
              isLoadingMore={isLoadingMore}
              onRefresh={() => void refreshAnswers()}
              onLoadMore={() => void loadMoreAnswers()}
            />
          </div>
        </div>
      </main>
      <ClosePollDialog
        isOpen={isCloseDialogOpen}
        isClosing={isClosing}
        error={closeError}
        onCancel={() => {
          setIsCloseDialogOpen(false);
          setCloseError('');
        }}
        onConfirm={() => void handleClosePoll()}
      />
    </div>
  );
}
