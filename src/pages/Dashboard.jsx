import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Home, FileText, BarChart2, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useDashboardLogic from '../hooks/useDashboardLogic';

import Inicio from '../components/Inicio';
import Solicitudes from '../components/Solicitudes';
import Perfil from '../components/Perfil';

const Dashboard = () => {
  const navigate = useNavigate();
  const { userName, userEmail, userRole, userSecretaria, userDireccion, userPhone, handleLogout } = useDashboardLogic();

  // Paleta de colores mejorada - más sólidos pero manteniendo la esencia
  const colors = {
    primary: '#C4E5D8',     // Verde claro más vibrante
    secondary: '#8BBAB0',   // Verde medio más sólido
    accent: '#5B95A0',      // Azul-verde más oscuro y definido
    background: '#F9FAFB',  // Blanco hueso (no tan blanco puro)
    text: '#243442',        // Azul oscuro más definido
    lightText: '#546678',   // Gris azulado más oscuro
    success: '#25913A',     // Verde oscuro más vibrante
    error: '#E01E3C',       // Rojo más vibrante
    cardBg: '#FFFFFF',      // Mantener blanco para las tarjetas
    inputBg: '#EEF2F5',     // Gris claro con toque azulado
    shadow: 'rgba(91, 149, 160, 0.12)', // Sombra basada en el color accent
  };

  // Resto de estados y lógica de UI (sidebar, menú, etc.)
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('home');
  const [isMobile, setIsMobile] = useState(false);
  const [previousItem, setPreviousItem] = useState(null);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      }
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuChange = (itemId) => {
    if (activeItem !== itemId) {
      setPreviousItem(activeItem);
      setActiveItem(itemId);
    }
  };

  // Determina la dirección de la animación basada en el menú anterior y actual
  const getAnimationDirection = () => {
    const menuOrder = ['home', 'reports', 'analytics', 'perfil'];
    if (!previousItem) return 1;
    
    const prevIndex = menuOrder.indexOf(previousItem);
    const currentIndex = menuOrder.indexOf(activeItem);
    
    return prevIndex < currentIndex ? 1 : -1;
  };

  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
  };

  const menuItemVariants = {
    open: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { opacity: 0, y: 20, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  };

  const contentVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    })
  };

  const renderContent = () => {
    const direction = getAnimationDirection();
    
    return (
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={activeItem}
          custom={direction}
          variants={contentVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="w-full h-full"
        >
          {activeItem === 'home' && <Inicio />}
          {activeItem === 'reports' && <Solicitudes />}
          {activeItem === 'perfil' && <Perfil />}
          {!['home', 'reports', 'perfil'].includes(activeItem) && <div>Componente no encontrado</div>}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: colors.background }}>
      {/* Overlay para móvil */}
      {isMobile && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          style={{ display: isOpen ? 'block' : 'none' }}
        />
      )}

      {/* Sidebar mejorado */}
      <motion.div
        className={`fixed lg:relative h-full ${isMobile ? 'w-[280px]' : 'w-72'} shadow-xl z-30`}
        initial={isMobile ? 'closed' : 'open'}
        animate={isOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
        style={{
          background: `linear-gradient(180deg, ${colors.secondary} 0%, ${colors.accent} 100%)`,
          boxShadow: `0 0 20px ${colors.shadow}`,
        }}
      >
        <div className="p-5 flex justify-between items-center border-b" style={{ borderColor: `${colors.primary}60` }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center"
          >
            <div className="h-9 w-9 rounded-full bg-white mr-3 flex items-center justify-center shadow-md">
              <span style={{ color: colors.accent, fontWeight: "bold", fontSize: '16px' }}>TS</span>
            </div>
            <span className="text-white font-bold text-lg tracking-wide">TicketSupport</span>
          </motion.div>
          <button onClick={toggleSidebar} className="text-white lg:hidden hover:bg-white/10 p-1.5 rounded-full">
            <X size={22} />
          </button>
        </div>

        <div className="p-4">
          <ul className="mt-2">
            {[
              { id: 'home', icon: Home, label: 'Inicio' },
              { id: 'reports', icon: FileText, label: 'Reportes' },
              { id: 'analytics', icon: BarChart2, label: 'Analítica' }
            ].map((item, index) => (
              <motion.li
                key={item.id}
                variants={menuItemVariants}
                custom={index}
                initial="closed"
                animate="open"
                className={`mb-3 p-3 rounded-lg transition-all duration-200 font-medium`}
                style={{ 
                  backgroundColor: activeItem === item.id ? colors.primary : 'transparent',
                  color: activeItem === item.id ? colors.text : 'white',
                  boxShadow: activeItem === item.id ? '0 2px 5px rgba(0,0,0,0.08)' : 'none',
                }}
                onClick={() => handleMenuChange(item.id)}
                whileHover={{ 
                  backgroundColor: activeItem === item.id ? colors.primary : `rgba(255, 255, 255, 0.15)`,
                  scale: 1.02
                }}
                whileTap={{ scale: 0.98 }}
              >
                <button className="flex items-center w-full">
                  <item.icon size={18} className="mr-3" />
                  <span className="text-[15px]">{item.label}</span>
                </button>
              </motion.li>
            ))}
          </ul>

          <div className="absolute bottom-0 w-full left-0 p-4 border-t" style={{ borderColor: `${colors.primary}60` }}>
            <ul>
              <motion.li
                variants={menuItemVariants}
                className={`mb-3 p-3 rounded-lg transition-all duration-200 font-medium`}
                style={{ 
                  backgroundColor: activeItem === 'perfil' ? colors.primary : 'transparent',
                  color: activeItem === 'perfil' ? colors.text : 'white',
                  boxShadow: activeItem === 'perfil' ? '0 2px 5px rgba(0,0,0,0.08)' : 'none',
                }}
                onClick={() => handleMenuChange('perfil')}
                whileHover={{ 
                  backgroundColor: activeItem === 'perfil' ? colors.primary : `rgba(255, 255, 255, 0.15)`,
                  scale: 1.02
                }}
                whileTap={{ scale: 0.98 }}
              >
                <button className="flex items-center w-full">
                  <User size={18} className="mr-3" />
                  <span className="text-[15px]">Perfil</span>
                </button>
              </motion.li>
              <motion.li 
                variants={menuItemVariants} 
                className="mb-2 p-3 rounded-lg text-white font-medium"
                whileHover={{ 
                  backgroundColor: `rgba(255, 255, 255, 0.15)`,
                  scale: 1.02
                }}
                whileTap={{ scale: 0.98 }}
              >
                <button onClick={handleLogout} className="flex items-center w-full text-left">
                  <LogOut size={18} className="mr-3" />
                  <span className="text-[15px]">Salir</span>
                </button>
              </motion.li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Contenido principal mejorado */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header mejorado */}
        <div className="shadow-lg z-10" style={{ backgroundColor: colors.accent }}>
          <div className="container mx-auto px-4 py-3.5 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleSidebar} 
                className="lg:hidden focus:outline-none text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold text-white lg:hidden tracking-wide">TicketSupport</h1>
            </div>

            <div className="flex items-center space-x-5">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 focus:outline-none text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <Bell size={22} />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-white rounded-full"></div>
              </motion.button>

              <motion.div 
                whileHover={{ scale: 1.03 }} 
                className="flex items-center cursor-pointer text-white hover:bg-white/10 py-1.5 px-3 rounded-lg transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-white text-sm flex items-center justify-center mr-3 shadow-md"
                     style={{ color: colors.accent, fontWeight: 'bold' }}>
                  {userName?.charAt(0) || "U"}
                </div>
                <span className="hidden sm:inline font-medium text-[15px]">{userName}</span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Contenido principal con mejores sombras y espaciado */}
        <div className="flex-1 overflow-auto p-4 sm:p-5 lg:p-6" style={{ backgroundColor: colors.background }}>
          <div className="container mx-auto max-w-7xl">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;