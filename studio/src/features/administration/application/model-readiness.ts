export interface ModelReadiness {
  available: boolean;
  allowed: boolean;
  tools: boolean;
  blockers?: string[];
}

export function modelBlockers(model: ModelReadiness): string[] {
  return model.blockers ?? [
    ...(!model.available ? ["Modelo o proveedor no disponible"] : []),
    ...(!model.allowed ? ["Bloqueado por la lista de la plataforma"] : []),
  ];
}

export function usableModel(model: ModelReadiness): boolean {
  return model.available && model.allowed && modelBlockers(model).length === 0;
}

export function playgroundModel(model: ModelReadiness): boolean {
  // The playground uses the internal evaluation account, not the admin's whitelist.
  return model.available && model.allowed;
}
