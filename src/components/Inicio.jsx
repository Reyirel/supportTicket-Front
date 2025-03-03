import React from "react";
import { motion } from "framer-motion";

const Inicio = () => {
    // Paleta de colores consistente con Dashboard
    const colors = {
        primary: '#C4E5D8',     // Verde claro más vibrante
        secondary: '#8BBAB0',   // Verde medio más sólido
        accent: '#5B95A0',      // Azul-verde más oscuro y definido
        background: '#F9FAFB',  // Blanco hueso
        text: '#243442',        // Azul oscuro más definido
        lightText: '#546678',   // Gris azulado más oscuro
        cardBg: '#FFFFFF',      // Blanco para las tarjetas
        shadow: 'rgba(91, 149, 160, 0.12)', // Sombra basada en el color accent
    };

    // Variantes para animaciones
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2
            }
        }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5 }
        }
    };

    const features = [
        {
            title: "Registro de Incidencias",
            description: "Reporta problemas tecnológicos de forma rápida y sencilla",
            icon: "🔧"
        },
        {
            title: "Seguimiento en Tiempo Real",
            description: "Monitorea el estado actual de tus solicitudes",
            icon: "📊"
        },
        {
            title: "Notificaciones Automáticas",
            description: "Recibe alertas sobre actualizaciones de tus casos",
            icon: "🔔"
        }
    ];

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="container"
            style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}
        >
            <motion.div 
                className="header"
                style={{ textAlign: "center", marginBottom: "40px" }}
            >
                <motion.h1 
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, type: "spring" }}
                    whileHover={{ scale: 1.05 }}
                    style={{ color: colors.accent, fontSize: "2.3rem", fontWeight: "bold", letterSpacing: "0.5px" }}
                >
                    Sistema de Gestión de Problemas Tecnológicos
                </motion.h1>
                
                <motion.div 
                    style={{ 
                        height: "4px", 
                        background: `linear-gradient(to right, ${colors.secondary}, ${colors.accent})`, 
                        width: "100px", 
                        margin: "15px auto" 
                    }}
                    initial={{ width: "0px" }}
                    animate={{ width: "100px" }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                />
                
                <motion.p 
                    variants={itemVariants}
                    style={{ 
                        fontSize: "1.05rem", 
                        maxWidth: "600px", 
                        margin: "20px auto", 
                        color: colors.lightText, 
                        lineHeight: "1.6",
                        fontWeight: "400"
                    }}
                >
                    Plataforma integral para la solicitud, seguimiento y resolución 
                    de problemas tecnológicos en tu organización.
                </motion.p>
                
                <motion.button
                    whileHover={{ 
                        scale: 1.05, 
                        backgroundColor: colors.secondary 
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    style={{ 
                        background: `linear-gradient(to right, ${colors.accent}, ${colors.secondary})`,
                        color: "white", 
                        border: "none", 
                        padding: "12px 30px", 
                        borderRadius: "8px", 
                        fontSize: "16px", 
                        fontWeight: "500",
                        cursor: "pointer",
                        boxShadow: `0 4px 10px ${colors.shadow}`,
                        letterSpacing: "0.3px"
                    }}
                >
                    Crear Nueva Solicitud
                </motion.button>
            </motion.div>
            
            <motion.div 
                style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "20px",
                    marginBottom: "40px" 
                }}
                variants={containerVariants}
            >
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ 
                            y: -10, 
                            boxShadow: `0 10px 20px ${colors.shadow}`,
                        }}
                        style={{
                            backgroundColor: colors.cardBg,
                            padding: "25px",
                            borderRadius: "10px",
                            boxShadow: `0 4px 6px ${colors.shadow}`,
                            transition: "box-shadow 0.3s ease",
                            border: `1px solid ${colors.primary}`
                        }}
                    >
                        <motion.div 
                            style={{ fontSize: "2.5rem", marginBottom: "15px" }}
                            animate={{ 
                                rotate: [0, 10, 0, -10, 0],
                                transition: { 
                                    repeat: Infinity, 
                                    repeatDelay: 5,
                                    duration: 2 
                                }
                            }}
                        >
                            {feature.icon}
                        </motion.div>
                        <h3 style={{ 
                            fontSize: "1.2rem", 
                            fontWeight: "600", 
                            marginBottom: "10px", 
                            color: colors.accent 
                        }}>
                            {feature.title}
                        </h3>
                        <p style={{ color: colors.lightText }}>{feature.description}</p>
                    </motion.div>
                ))}
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                style={{
                    background: `linear-gradient(to right, ${colors.primary}80, ${colors.primary})`,
                    padding: "30px",
                    borderRadius: "12px",
                    boxShadow: `0 4px 15px ${colors.shadow}`
                }}
            >
                <motion.h2 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    style={{ 
                        fontSize: "1.5rem", 
                        fontWeight: "bold", 
                        marginBottom: "15px", 
                        color: colors.text,
                        letterSpacing: "0.3px"
                    }}
                >
                    ¿Cómo funciona el proceso?
                </motion.h2>
                
                <motion.ul 
    initial="hidden"
    animate="visible"
    variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
    }}
    style={{ listStyleType: "none", padding: 0 }}
>
    {[
        "Describe detalladamente el problema tecnológico que estás enfrentando",
        "El sistema asigna tu caso al técnico especializado disponible",
        "Recibe actualizaciones sobre el progreso de tu solicitud",
        "Una vez resuelto, confirma y califica la atención recibida"
    ].map((step, index) => (
        <motion.li 
            key={index}
            variants={{
                hidden: { x: -50, opacity: 0 },
                visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
            }}
            whileHover={{ scale: 1.05, boxShadow: `0 4px 10px ${colors.shadow}` }}
            style={{ 
                display: "flex", 
                alignItems: "center", 
                padding: "12px 18px",
                backgroundColor: colors.cardBg, 
                borderRadius: "12px",
                marginBottom: "10px",
                cursor: "pointer",
                transition: "background 0.3s"
            }}
        >
            <motion.span 
                whileHover={{ scale: 1.2, rotate: 10 }}
                style={{ 
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "35px",
                    height: "35px",
                    backgroundColor: colors.accent,
                    color: "white",
                    borderRadius: "50%",
                    marginRight: "15px",
                    fontWeight: "bold",
                    boxShadow: `0 2px 5px ${colors.shadow}`
                }}
            >
                {index + 1}
            </motion.span>
            <span style={{ color: colors.text, fontWeight: "500" }}>{step}</span>
        </motion.li>
    ))}
</motion.ul>

            </motion.div>
        </motion.div>
    );
};

export default Inicio;