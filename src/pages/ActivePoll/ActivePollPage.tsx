import { AnswerComposer } from '@/components/activePollPage/AnswerComposer';
import { AnswerFeed } from '@/components/activePollPage/AnswerFeed';
import { ClosePollDialog } from '@/components/activePollPage/ClosePollDialog';
import { ClosedPollNotice } from '@/components/activePollPage/ClosedPollNotice';
import { EmptyState } from '@/components/activePollPage/EmptyState';
import { LoadingPollPage } from '@/components/activePollPage/LoadingPollPage';
import { PageFrame } from '@/components/activePollPage/PageFrame';
import { PollHeader } from '@/components/activePollPage/PollHeader';
import { QuestionCard } from '@/components/activePollPage/QuestionCard';
import { SubmittedAnswerConfirmation } from '@/components/activePollPage/SubmittedAnswerConfirmation';
import { useActivePollPage } from '@/pages/ActivePoll/useActivePollPage';

export function ActivePollPage() {
  const {
    poll,
    answers,
    pageState,
    feedError,
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
    loadMoreAnswers,
    handleAnswerSubmit,
    handleClosePoll,
    handleCopyLink,
    handleCloseDialogCancel,
    openClosePollDialog,
  } = useActivePollPage();

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

  return (
    <div className="relative isolate flex min-h-svh flex-col overflow-x-hidden bg-canvas">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      ></div>
      <PollHeader />
      <main className="mx-auto w-full max-w-290 flex-1 px-4 py-7 sm:px-8 sm:py-10 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-start lg:gap-12">
          <div className="min-w-0 lg:sticky lg:top-7">
            <QuestionCard
              poll={poll}
              canClose={canClose}
              copyLabel={copyLabel}
              onCloseRequest={openClosePollDialog}
              onCopyLink={() => void handleCopyLink()}
            />
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
              error={feedError}
              canLoadMore={canLoadMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={() => void loadMoreAnswers()}
            />
          </div>
        </div>
      </main>
      <ClosePollDialog
        isOpen={isCloseDialogOpen}
        isClosing={isClosing}
        error={closeError}
        onCancel={handleCloseDialogCancel}
        onConfirm={() => void handleClosePoll()}
      />
    </div>
  );
}
