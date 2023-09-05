
export function getOpenAIToken(): string | null {
  const token = localStorage.getItem("ai-token");
  if (token) {
    return token;
  }
  return null;
}

export function setOpenAIToken(token: string) {
  localStorage.setItem("ai-token", token);
}
