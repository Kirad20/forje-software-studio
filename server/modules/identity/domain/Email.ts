export class Email {
  readonly value: string;

  constructor(raw: string) {
    const trimmed = String(raw ?? "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      throw new Error("Correo no válido");
    }
    this.value = trimmed;
  }

  get username(): string {
    return this.value.split("@")[0]!;
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email | string): boolean {
    const val = typeof other === "string" ? other.trim().toLowerCase() : other.value;
    return this.value === val;
  }
}
