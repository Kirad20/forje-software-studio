const normalized = (value: string) => value.normalize("NFKC").replace(/\s+/g, " ").trim().toLocaleLowerCase();
const rememberIntent = /^\s*(?:(?:please|por favor)\s+)?(?:remember|recuerda|recuérdame|recuerdame|guarda(?:r)?|from now on|a partir de ahora|desde ahora|always|never|siempre|nunca)\b/i;
const forgetIntent = /^\s*(?:(?:please|por favor)\s+)?(?:forget|delete|remove|olvida(?:r)?|borra(?:r)?|elimina(?:r)?)\b.*\b(?:memory|memoria|preference|preferencia|decision|decisión|dato)\b/i;
const personalIntent = /\b(?:personal|todos mis proyectos|all my projects|across my projects)\b/i;

export function assertOwnerSourcedMemory(input: {
  text: string;
  sourceQuote: string;
  ownerMessage?: string;
  personal: boolean;
}): void {
  const text = normalized(input.text);
  const quote = normalized(input.sourceQuote);
  const ownerMessage = normalized(input.ownerMessage ?? "");
  if (!ownerMessage || !rememberIntent.test(ownerMessage) || !quote || quote !== text || !ownerMessage.includes(quote)) {
    throw new Error("La memoria solo puede guardar una cita exacta de una instrucción explícita del dueño en este turno.");
  }
  if (input.personal && !personalIntent.test(ownerMessage)) {
    throw new Error("La memoria personal requiere que el dueño indique explícitamente que es personal o válida en todos sus proyectos.");
  }
}

export function assertOwnerRequestedForget(ownerMessage: string | undefined): void {
  if (!ownerMessage || !forgetIntent.test(ownerMessage)) {
    throw new Error("Solo se puede borrar memoria cuando el dueño lo pide explícitamente en este turno.");
  }
}
