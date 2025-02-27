import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LoginRegisterForm = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    secretaria: '',
    direccion: '',
    email: '',
    telefono: '',
    confirmTelefono: ''
  });
  // Agregar estados para manejar errores
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });

  // Paleta de colores actualizada
  const colors = {
    primary: '#a02142',
    secondary: '#731630',
    accent: '#c4264f',
    background: '#f5f5f5',
    text: '#000000',
    lightText: '#4a4a4a',
    success: '#2d8236',
    error: '#d90429',
    cardBg: '#ffffff',
    inputBg: '#f0f0f0',
    gradient: {
      start: '#a02142',
      middle: '#731630',
      end: '#4a0f1f'
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Limpiar error del campo cuando el usuario escribe
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  // validar datos de registro
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin) {
      // Validación para registro
      const newErrors = {};

      // Validar contraseñas
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }

      // Validar teléfonos
      if (formData.telefono !== formData.confirmTelefono) {
        newErrors.confirmTelefono = 'Los números de teléfono no coinciden';
      }

      // Verificar si hay errores
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Preparar datos para enviar al backend
      const dataToSend = {
        name: formData.name,
        secretaria: formData.secretaria,
        direccion: formData.direccion,
        email: formData.email,
        phoneNumber: formData.telefono,
        password: formData.password
      };

      setIsSubmitting(true);
      try {
        const response = await fetch('http://localhost:8080/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSend)
        });

        // Intenta procesar la respuesta JSON de manera segura
        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('Error al procesar JSON:', jsonError);
          // El servidor respondió, pero no con JSON válido
          if (response.ok) {
            // Si el estado es exitoso pero no hay JSON válido
            setSubmitMessage({
              type: 'success',
              message: 'Registro exitoso. Ahora puedes iniciar sesión.'
            });
            
            // Reiniciar formulario y cambiar a login
            setFormData({
              name: '',
              password: '',
              confirmPassword: '',
              secretaria: '',
              direccion: '',
              email: '',
              telefono: '',
              confirmTelefono: ''
            });
            setTimeout(() => {
              setIsLogin(true);
            }, 2000);
            return;
          } else {
            // Error en la respuesta pero sin JSON válido
            setSubmitMessage({
              type: 'error',
              message: `Error en el servidor: ${response.status} ${response.statusText}`
            });
            return;
          }
        }
        
        console.log('Respuesta del servidor (registro):', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries([...response.headers]),
          data: data
        });

        if (response.ok) {
          setSubmitMessage({
            type: 'success',
            message: 'Registro exitoso. Ahora puedes iniciar sesión.'
          });

          setFormData({
            name: '',
            password: '',
            confirmPassword: '',
            secretaria: '',
            direccion: '',
            email: '',
            telefono: '',
            confirmTelefono: ''
          });
          setTimeout(() => {
            setIsLogin(true);
          }, 2000);
        } else {
          setSubmitMessage({
            type: 'error',
            message: data.message || `Error en el servidor: ${response.status}`
          });
        }
      } catch (error) {
        console.error('Error completo:', error);
        setSubmitMessage({
          type: 'error',
          message: `Error de red: ${error.message || 'Verifica tu conexión e intenta nuevamente'}`
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Lógica para inicio de sesión
      const loginData = {
        email: formData.email,
        password: formData.password
      };

      // Mostramos el JSON que se enviará al servidor
      console.log('JSON de login enviado:', JSON.stringify(loginData, null, 2));

      setIsSubmitting(true);
      try {
        // Antes de la petición, mostrar los datos que se enviarán
        console.log('Datos de inicio de sesión a enviar:', {
          endpoint: 'http://localhost:8080/api/auth/login',
          método: 'POST',
          headers: { 'Content-Type': 'application/json' },
          datos: loginData
        });
        
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(loginData)
        });

        const data = await response.json();

        // Agregamos console.log para mostrar la respuesta del servidor en el login
        console.log('Respuesta del servidor (login):', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries([...response.headers]),
          data: data
        });

        if (response.ok) {
          // Verificar que realmente tenemos un token en la respuesta
          console.log('Token recibido:', data.token);
          
          if (!data.token) {
            console.error('No se recibió token en la respuesta');
            setSubmitMessage({
              type: 'error',
              message: 'Error en la autenticación: No se recibió token'
            });
            setIsSubmitting(false);
            return;
          }
          
          // Guardar el token en localStorage ANTES de la redirección
          localStorage.setItem('authToken', data.token);
          console.log('Token guardado en localStorage:', localStorage.getItem('authToken'));
          
          setSubmitMessage({
            type: 'success',
            message: 'Inicio de sesión exitoso. Redirigiendo...'
          });
          
          // Redirección con setTimeout para asegurar que el estado se actualice
          setTimeout(() => {
            console.log('Intentando redirección a /dashboard después de timeout');
            try {
              navigate('/dashboard', { replace: true });
              console.log('Navegación completada');
            } catch (navError) {
              console.error('Error en navigate:', navError);
              window.location.href = '/dashboard';
            }
          }, 1000);
        } else {
          setSubmitMessage({
            type: 'error',
            message: data.message || 'Credenciales incorrectas. Intente nuevamente.'
          });
        }
      } catch (error) {
        setSubmitMessage({
          type: 'error',
          message: 'Error de conexión. Verifica tu conexión e intenta nuevamente.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  const switchVariants = {
    login: { x: 0, opacity: 1 },
    register: { x: '100%', opacity: 0 }
  };

  const registerVariants = {
    login: { x: '100%', opacity: 0 },
    register: { x: 0, opacity: 1 }
  };

  // Nuevos efectos de animación
  const pageTransition = {
    type: "spring",
    stiffness: 200,
    damping: 20
  };

  const glowEffect = {
    animate: {
      boxShadow: [
        "0 0 0 rgba(160, 33, 66, 0)",
        "0 0 20px rgba(160, 33, 66, 0.3)",
        "0 0 0 rgba(160, 33, 66, 0)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity
      }
    }
  };

  const floatingEffect = {
    animate: {
      y: ["0%", "-2%", "0%"],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Actualiza los buttonVariants existentes
  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: '0px 5px 15px rgba(160, 33, 66, 0.3)',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95,
      boxShadow: '0px 2px 5px rgba(160, 33, 66, 0.2)'
    }
  };

  const formTransitionVariants = {
    initial: {
      scale: 0.95,
      opacity: 0,
      height: 'auto',
    },
    animateLogin: {
      scale: 1,
      opacity: 1,
      height: 'auto',
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.4
      }
    },
    animateRegister: {
      scale: 1,
      opacity: 1,
      height: 'auto',
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.4
      }
    },
    exit: {
      scale: 0.95,
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-8"
      style={{ backgroundColor: colors.background }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`w-full ${isLogin ? 'max-w-md' : 'max-w-2xl'} p-8 m-4 rounded-xl shadow-2xl relative overflow-hidden`}
        style={{
          backgroundColor: colors.cardBg,
          transition: 'max-width 0.3s ease-in-out'
        }}
      >
        <motion.div
          className="absolute top-0 right-0 w-32 h-32 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            filter: 'blur(60px)',
            opacity: 0.6,
            zIndex: 0
          }}
          animate={{
            x: [0, 10, 0],
            y: [0, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 8,
            ease: "easeInOut",
            repeat: Infinity
          }}
        />

        <motion.div
          className="absolute bottom-0 left-0 w-40 h-40 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.accent} 100%)`,
            filter: 'blur(70px)',
            opacity: 0.5,
            zIndex: 0
          }}
          animate={{
            x: [0, -10, 0],
            y: [0, 10, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 10,
            ease: "easeInOut",
            repeat: Infinity,
            delay: 1
          }}
        />

        <div className="relative z-10">
          <div className="text-center">
            <motion.h2
              className="text-3xl font-bold mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ color: colors.text, fontFamily: 'Arial, sans-serif' }}
            >
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </motion.h2>

            <motion.p
              className="text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ color: colors.lightText, fontFamily: 'Arial, sans-serif' }}
            >
              {isLogin ? 'Bienvenido de nuevo' : 'Únete a nosotros'}
            </motion.p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="bg-gray-200 rounded-full p-1 flex w-64 relative">
              <motion.div
                className="absolute w-1/2 h-full bg-white rounded-full shadow-md"
                animate={{ x: isLogin ? 0 : '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{ top: '0', left: '0' }}
              />
              <motion.button
                className="py-2 w-1/2 text-center relative z-10 rounded-full"
                onClick={() => setIsLogin(true)}
                style={{ color: isLogin ? colors.primary : colors.lightText, fontFamily: 'Arial, sans-serif' }}
                whileTap={{ scale: 0.95 }}
              >
                Iniciar Sesión
              </motion.button>
              <motion.button
                className="py-2 w-1/2 text-center relative z-10 rounded-full"
                onClick={() => setIsLogin(false)}
                style={{ color: !isLogin ? colors.primary : colors.lightText, fontFamily: 'Arial, sans-serif' }}
                whileTap={{ scale: 0.95 }}
              >
                Registrarse
              </motion.button>
            </div>
          </div>

          {/* Formularios */}
          <div className="relative">
            <motion.form
              key="loginForm"
              initial="initial"
              animate={isLogin ? "animateLogin" : "exit"}
              variants={formTransitionVariants}
              onSubmit={handleSubmit}
              className="space-y-4"
              style={{
                display: isLogin ? 'block' : 'none',
                transformOrigin: 'center'
              }}
            >
              {/* Campo de email */}
              <motion.div variants={itemVariants}>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: colors.text, fontFamily: 'Arial, sans-serif' }}
                >
                  Email
                </label>
                <motion.input
                  whileFocus={{
                    scale: 1.02,
                    boxShadow: `0 0 0 2px ${colors.primary}20`,
                    backgroundColor: '#ffffff'
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20
                  }}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg"
                  style={{ backgroundColor: colors.inputBg, color: colors.text, fontFamily: 'Arial, sans-serif' }}
                  placeholder="tu@email.com"
                  required
                />
              </motion.div>

              {/* Campo de contraseña */}
              <motion.div variants={itemVariants}>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: colors.text, fontFamily: 'Arial, sans-serif' }}
                >
                  Contraseña
                </label>
                <motion.input
                  whileFocus={{
                    scale: 1.02,
                    boxShadow: `0 0 0 2px ${colors.primary}20`,
                    backgroundColor: '#ffffff'
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20
                  }}
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg"
                  style={{ backgroundColor: colors.inputBg, color: colors.text, fontFamily: 'Arial, sans-serif' }}
                  placeholder="********"
                  required
                />
              </motion.div>

              {/* Enlace de contraseña olvidada */}
              <motion.div
                variants={itemVariants}
                className="text-right"
              >
                <a
                  href="#"
                  className="text-sm hover:underline"
                  style={{ color: colors.primary, fontFamily: 'Arial, sans-serif' }}
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </motion.div>

              {/* Mensajes de éxito o error - AÑADIR ESTO */}
              {submitMessage.message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg text-center mb-4`}
                  style={{
                    backgroundColor: submitMessage.type === 'success' ? `${colors.success}20` : `${colors.error}20`,
                    color: submitMessage.type === 'success' ? colors.success : colors.error
                  }}
                >
                  {submitMessage.message}
                </motion.div>
              )}

              {/* Botón de envío */}
              <motion.button
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                type="submit"
                className="w-full py-3 rounded-lg text-white font-medium mt-6"
                style={{
                  background: `linear-gradient(135deg, ${colors.gradient.start} 0%, ${colors.gradient.middle} 50%, ${colors.gradient.end} 100%)`,
                  boxShadow: '0 4px 15px rgba(160, 33, 66, 0.2)',
                  fontFamily: 'Arial, sans-serif',
                  opacity: isSubmitting ? 0.7 : 1
                }}
                {...glowEffect}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Procesando...' : 'Iniciar Sesión'}
              </motion.button>
            </motion.form>

            {/* Formulario de registro */}
            <motion.form
              key="registerForm"
              initial="initial"
              animate={!isLogin ? "animateRegister" : "exit"}
              variants={formTransitionVariants}
              onSubmit={handleSubmit}
              className="space-y-4"
              style={{
                display: !isLogin ? 'block' : 'none',
                transformOrigin: 'center'
              }}
            >
              {/* Sección de Información Personal */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
                  Información Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                      Nombre
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02, boxShadow: `0 0 0 2px ${colors.primary}20`, backgroundColor: '#ffffff' }}
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg"
                      style={{ backgroundColor: colors.inputBg, color: colors.text }}
                      placeholder="Nombre Completo"
                      required
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                      Correo Electrónico
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02, boxShadow: `0 0 0 2px ${colors.primary}20`, backgroundColor: '#ffffff' }}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg"
                      style={{ backgroundColor: colors.inputBg, color: colors.text }}
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </motion.div>
                </div>
              </div>
              <hr />

              {/* Sección de Contraseñas */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
                  Seguridad
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                      Contraseña
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02, boxShadow: `0 0 0 2px ${colors.primary}20`, backgroundColor: '#ffffff' }}
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg"
                      style={{ backgroundColor: colors.inputBg, color: colors.text }}
                      placeholder="********"
                      required
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                      Confirmar Contraseña
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02, boxShadow: `0 0 0 2px ${colors.primary}20`, backgroundColor: '#ffffff' }}
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg"
                      style={{
                        backgroundColor: colors.inputBg,
                        color: colors.text,
                        borderColor: errors.confirmPassword ? colors.error : 'transparent',
                        borderWidth: errors.confirmPassword ? '1px' : '0'
                      }}
                      placeholder="********"
                      required
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs mt-1" style={{ color: colors.error }}>
                        {errors.confirmPassword}
                      </p>
                    )}
                  </motion.div>
                </div>
              </div>

              <hr />

              {/* Sección de Información Institucional */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
                  Información Institucional
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                      Secretaría
                    </label>
                    <motion.select
                      whileFocus={{ scale: 1.02, boxShadow: `0 0 0 2px ${colors.primary}20`, backgroundColor: '#ffffff' }}
                      name="secretaria"
                      value={formData.secretaria}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg"
                      style={{ backgroundColor: colors.inputBg, color: colors.text }}
                      required
                    >
                      <option value="">Seleccione una secretaría</option>
                      <option value="secretaria1">Secretaría 1</option>
                      <option value="secretaria2">Secretaría 2</option>
                      <option value="secretaria3">Secretaría 3</option>
                    </motion.select>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                      Dirección
                    </label>
                    <motion.select
                      whileFocus={{ scale: 1.02, boxShadow: `0 0 0 2px ${colors.primary}20`, backgroundColor: '#ffffff' }}
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg"
                      style={{ backgroundColor: colors.inputBg, color: colors.text }}
                      required
                    >
                      <option value="">Seleccione una dirección</option>
                      <option value="direccion1">Dirección 1</option>
                      <option value="direccion2">Dirección 2</option>
                      <option value="direccion3">Dirección 3</option>
                    </motion.select>
                  </motion.div>
                </div>
              </div>

              <hr />
              {/* Sección de Contacto */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
                  Información de Contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                      Teléfono
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02, boxShadow: `0 0 0 2px ${colors.primary}20`, backgroundColor: '#ffffff' }}
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg"
                      style={{ backgroundColor: colors.inputBg, color: colors.text }}
                      placeholder="Número de teléfono"
                      required
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                      Confirmar Teléfono
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02, boxShadow: `0 0 0 2px ${colors.primary}20`, backgroundColor: '#ffffff' }}
                      type="tel"
                      name="confirmTelefono"
                      value={formData.confirmTelefono}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg"
                      style={{
                        backgroundColor: colors.inputBg,
                        color: colors.text,
                        borderColor: errors.confirmTelefono ? colors.error : 'transparent',
                        borderWidth: errors.confirmTelefono ? '1px' : '0'
                      }}
                      placeholder="Confirmar teléfono"
                      required
                    />
                    {errors.confirmTelefono && (
                      <p className="text-xs mt-1" style={{ color: colors.error }}>
                        {errors.confirmTelefono}
                      </p>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Mensajes de éxito o error */}
              {submitMessage.message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg text-center mb-4`}
                  style={{
                    backgroundColor: submitMessage.type === 'success' ? `${colors.success}20` : `${colors.error}20`,
                    color: submitMessage.type === 'success' ? colors.success : colors.error
                  }}
                >
                  {submitMessage.message}
                </motion.div>
              )}

              {/* Botón de envío */}
              <motion.button
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                type="submit"
                className="w-full py-3 rounded-lg text-white font-medium "
                style={{
                  background: `linear-gradient(135deg, ${colors.gradient.start} 0%, ${colors.gradient.middle} 50%, ${colors.gradient.end} 100%)`,
                  boxShadow: '0 4px 15px rgba(160, 33, 66, 0.2)',
                  opacity: isSubmitting ? 0.7 : 1
                }}
                {...glowEffect}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Procesando...' : 'Crear Cuenta'}
              </motion.button>
            </motion.form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginRegisterForm;