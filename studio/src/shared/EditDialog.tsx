import { Dialog } from "radix-ui";
import type { ReactNode } from "react";

export function EditDialog({ title, description, onClose, busy, children }: {
  title: string; description: string; onClose: () => void; busy?: boolean; children: ReactNode;
}) {
  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="edit-dialog-overlay" />
        <Dialog.Content className="card edit-dialog">
          <div className="row">
            <Dialog.Title className="grow">{title}</Dialog.Title>
            <Dialog.Close asChild><button type="button" className="ghost" aria-label="Cerrar editor" disabled={busy}>✕</button></Dialog.Close>
          </div>
          <Dialog.Description className="small muted">{description}</Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
