export function saveAuthData(token: string, role: string) {
  localStorage.setItem("auth_token", token);
  localStorage.setItem("auth_role", role);
}
export const getAuthToken = () => localStorage.getItem("auth_token");
export const getAuthRole = () => localStorage.getItem("auth_role");

export const clearAuthData = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_role");
};
