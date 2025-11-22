
export function saveAuthData(token: string, role: string) {
  localStorage.setItem("token", token); 
  localStorage.setItem("role", role);
}

export const getAuthToken = () => localStorage.getItem("token");
export const getAuthRole = () => localStorage.getItem("role");

export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
};
