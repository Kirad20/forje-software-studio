export function assertOwnerRequestedPublish(ownerMessage: string | undefined): void {
  const request = (ownerMessage ?? "").normalize("NFKC");
  const publishVerb = String.raw`(?:publica(?:r|s|mos|n)?|publiques|despliega(?:r|s|mos|n)?|despliegues|publish|deploy)`;
  const affirmative = new RegExp(String.raw`(?:^\s*(?:(?:por favor|please|ahora|ya puedes|go ahead and)\s+)*|(?:and|then|also|y|después|luego)\s+)(?:la\s+|lo\s+)?${publishVerb}\b`, "i");
  const declined = new RegExp(String.raw`\b(?:no|nunca|don't|do not|never)\s+(?:la\s+|lo\s+)?${publishVerb}\b`, "i");
  if (!affirmative.test(request) || declined.test(request)) {
    throw new Error("Publicar requiere una petición explícita y afirmativa del dueño en este turno.");
  }
}

export function assertOwnerRequestedSecret(ownerMessage: string | undefined, secretName: string): void {
  const request = (ownerMessage ?? "").normalize("NFKC");
  const explicitlyRequested =
    /\b(?:add|request|need|use|set up|configure|integrat(?:e|ion)|connect|añade|agrega|solicita|necesito|usa|configura|integra|conecta)\b/i.test(request) &&
    /\b(?:secret|api[\s_-]?key|credential|clave(?:\s+de\s+api)?|credencial|integrat(?:e|ion)|integra(?:r|s|mos|n|ción)|connect|conecta(?:r|s|mos|n)?)\b/i.test(request);
  const serviceParts = secretName.split(/[_-]/).filter((part) => part.length > 2);
  const service = serviceParts.some((part) => new RegExp(String.raw`\b${part}\b`, "i").test(request));
  const sensitiveWords = String.raw`(?:secret|api[\s_-]?key|credential|clave|credencial|${serviceParts.join("|")})`;
  const declined = new RegExp(String.raw`\b(?:no|nunca|don't|do not|never|no quiero|sin)\b[^.!?\n]{0,100}\b${sensitiveWords}\b`, "i").test(request);
  if (declined || (!explicitlyRequested && !service)) {
    throw new Error(`Solicitar ${secretName} requiere una petición del dueño relacionada con secretos o esa integración en este turno.`);
  }
}

export function assertOwnerRequestedAuthSetup(ownerMessage: string | undefined): void {
  const request = (ownerMessage ?? "").normalize("NFKC");
  const asksForAuth = /\b(?:auth|authentication|autenticación|sign[\s-]?in|sign[\s-]?up|log[\s-]?in|inicio de sesión|registro)\b/i.test(request);
  const declinesAuth = /\b(?:no|nunca|don't|do not|never|no quiero)\b[^.!?\n]{0,80}\b(?:auth|authentication|autenticación|sign[\s-]?in|sign[\s-]?up|log[\s-]?in|inicio de sesión|registro)\b/i.test(request);
  if (!asksForAuth || declinesAuth) {
    throw new Error("Configurar autenticación requiere una petición del dueño sobre inicio de sesión o registro en este turno.");
  }
}
