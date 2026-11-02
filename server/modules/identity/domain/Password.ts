const COMMON_PASSWORDS = new Set([
  "password",
  "contraseña",
  "1234567890",
  "qwertyuiop",
  "contrasena",
  "password123",
  "123456789a",
]);

export class Password {
  readonly value: string;

  constructor(value: string, email?: string) {
    if (email) {
      Password.assertStrong(value, email);
    }
    this.value = value;
  }

  static assertStrong(password: string, email: string): void {
    if (typeof password !== "string" || password.length < 10) {
      throw new Error("La contraseña debe tener al menos 10 caracteres.");
    }
    if (password.length > 128) {
      throw new Error("La contraseña es demasiado larga (máximo 128 caracteres).");
    }
    const lower = password.toLowerCase();
    if (lower === email.toLowerCase() || COMMON_PASSWORDS.has(lower)) {
      throw new Error("Elige una contraseña menos predecible.");
    }
  }
}
