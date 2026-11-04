import { AlertDialog } from "radix-ui";
import { useEffect, useRef, useState } from "react";

export function useConfirmation() {
  const [message, setMessage] = useState<string | null>(null);
  const resolve = useRef<((accepted: boolean) => void) | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => () => { resolve.current?.(false); }, []);
  const close = (accepted: boolean) => {
    resolve.current?.(accepted);
    resolve.current = null;
    setMessage(null);
  };
  const confirm = (text: string) => new Promise<boolean>((done) => {
    resolve.current?.(false);
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    resolve.current = done;
    setMessage(text);
  });
  const dialog = <AlertDialog.Root open={message !== null} onOpenChange={(open) => { if (!open) close(false); }}>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="edit-dialog-overlay" />
      <AlertDialog.Content className="card edit-dialog" onCloseAutoFocus={(e) => {
        if (opener.current?.isConnected) { e.preventDefault(); opener.current.focus(); }
      }}>
        <AlertDialog.Title>Confirmar acción</AlertDialog.Title>
        <AlertDialog.Description>{message}</AlertDialog.Description>
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <AlertDialog.Cancel asChild><button type="button" onClick={() => close(false)}>Cancelar</button></AlertDialog.Cancel>
          <AlertDialog.Action asChild><button type="button" className="danger" onClick={() => close(true)}>Confirmar</button></AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>;
  return { confirm, dialog };
}
