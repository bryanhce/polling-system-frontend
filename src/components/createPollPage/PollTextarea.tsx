interface PollTextareaProps {
  label: string;
  fieldId: string;
  hintId: string;
  errorId: string;
  name: string;
  value: string;
  error: string;
  placeholder: string;
  hint: string;
  limit: number;
  minHeightClassName: string;
  required?: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

export function PollTextarea({
  label,
  fieldId,
  hintId,
  errorId,
  name,
  value,
  error,
  placeholder,
  hint,
  limit,
  minHeightClassName,
  required,
  onChange,
  onBlur,
}: PollTextareaProps) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label
          className="text-sm font-extrabold text-ink"
          htmlFor={fieldId}
        >
          {label}{' '}
          {required ? (
            <span className="text-danger" aria-label="required">
              *
            </span>
          ) : (
            <span className="font-medium text-muted-ink">(optional)</span>
          )}
        </label>
        <span
          className="shrink-0 text-xs font-semibold text-muted-ink"
          aria-live="polite"
        >
          {value.length}/{limit}
        </span>
      </div>
      <textarea
        className={`${minHeightClassName} w-full resize-y rounded-2xl border-[1.5px] border-border bg-[#fffdf8] px-4 py-3.5 text-base leading-normal text-ink placeholder:text-[#8590a5] aria-invalid:border-danger`}
        id={fieldId}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-describedby={error ? `${hintId} ${errorId}` : hintId}
        aria-invalid={Boolean(error)}
        required={required}
        maxLength={limit + 1}
      />
      <p
        id={hintId}
        className="mt-2 mb-0 text-xs leading-[1.4] text-muted-ink"
      >
        {hint}
      </p>
      {error ? (
        <p
          id={errorId}
          className="mt-2 mb-0 text-xs font-bold leading-[1.4] text-danger"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
