import { isAxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import {
  closePoll,
  getPoll,
  getPollAnswers,
  submitPollAnswer,
} from '../../api/polls';
import type { Poll, PollAnswer } from '../../api/polls';

const ANSWER_PAGE_SIZE = 20;

interface PollLocationState {
  isCreator?: boolean;
}

function statusCode(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

export function useActivePollPage() {
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
  const [copyLabel, setCopyLabel] = useState('Copy link');

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
    } catch (error) {
      if (statusCode(error) === 404) setPageState('not-found');
      else
        setFeedError(
          'We couldn’t refresh the answers just now. Please try again.'
        );
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

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyLabel('Link copied');
    } catch {
      setCopyLabel('Couldn’t copy');
    }
  }

  function handleCloseDialogCancel() {
    setIsCloseDialogOpen(false);
    setCloseError('');
  }

  // TODO: Replace transient navigation state with API-provided creator permissions.
  // The close action intentionally vanishes on refresh until viewer identity exists.
  const canClose = isCreator && poll?.status === 'active';

  return {
    poll,
    answers,
    pageState,
    feedError,
    isRefreshing,
    isLoadingMore,
    canLoadMore,
    answerError,
    isSubmittingAnswer,
    hasAnswered,
    focusConfirmation,
    closedMessage,
    isCloseDialogOpen,
    isClosing,
    closeError,
    copyLabel,
    canClose,
    loadInitial,
    refreshAnswers,
    loadMoreAnswers,
    handleAnswerSubmit,
    handleClosePoll,
    handleCopyLink,
    handleCloseDialogCancel,
    openClosePollDialog: () => setIsCloseDialogOpen(true),
  };
}
