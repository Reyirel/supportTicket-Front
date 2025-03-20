const getAllTickets = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const token = userData?.token;
    console.log("Token actual:", token ? "Existe" : "No existe");
    
    if (!token) {
      return {
        success: false,
        message: 'No hay sesión activa. Por favor inicie sesión nuevamente.',
        data: []
      };
    }

    const response = await fetch('http://localhost:8080/api/tickets/list-all', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          message: 'La sesión ha expirado. Por favor inicie sesión nuevamente.',
          data: []
        };
      }
      
      return {
        success: false,
        message: `Error ${response.status}: ${response.statusText || 'Error al obtener los tickets'}`,
        data: []
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      data: data,
      message: ''
    };
  } catch (error) {
    console.error("Error al obtener los tickets:", error);
    return {
      success: false,
      message: error.message || 'Error al conectar con el servidor',
      data: []
    };
  }
};

export { getAllTickets };import { motion, AnimatePresence } from 'framer-motion';
