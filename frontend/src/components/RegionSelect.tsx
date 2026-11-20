import { regionSchema, type Region } from "@wikilol/contracts";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import "./region-select.css";

export function RegionSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Region;
  onChange: (region: Region) => void;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const selectedOption = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const option = selectedOption.current;
    if (!open || !option) return;

    option.focus({ preventScroll: true });
    if (option.parentElement) option.parentElement.scrollTop = option.offsetTop - option.offsetHeight;
  }, [open]);

  function close() {
    trigger.current?.focus();
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      close();
      return;
    }

    const { key } = event;
    if (key !== "ArrowDown" && key !== "ArrowUp" && key !== "Home" && key !== "End") return;
    if (!open && key !== "ArrowDown" && key !== "ArrowUp") return;
    event.preventDefault();

    if (!open) {
      setOpen(true);
      return;
    }

    const options = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>("[role=option]"),
    );
    const current = options.indexOf(document.activeElement as HTMLButtonElement);
    const next = key === "Home" ? 0
      : key === "End" ? options.length - 1
      : (current + (key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
    options[next]?.focus();
  }

  return (
    <div
      className="region-select"
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <span className="region-select-label" id={`${id}-label`}>{label}</span>
      <div className="region-select-anchor">
        <button
          ref={trigger}
          className="region-select-trigger"
          type="button"
          aria-labelledby={`${id}-label ${id}-value`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? id : undefined}
          onClick={() => setOpen((current) => !current)}
        >
          <span id={`${id}-value`}>{value}</span>
          <span className="region-select-chevron" aria-hidden="true" />
        </button>
        {open && (
          <div className="region-select-menu" id={id} role="listbox" aria-labelledby={`${id}-label`}>
            {regionSchema.options.map((option) => (
              <button
                key={option}
                ref={option === value ? selectedOption : undefined}
                type="button"
                role="option"
                aria-selected={option === value}
                tabIndex={-1}
                onClick={() => {
                  onChange(option);
                  close();
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
