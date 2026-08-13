export function ConversationArtwork() {
  return (
    <div
      className="conversation-art mx-auto mt-11 w-[92%] max-w-100 md:mt-0 md:w-auto md:max-w-none"
      aria-hidden="true"
    >
      <div className="art-orbit art-orbit--one" />
      <div className="art-orbit art-orbit--two" />
      <div className="speech-bubble speech-bubble--large">
        <span>
          What’s one thing
          <br />
          we should try?
        </span>
      </div>
      <div className="speech-bubble speech-bubble--small">
        <span>
          More time
          <br />
          together!
        </span>
      </div>
      <div className="art-face art-face--one">
        <span />
        <span />
      </div>
      <div className="art-face art-face--two">
        <span />
        <span />
      </div>
      <span className="absolute top-[1%] left-[10%] text-[1.6rem] text-primary">
        ✦
      </span>
      <span className="absolute right-1/2 bottom-[6%] text-[1.6rem] text-primary">
        ✦
      </span>
    </div>
  );
}
