export type SettingType = "string" | "number" | "boolean" | "select";

export interface SettingDefinitionProps {
  key: string;
  type: SettingType;
  default: unknown;
  secret?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  validate?: (value: unknown) => unknown;
}

export class SettingDefinition {
  readonly key: string;
  readonly type: SettingType;
  readonly defaultValue: unknown;
  readonly secret: boolean;
  readonly options?: string[];
  readonly min?: number;
  readonly max?: number;
  private readonly validator?: (value: unknown) => unknown;

  constructor(props: SettingDefinitionProps) {
    this.key = props.key;
    this.type = props.type;
    this.defaultValue = props.default;
    this.secret = !!props.secret;
    this.options = props.options;
    this.min = props.min;
    this.max = props.max;
    this.validator = props.validate;
  }

  isSecret(): boolean {
    return this.secret;
  }

  validate(value: unknown): unknown {
    if (this.validator) return this.validator(value);
    if (this.type === "number") {
      const num = typeof value === "number" ? value : Number(value);
      if (Number.isNaN(num)) throw new Error("Debe ser un número");
      if (this.min !== undefined && num < this.min) throw new Error(`Debe ser mayor o igual a ${this.min}`);
      if (this.max !== undefined && num > this.max) throw new Error(`Debe ser menor o igual a ${this.max}`);
      return num;
    }
    if (this.type === "select") {
      const str = String(value);
      if (this.options && !this.options.includes(str)) {
        throw new Error(`Valor no válido: "${str}". Opciones: ${this.options.join(", ")}`);
      }
      return str;
    }
    if (this.type === "boolean") {
      return Boolean(value);
    }
    return String(value ?? "");
  }
}
