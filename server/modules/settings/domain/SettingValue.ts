export class SettingValue {
  constructor(
    readonly rawValue: unknown,
    readonly isSecret: boolean,
  ) {}

  toPublicRepresentation(): unknown {
    if (this.isSecret) {
      return this.rawValue ? "••••••••" : "";
    }
    return this.rawValue;
  }
}
