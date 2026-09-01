interface AnswerListItemProps {
  answer: string;
}

export function AnswerListItem({ answer }: AnswerListItemProps) {
  return (
    <li className="max-h-48 overflow-y-auto rounded-2xl border border-border bg-surface px-4 py-4 text-base leading-[1.55] text-ink shadow-[4px_5px_0_rgba(23,33,58,0.04)] whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
      {answer}
    </li>
  );
}
