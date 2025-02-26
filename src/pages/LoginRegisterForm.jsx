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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLogin) {
      // Aquí normalmente irían las validaciones y la llamada al backend
      console.log('Iniciando sesión:', formData);
      // Simula un inicio de sesión exitoso y navega al dashboard
      navigate('/dashboard');
    } else {
      // Lógica para el registro
      console.log('Registrando usuario:', formData);
      // Aquí puedes añadir la lógica de registro
      // Si el registro es exitoso, también podrías redirigir al dashboard
      // navigate('/dashboard');
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

  // Agrega estas nuevas constantes de animación después de los otros efectos
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
        {/* Elementos decorativos */}
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
          {/* Encabezado y Toggle */}
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

          {/* Toggle switch */}
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
                  fontFamily: 'Arial, sans-serif'
                }}
                {...glowEffect}
              >
                Iniciar Sesión
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
                      style={{ backgroundColor: colors.inputBg, color: colors.text }}
                      placeholder="********"
                      required
                    />
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
                      style={{ backgroundColor: colors.inputBg, color: colors.text }}
                      placeholder="Confirmar teléfono"
                      required
                    />
                  </motion.div>
                </div>
              </div>

              {/* Botón de envío */}
              <motion.button 
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                type="submit" 
                className="w-full py-3 rounded-lg text-white font-medium "
                style={{ 
                  background: `linear-gradient(135deg, ${colors.gradient.start} 0%, ${colors.gradient.middle} 50%, ${colors.gradient.end} 100%)`,
                  boxShadow: '0 4px 15px rgba(160, 33, 66, 0.2)'
                }}
                {...glowEffect}
              >
                Crear Cuenta
              </motion.button>
            </motion.form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginRegisterForm;