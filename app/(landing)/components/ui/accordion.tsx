"use client";

import * as React from "react";

interface AccordionContextValue {
  value: string | null;
  onValueChange: (value: string | null) => void;
  collapsible: boolean;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function useAccordion() {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error("Accordion components must be used within Accordion");
  return ctx;
}

interface AccordionProps {
  type?: "single";
  collapsible?: boolean;
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  children: React.ReactNode;
  className?: string;
}

export function Accordion({
  type = "single",
  collapsible = true,
  value: controlledValue,
  onValueChange,
  children,
  className,
}: AccordionProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string | null>(null);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue ?? null : uncontrolledValue;

  const handleValueChange = React.useCallback(
    (next: string | null) => {
      const nextValue = collapsible ? (value === next ? null : next) : next;
      if (!isControlled) setUncontrolledValue(nextValue);
      onValueChange?.(nextValue);
    },
    [collapsible, value, isControlled, onValueChange]
  );

  const ctx: AccordionContextValue = React.useMemo(
    () => ({ value, onValueChange: handleValueChange, collapsible }),
    [value, handleValueChange, collapsible]
  );

  return (
    <AccordionContext.Provider value={ctx}>
      <div className={className} data-state={value ?? "none"}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemContextValue {
  value: string;
  open: boolean;
  triggerId: string;
  contentId: string;
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null);

function useAccordionItem() {
  const ctx = React.useContext(AccordionItemContext);
  if (!ctx) throw new Error("AccordionItem must be used within Accordion");
  return ctx;
}

export function AccordionItem({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { value: currentValue } = useAccordion();
  const open = currentValue === value;
  const triggerId = React.useId();
  const contentId = React.useId();

  const itemCtx: AccordionItemContextValue = React.useMemo(
    () => ({ value, open, triggerId, contentId }),
    [value, open, triggerId, contentId]
  );

  return (
    <AccordionItemContext.Provider value={itemCtx}>
      <div className={className} data-state={open ? "open" : "closed"}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export function AccordionTrigger({
  children,
  className,
  asChild,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { onValueChange, collapsible } = useAccordion();
  const { value, open, triggerId, contentId } = useAccordionItem();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(e);
    onValueChange(collapsible && open ? null : value);
  };

  return (
    <button
      type="button"
      id={triggerId}
      aria-expanded={open}
      aria-controls={contentId}
      data-state={open ? "open" : "closed"}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

export function AccordionContent({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { open, triggerId, contentId } = useAccordionItem();

  return (
    <div
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      hidden={!open}
      className={className}
      {...props}
    >
      {open ? children : null}
    </div>
  );
}
