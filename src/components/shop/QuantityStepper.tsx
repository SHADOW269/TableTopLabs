"use client";

/**
 * The quantity control on the product page. A sharp-edged stepper in the
 * TableTopLabs language: hairline frame, square buttons, tabular numerals.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="ms-pdp__qty" role="group" aria-label="Quantity">
      <button
        type="button"
        className="ms-pdp__qty-btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
        </svg>
      </button>
      <span className="ms-pdp__qty-val" aria-live="polite" aria-atomic="true">
        {value}
      </span>
      <button
        type="button"
        className="ms-pdp__qty-btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
