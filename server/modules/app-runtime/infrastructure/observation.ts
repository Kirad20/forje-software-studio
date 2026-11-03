import type { RuntimeObservationPorts } from "../application/ports.js";

let ports: RuntimeObservationPorts | undefined;
let binding: object | undefined;
export function bindRuntimeObservation(next: RuntimeObservationPorts) {
  const current = {};
  binding = current;
  ports = next;
  return () => {
    if (binding !== current) return;
    binding = undefined;
    ports = undefined;
  };
}
function observation() {
  if (!ports) throw new Error("App runtime observation ports have not been bound");
  return ports;
}
export const log: RuntimeObservationPorts["log"] = (...args) => observation().log(...args);
export const watchProblems: RuntimeObservationPorts["watchProblems"] = (...args) => observation().watchProblems(...args);
export const projectEvents: RuntimeObservationPorts["projectEvents"] = {
  on: (...args) => observation().projectEvents.on(...args),
  off: (...args) => observation().projectEvents.off(...args),
};
export const scan: RuntimeObservationPorts["scan"] = (...args) => observation().scan(...args);
