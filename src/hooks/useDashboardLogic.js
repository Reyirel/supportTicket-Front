import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie, deleteCookie } from '../utils/cookieUtils';

const useDashboardLogic = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Usuario');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userSecretaria, setUserSecretaria] = useState('');
  const [userDireccion, setUserDireccion] = useState('');
  const [userPhone, setUserPhone] = useState('');

  useEffect(() => {
    const token = getCookie('authToken');
    if (!token) {
      console.log('No hay token de autenticación');
      navigate('/');
      return;
    }

    console.log('Token encontrado:', token.substring(0, 15) + '...');
    let timer;
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const expirationTime = payload.exp * 1000;
        const currentTime = new Date().getTime();
        const timeToExpire = expirationTime - currentTime;
        if (timeToExpire <= 0) {
          console.log('Token expirado');
          deleteCookie('authToken');
          localStorage.removeItem('userData');
          navigate('/');
          return;
        } else {
          timer = setTimeout(() => {
            console.log('Token expirado por temporizador');
            deleteCookie('authToken');
            localStorage.removeItem('userData');
            navigate('/');
          }, timeToExpire);
        }
      }
    } catch (error) {
      console.error('Error al decodificar el token:', error);
    }

    try {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        const userInfo = userData.userTicketDTO || userData;
        setUserName(userInfo.name || 'Usuario');
        setUserEmail(userInfo.email || '');
        setUserRole(userInfo.role?.role || '');
        setUserSecretaria(userInfo.secretaria || '');
        setUserDireccion(userInfo.direccion || '');
        setUserPhone(userInfo.phoneNumber || '');
      }
    } catch (error) {
      console.error('Error al obtener datos de usuario:', error);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [navigate]);

  const handleLogout = () => {
    deleteCookie('authToken');
    localStorage.removeItem('userData');
    navigate('/');
  };

  return { userName, userEmail, userRole, userSecretaria, userDireccion, userPhone, handleLogout };
};

export default useDashboardLogic;