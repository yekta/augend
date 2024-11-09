export function isAdmin(role: string | null | undefined) {
  return role === "org:admin";
}
