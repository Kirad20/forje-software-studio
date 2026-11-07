import { Component, createContext, useContext, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from "react";

export class PwaBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("No se pudo cargar la pantalla de Forja.", error, info.componentStack);
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="empty" role="alert">
      <h1>No se pudo cargar esta pantalla</h1>
      <p>Comprueba la conexión. Si Forja se actualizó, recarga para usar la nueva versión.</p>
      <button onClick={() => {
        if (confirm("Guarda los cambios pendientes en las otras pestañas antes de continuar. ¿Recargar Forja?")) window.location.reload();
      }}>Recargar aplicación</button>
    </main>;
  }
}

interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallContext = createContext<{ available: boolean; request: () => Promise<void> } | null>(null);
export function usePwaInstall() {
  const install = useContext(InstallContext);
  if (!install) throw new Error("La instalación requiere el proveedor PWA.");
  return install;
}

export function Pwa({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(navigator.onLine);
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [reloadNeeded, setReloadNeeded] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [installHelp, setInstallHelp] = useState(false);
  const [installed, setInstalled] = useState(() => matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && navigator.standalone === true));
  const registration = useRef<ServiceWorkerRegistration | null>(null);
  const reloading = useRef(false);
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  useEffect(() => {
    const connectivity = () => setOnline(navigator.onLine);
    const prompt = (event: Event) => { event.preventDefault(); setInstall(event as InstallEvent); };
    const completed = () => { setInstall(null); setInstalled(true); setInstallHelp(false); };
    const staleChunk = (event: Event) => {
      // Vite's missing-chunk event is recoverable through a deliberate reload, not during a turn.
      event.preventDefault();
      setReloadNeeded(true);
    };
    window.addEventListener("online", connectivity);
    window.addEventListener("offline", connectivity);
    window.addEventListener("beforeinstallprompt", prompt);
    window.addEventListener("appinstalled", completed);
    window.addEventListener("vite:preloadError", staleChunk);
    return () => {
      window.removeEventListener("online", connectivity);
      window.removeEventListener("offline", connectivity);
      window.removeEventListener("beforeinstallprompt", prompt);
      window.removeEventListener("appinstalled", completed);
      window.removeEventListener("vite:preloadError", staleChunk);
    };
  }, []);

  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    let disposed = false;
    let controlled = !!navigator.serviceWorker.controller;
    let watched: ServiceWorker | null = null;
    const checkWaiting = () => {
      if (!disposed && registration.current?.waiting) setWaiting(registration.current.waiting);
    };
    const changed = () => {
      checkWaiting();
      if (!disposed && watched?.state === "redundant") setError("La nueva versión no pudo preparar todos sus recursos. Reintenta con conexión.");
    };
    const found = () => {
      watched?.removeEventListener("statechange", changed);
      watched = registration.current?.installing ?? null;
      watched?.addEventListener("statechange", changed);
    };
    const controllerChanged = () => {
      if (reloading.current) window.location.reload();
      else if (controlled) { setWaiting(null); setReloadNeeded(true); }
      controlled = true;
    };
    const checkUpdate = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        void registration.current?.update().catch((e: Error) => { if (!disposed) setError(`No se pudo comprobar la actualización: ${e.message}`); });
      }
    };
    navigator.serviceWorker.addEventListener("controllerchange", controllerChanged);
    document.addEventListener("visibilitychange", checkUpdate);
    void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).then((reg) => {
      if (disposed) return;
      registration.current = reg;
      reg.addEventListener("updatefound", found);
      found();
      checkWaiting();
    }).catch((e: Error) => { if (!disposed) setError(`No se pudo preparar la instalación offline: ${e.message}`); });
    return () => {
      disposed = true;
      registration.current?.removeEventListener("updatefound", found);
      watched?.removeEventListener("statechange", changed);
      navigator.serviceWorker.removeEventListener("controllerchange", controllerChanged);
      document.removeEventListener("visibilitychange", checkUpdate);
    };
  }, []);

  const update = () => {
    if (!confirm("Guarda tus cambios y espera a que termine el constructor en esta pestaña. ¿Recargar Forja para actualizar?")) return;
    if (waiting?.state === "installed") {
      reloading.current = true;
      setBusy(true);
      waiting.postMessage({ type: "ACTIVATE_UPDATE" });
    } else window.location.reload();
  };
  const requestInstall = async () => {
    if (!install) { setInstallHelp(true); return; }
    setBusy(true);
    try {
      await install.prompt();
      await install.userChoice;
      setInstall(null);
    } catch (e) { setError(`No se pudo instalar Forja: ${(e as Error).message}`); }
    finally { setBusy(false); }
  };
  return (
    <InstallContext.Provider value={{ available: !installed && !!(install || ios) && !busy, request: requestInstall }}>
      {children}
    <aside className="pwa-notices" aria-label="Estado de la aplicación">
      {!online && <div className="pwa-notice" role="status">Sin conexión. Mantén esta pestaña abierta: tus cambios sin guardar siguen aquí. El constructor y los datos requieren conexión.</div>}
      {online && (waiting || reloadNeeded) && <div className="pwa-notice" role="status">
        <span>Hay una nueva versión de Forja. Guarda tu trabajo antes de recargar.</span>
        <button disabled={busy} onClick={update}>{busy ? "Actualizando…" : "Actualizar Forja"}</button>
      </div>}
      {error && <div className="pwa-notice error-box" role="alert">{error}<button onClick={() => {
        if (confirm("Guarda los cambios de esta pestaña antes de reintentar. ¿Recargar Forja?")) window.location.reload();
      }}>Reintentar</button><button onClick={() => setError("")}>Cerrar</button></div>}
      {installHelp && <div className="pwa-notice" role="status">
        <span>En Safari, abre Compartir y elige «Añadir a pantalla de inicio», luego «Añadir».</span>
        <button onClick={() => setInstallHelp(false)}>Cerrar ayuda</button>
      </div>}
    </aside>
    </InstallContext.Provider>
  );
}
