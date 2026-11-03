import type { ObserverPorts } from "../ports/observer.js";
let observer: ObserverPorts | undefined;
let registration: symbol | undefined;
export function configureAppServiceObserver(ports: ObserverPorts): () => void {
  const token = Symbol();
  observer = ports;
  registration = token;
  return () => {
    if (registration !== token) return;
    observer = undefined;
    registration = undefined;
  };
}
export const log: ObserverPorts["log"] = (projectId, event) => {
  if (!observer) throw new Error("App service observer is not configured");
  observer.log(projectId, event);
};
