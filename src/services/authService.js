export const registerUser = async (dataToSend) => {
  try {
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    });

    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      console.error('Error al procesar JSON:', jsonError);
      if (response.ok) {
        return { success: true, message: 'Registro exitoso. Ahora puedes iniciar sesión.' };
      }
      return {
        success: false,
        message: `Error en el servidor: ${response.status} ${response.statusText}`
      };
    }

    if (response.ok) {
      return { success: true, data: result, message: 'Registro exitoso. Ahora puedes iniciar sesión.' };
    }
    return { success: false, message: result.message || `Error en el servidor: ${response.status}` };
  } catch (error) {
    console.error('Error en registerUser:', error);
    return {
      success: false,
      message: `Error de red: ${error.message || 'Verifica tu conexión e intenta nuevamente'}`
    };
  }
};

export const loginUser = async (loginData) => {
  try {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
      credentials: 'include',
      mode: 'cors'
    });

    if (!response.ok) {
      console.error('Error en la respuesta:', response.status, response.statusText);
      return {
        success: false,
        message: `Error en el servidor: ${response.status} ${response.statusText}`
      };
    }

    const responseText = await response.text();
    let data, token;
    try {
      data = JSON.parse(responseText);
      token = data.token;
    } catch (e) {
      console.log('La respuesta no es JSON válido, asumiendo que es el token');
      token = responseText;
      data = {
        token,
        userTicketDTO: { email: loginData.email }
      };
    }

    if (token) {
      // Guardar el token en una cookie
      document.cookie = `authToken=${token}; path=/; max-age=86400; samesite=strict`;
      // Guardar los datos del usuario en localStorage
      localStorage.setItem(
        'userData',
        JSON.stringify({
          token: token,
          userTicketDTO: data.userTicketDTO || { email: loginData.email }
        })
      );
      return { success: true, token, message: 'Inicio de sesión exitoso. Redirigiendo...' };
    } else {
      console.error('No se encontró token en la respuesta:', responseText);
      return { success: false, message: 'Error en la autenticación: No se encontró token' };
    }
  } catch (error) {
    console.error('Error completo en loginUser:', error);
    return {
      success: false,
      message: 'Error de conexión. Verifica tu conexión e intenta nuevamente.'
    };
  }
};