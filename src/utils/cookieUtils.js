// Función para obtener el valor de una cookie por su nombre
export const getCookie = (name) => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
};

// Función para establecer una cookie
export const setCookie = (name, value, options = {}) => {
  const { path = '/', maxAge = 86400, sameSite = 'strict' } = options;
  document.cookie = `${name}=${value}; path=${path}; max-age=${maxAge}; samesite=${sameSite}`;
};

// Función para eliminar una cookie
export const deleteCookie = (name) => {
  document.cookie = `${name}=; path=/; max-age=0`;
};

// Función para decodificar token JWT
export const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return null;
  }
};