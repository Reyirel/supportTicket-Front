import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaBuilding, FaMapMarkerAlt, FaPhone, FaUserTag } from "react-icons/fa";

const Perfil = () => {
  const [userData, setUserData] = useState(null);

  // Usar la misma paleta de colores que en el Dashboard
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

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  if (!userData) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center text-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{ 
          height: "100vh",
          overflow: "hidden",
          color: colors.text,
          backgroundColor: colors.background
        }}
      >
        <h1 className="text-4xl font-bold mb-3" style={{ color: colors.text }}>Perfil</h1>
        <p className="max-w-md" style={{ color: colors.lightText }}>
          No se encontró información del usuario. Inicia sesión para ver tus datos.
        </p>
        <motion.div
          className="mt-8 w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: colors.inputBg }}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <FaUser style={{ color: colors.secondary }} className="text-2xl" />
        </motion.div>
      </motion.div>
    );
  }

  const { userTicketDTO } = userData;
  
  // Determinar el color basado en el rol
  let roleColor = colors.accent;
  if (userTicketDTO.role?.role) {
    if (userTicketDTO.role.role.toLowerCase().includes("admin")) {
      roleColor = colors.accent;
    } else if (userTicketDTO.role.role.toLowerCase().includes("técnico")) {
      roleColor = colors.success;
    }
  }

  // Variantes para animaciones secuenciales
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <motion.div 
      className="flex items-center justify-center h-[90vh] py-0"
      style={{ backgroundColor: colors.background }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <motion.div 
        className="rounded-2xl w-full max-w-xl overflow-hidden"
        style={{ 
          backgroundColor: colors.cardBg,
          boxShadow: `0 10px 25px ${colors.shadow}` 
        }}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7, type: "spring" }}
      >
        {/* Banner superior con gradiente */}
        <div className="h-32 relative" style={{
          background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.accent} 100%)`
        }}>
          <motion.div 
            className="absolute -bottom-16 left-8 w-32 h-32 rounded-full border-4 flex items-center justify-center text-3xl font-bold"
            style={{ 
              borderColor: colors.cardBg,
              backgroundColor: colors.primary,
              color: colors.text,
              boxShadow: `0 5px 15px ${colors.shadow}` 
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
          >
            {getInitials(userTicketDTO.name)}
          </motion.div>
        </div>
        
        <div className="pt-20 pb-8 px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 
              className="text-3xl font-semibold mb-1"
              style={{ color: colors.text }}
              variants={itemVariants}
            >
              {userTicketDTO.name}
            </motion.h1>
            
            <motion.div 
              className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mb-6"
              style={{ backgroundColor: roleColor }}
              variants={itemVariants}
            >
              {userTicketDTO.role?.role || "No asignado"}
            </motion.div>
            
            <motion.div 
              className="grid gap-5 mt-2"
              variants={containerVariants}
            >
              <motion.div 
                variants={itemVariants}
                className="flex items-center p-4 rounded-lg border transition-colors shadow-sm"
                style={{ 
                  borderColor: `${colors.primary}40`,
                  backgroundColor: colors.cardBg
                }}
                whileHover={{ 
                  scale: 1.02, 
                  backgroundColor: colors.inputBg,
                  boxShadow: `0 4px 12px ${colors.shadow}`
                }}
              >
                <FaEnvelope style={{ color: colors.accent }} className="text-xl mr-4" />
                <div>
                  <p className="text-sm" style={{ color: colors.lightText }}>Email</p>
                  <p className="font-medium" style={{ color: colors.text }}>{userTicketDTO.email}</p>
                </div>
              </motion.div>
              <motion.div 
                variants={itemVariants}
                className="flex items-center p-4 rounded-lg border transition-colors shadow-sm"
                style={{ 
                  borderColor: `${colors.primary}40`,
                  backgroundColor: colors.cardBg
                }}
                whileHover={{ 
                  scale: 1.02, 
                  backgroundColor: colors.inputBg,
                  boxShadow: `0 4px 12px ${colors.shadow}`
                }}
              >
                <FaUserTag style={{ color: colors.accent }} className="text-xl mr-4" />
                <div>
                  <p className="text-sm" style={{ color: colors.lightText }}>ID de Usuario</p>
                  <p className="font-medium" style={{ color: colors.text }}>{userTicketDTO.id}</p>
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="flex items-center p-4 rounded-lg border transition-colors shadow-sm"
                style={{ 
                  borderColor: `${colors.primary}40`,
                  backgroundColor: colors.cardBg
                }}
                whileHover={{ 
                  scale: 1.02, 
                  backgroundColor: colors.inputBg,
                  boxShadow: `0 4px 12px ${colors.shadow}`
                }}
              >
                <FaBuilding style={{ color: colors.accent }} className="text-xl mr-4" />
                <div>
                  <p className="text-sm" style={{ color: colors.lightText }}>Secretaría</p>
                  <p className="font-medium" style={{ color: colors.text }}>{userTicketDTO.secretaria}</p>
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="flex items-center p-4 rounded-lg border transition-colors shadow-sm"
                style={{ 
                  borderColor: `${colors.primary}40`,
                  backgroundColor: colors.cardBg
                }}
                whileHover={{ 
                  scale: 1.02, 
                  backgroundColor: colors.inputBg,
                  boxShadow: `0 4px 12px ${colors.shadow}`
                }}
              >
                <FaMapMarkerAlt style={{ color: colors.accent }} className="text-xl mr-4" />
                <div>
                  <p className="text-sm" style={{ color: colors.lightText }}>Dirección</p>
                  <p className="font-medium" style={{ color: colors.text }}>{userTicketDTO.direccion}</p>
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="flex items-center p-4 rounded-lg border transition-colors shadow-sm"
                style={{ 
                  borderColor: `${colors.primary}40`,
                  backgroundColor: colors.cardBg
                }}
                whileHover={{ 
                  scale: 1.02, 
                  backgroundColor: colors.inputBg,
                  boxShadow: `0 4px 12px ${colors.shadow}`
                }}
              >
                <FaPhone style={{ color: colors.accent }} className="text-xl mr-4" />
                <div>
                  <p className="text-sm" style={{ color: colors.lightText }}>Teléfono</p>
                  <p className="font-medium" style={{ color: colors.text }}>{userTicketDTO.phoneNumber}</p>
                </div>
              </motion.div>
              
              
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Perfil;
