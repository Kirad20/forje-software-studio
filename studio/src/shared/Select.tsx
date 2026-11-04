import { Popover } from "radix-ui";
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();

export function Select<T extends string>({
  value, onValueChange, options, label, placeholder = "Selecciona una opción", disabled,
  searchable = true, style, id,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  label: string;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  style?: CSSProperties;
  id?: string;
}) {
  const uid = useId();
  const listId = `${uid}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(value);
  const search = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const tabbing = useRef(false);
  const list = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);
  const filtered = options.filter((option) => normalize(`${option.label} ${option.value} ${option.description ?? ""}`).includes(normalize(query)));
  const enabled = filtered.filter((option) => !option.disabled);
  const current = enabled.find((option) => option.value === active) ?? enabled[0];
  const activeIndex = filtered.findIndex((option) => option.value === current?.value);

  useEffect(() => {
    if (open) list.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [open, active, query]);

  const choose = (option: SelectOption<T>) => {
    if (option.disabled) return;
    onValueChange(option.value);
    setOpen(false);
  };
  const navigate = (event: KeyboardEvent) => {
    const index = enabled.findIndex((option) => option.value === current?.value);
    let next: SelectOption<T> | undefined;
    switch (event.key) {
      case "ArrowDown": next = enabled[Math.min(index + 1, enabled.length - 1)]; break;
      case "ArrowUp": next = enabled[Math.max(index - 1, 0)]; break;
      case "Home": if (!query) next = enabled[0]; else return; break;
      case "End": if (!query) next = enabled[enabled.length - 1]; else return; break;
      case "Enter":
        event.preventDefault();
        if (current) choose(current);
        return;
      case "Tab":
        tabbing.current = true;
        trigger.current?.focus();
        setOpen(false);
        return;
      default: return;
    }
    event.preventDefault();
    if (next) setActive(next.value);
  };

  return (
    <Popover.Root open={open} onOpenChange={(next) => {
      setOpen(next);
      if (next) { setQuery(""); setActive(value); }
    }}>
      <Popover.Trigger asChild>
        <button
          ref={trigger} id={id} type="button" className="list-select-trigger" style={style} disabled={disabled}
          aria-label={`${label}: ${selected?.label ?? placeholder}`} aria-haspopup="listbox"
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setQuery("");
              setActive(value);
              setOpen(true);
            }
          }}
        >
          <span className={selected ? "" : "muted"}>{selected?.label ?? placeholder}</span>
          <span aria-hidden="true" className="muted">⌄</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="list-select-popover" align="start" sideOffset={5} collisionPadding={12}
          onOpenAutoFocus={(event) => { event.preventDefault(); search.current?.focus(); }}
          onCloseAutoFocus={(event) => {
            if (tabbing.current) { event.preventDefault(); tabbing.current = false; }
          }}
        >
          <input
            ref={search} role="combobox" aria-label={`Buscar en ${label}`} aria-expanded={open}
            aria-controls={listId} aria-activedescendant={current ? `${uid}-option-${activeIndex}` : undefined}
            autoComplete="off" placeholder={searchable ? "Buscar opciones…" : label}
            value={query} readOnly={!searchable} onChange={(event) => setQuery(event.target.value)} onKeyDown={navigate}
            className={searchable ? "list-select-search" : "list-select-search sr-only"}
          />
          <div ref={list} id={listId} role="listbox" aria-label={label} className="list-select-options">
            {filtered.map((option, index) => (
              <div
                key={option.value} id={`${uid}-option-${index}`} role="option"
                aria-selected={option.value === value} aria-disabled={option.disabled || undefined}
                data-active={option.value === current?.value} className="list-select-option"
                onMouseDown={(event) => event.preventDefault()}
                onMouseMove={() => !option.disabled && setActive(option.value)}
                onClick={() => choose(option)}
              >
                <span className="grow">
                  <span>{option.label}</span>
                  {option.description && <span className="list-select-description">{option.description}</span>}
                </span>
                {option.value === value && <span aria-hidden="true">✓</span>}
              </div>
            ))}
            {!filtered.length && <div className="list-select-empty" role="status">No hay opciones{query ? ` para «${query}»` : " disponibles"}.</div>}
          </div>
          {searchable && <div className="list-select-footer">{filtered.length} opciones · ↑↓ navegar · Enter seleccionar</div>}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
