function readMessage(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function collectErrorMessages(
  error: unknown,
  messages: string[],
  seen: Set<object>,
  depth: number,
): void {
  if (depth > 4) return;

  const directMessage = readMessage(error);
  if (directMessage) {
    messages.push(directMessage);
    return;
  }
  if (!error || typeof error !== "object" || seen.has(error)) return;
  seen.add(error);

  const record = error as Record<string, unknown>;
  const shortMessage = readMessage(record.shortMessage);
  if (shortMessage) {
    messages.push(shortMessage);
  } else {
    for (const key of ["message", "details", "reason"] as const) {
      const message = readMessage(record[key]);
      if (message) messages.push(message);
    }
  }

  for (const key of ["data", "error", "cause", "response"] as const) {
    collectErrorMessages(record[key], messages, seen, depth + 1);
  }
}

export function formatUnknownError(
  error: unknown,
  fallback = "An unknown error occurred.",
): string {
  const messages: string[] = [];
  collectErrorMessages(error, messages, new Set<object>(), 0);

  const uniqueMessages = [...new Set(messages)];
  if (uniqueMessages.length > 0) return uniqueMessages.join(" — ");

  if (error !== undefined && error !== null) {
    try {
      const serialized = JSON.stringify(error);
      if (serialized && serialized !== "{}") return serialized;
    } catch {
      // Circular wallet/provider objects fall through to the safe fallback.
    }
  }
  return fallback;
}
