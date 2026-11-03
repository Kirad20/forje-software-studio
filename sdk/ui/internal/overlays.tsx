import { Dialog as RDialog, Tabs as RTabs, Tooltip as RTooltip } from "radix-ui";
import type { ReactNode } from "react";

export function Dialog({ open, onOpenChange, title, description, children, footer }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; children?: ReactNode; footer?: ReactNode;
}) {
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className="fj-overlay" />
        {/* Without a description Radix expects aria-describedby to be undefined on purpose. */}
        <RDialog.Content className="fj-dialog" {...(description ? {} : { "aria-describedby": undefined })}>
          <RDialog.Title className="fj-dialog-title">{title}</RDialog.Title>
          {description ? <RDialog.Description className="fj-dialog-text">{description}</RDialog.Description> : null}
          {children}
          {footer && <div className="fj-dialog-footer">{footer}</div>}
          <RDialog.Close className="fj-dialog-close" aria-label="Cerrar">×</RDialog.Close>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}

export function Tabs({ items, value, defaultValue, onValueChange }: {
  items: { value: string; label: string; content: ReactNode }[]; value?: string; defaultValue?: string; onValueChange?: (value: string) => void;
}) {
  return (
    <RTabs.Root value={value} defaultValue={value === undefined ? (defaultValue ?? items[0]?.value) : undefined} onValueChange={onValueChange}>
      <RTabs.List className="fj-tabs" aria-label="Secciones">
        {items.map((item) => <RTabs.Trigger key={item.value} value={item.value} className="fj-tab">{item.label}</RTabs.Trigger>)}
      </RTabs.List>
      {items.map((item) => <RTabs.Content key={item.value} value={item.value} className="fj-tab-panel">{item.content}</RTabs.Content>)}
    </RTabs.Root>
  );
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <RTooltip.Provider delayDuration={300}>
      <RTooltip.Root>
        <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
        <RTooltip.Portal><RTooltip.Content className="fj-tooltip" sideOffset={6}>{label}</RTooltip.Content></RTooltip.Portal>
      </RTooltip.Root>
    </RTooltip.Provider>
  );
}
