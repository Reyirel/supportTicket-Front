import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, User, LogOut, Home, FileText, BarChart2, Settings, Bell } from 'lucide-react';

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('home');
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es dispositivo móvil
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

  const menuItems = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'reports', icon: FileText, label: 'Reportes' },
    { id: 'analytics', icon: BarChart2, label: 'Analítica' },
    { id: 'settings', icon: Settings, label: 'Configuración' },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
  };
  
  const menuItemVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    closed: {
      opacity: 0,
      y: 20,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Overlay para móvil */}
      {isMobile && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          style={{ display: isOpen ? 'block' : 'none' }}
        />
      )}
      
      {/* Sidebar responsive */}
      <motion.div 
        className={`fixed lg:relative h-full ${isMobile ? 'w-[280px]' : 'w-64'} bg-black z-30 shadow-lg`}
        initial={isMobile ? "closed" : "open"}
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center"
          >
            <div className="h-8 w-8 rounded-full bg-red-900 mr-2"></div>
            <span className="text-white font-bold">DashGuinda</span>
          </motion.div>
          <button 
            onClick={toggleSidebar} 
            className="text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <ul>
            {menuItems.map((item, index) => (
              <motion.li 
                key={item.id}
                variants={menuItemVariants}
                custom={index}
                initial="closed"
                animate="open"
                className={`mb-2 p-2 rounded ${activeItem === item.id ? 'bg-red-900 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
                onClick={() => setActiveItem(item.id)}
              >
                <a href="#" className="flex items-center">
                  <item.icon size={16} className="mr-2" />
                  <span>{item.label}</span>
                </a>
              </motion.li>
            ))}
          </ul>
          
          <div className="absolute bottom-0 w-full left-0 p-4 border-t border-gray-700">
            <ul>
              <motion.li 
                variants={menuItemVariants}
                className="mb-2 p-2 rounded text-gray-400 hover:bg-gray-800"
              >
                <a href="#" className="flex items-center">
                  <User size={16} className="mr-2" />
                  <span>Perfil</span>
                </a>
              </motion.li>
              <motion.li 
                variants={menuItemVariants}
                className="mb-2 p-2 rounded text-gray-400 hover:bg-gray-800"
              >
                <a href="#" className="flex items-center">
                  <LogOut size={16} className="mr-2" />
                  <span>Salir</span>
                </a>
              </motion.li>
            </ul>
          </div>
        </div>
      </motion.div>
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header responsive */}
        <div className="bg-red-900 text-white shadow-md z-10">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="lg:hidden focus:outline-none"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-lg font-bold lg:hidden">DashGuinda</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 focus:outline-none"
              >
                <Bell size={20} />
                <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full"></div>
              </motion.button>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-white mr-2"></div>
                <span className="hidden sm:inline">Usuario</span>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Contenido con scroll y padding responsive */}
        <div className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
          <div className="container mx-auto max-w-7xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4">Panel de Control</h2>
              <p className="text-gray-600">Bienvenido a tu dashboard personalizado.</p>
            </motion.div>
            
            {/* Grid responsive con mejores breakpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((item) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * item }}
                  whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                  className="bg-white rounded-lg shadow-md p-4 sm:p-6"
                >
                  <h3 className="font-bold text-base sm:text-lg mb-2 text-red-900">Tarjeta {item}</h3>
                  <p className="text-sm sm:text-base text-gray-600">Información importante sobre tus datos.</p>
                  
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-500">Progreso</span>
                      <span className="text-xs sm:text-sm font-medium text-red-900">{item * 25}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-1">
                      <motion.div 
                        className="bg-red-900 h-1.5 sm:h-2 rounded-full" 
                        initial={{ width: 0 }}
                        animate={{ width: `${item * 25}%` }}
                        transition={{ duration: 1, delay: 0.2 * item }}
                      ></motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;