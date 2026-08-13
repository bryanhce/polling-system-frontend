export function CreatePollIntroduction() {
  return (
    <div className="mb-7 text-center sm:mb-9">
      <p className="mb-3 text-[0.8rem] font-extrabold tracking-[0.12em] text-primary uppercase">
        New poll
      </p>
      <h1
        id="new-poll-title"
        className="m-0 font-display text-[clamp(2.45rem,7vw,4rem)] leading-[0.95] tracking-[-0.055em] text-ink"
      >
        Start a good conversation.
      </h1>
      <p className="mx-auto mt-4 mb-0 max-w-130 text-[1rem] leading-[1.6] text-muted-ink">
        Ask one open question, then share the poll and hear every voice.
      </p>
    </div>
  );
}
