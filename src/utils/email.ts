export function hasEmailChanged(currentEmail: string, updatedEmail: string): boolean {
  return currentEmail.toLowerCase() !== updatedEmail?.toLowerCase();
}
