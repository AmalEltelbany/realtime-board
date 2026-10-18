/** One id per browser tab. The API echoes it on broadcasts so this tab can skip changes it already applied. */
export const CLIENT_ID =
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
