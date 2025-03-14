import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLaptop, FaPrint, FaWifi, FaQuestionCircle, FaCheck, FaTimes, FaInfoCircle } from "react-icons/fa";
import { MdKeyboardArrowRight } from "react-icons/md";

// Nueva paleta de colores
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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { 
            duration: 0.5, 
            when: "beforeChildren",
            staggerChildren: 0.1
        },
    },
    exit: { opacity: 0, transition: { duration: 0.3 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const Reportes = () => {
    const [formData, setFormData] = useState({
        titulo: "",
        descripcion: "",
        tipo: "",
        equipo: "institucional"
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [userId, setUserId] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [error, setError] = useState(null);
    
    // Obtener el ID del usuario y el token desde localStorage
    useEffect(() => {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (userData && userData.userTicketDTO && userData.userTicketDTO.id) {
                setUserId(userData.userTicketDTO.id);
            }
            // Obtener el token de autenticación
            if (userData && userData.token) {
                setAuthToken(userData.token);
            }
        } catch (error) {
            console.error("Error al obtener datos de usuario:", error);
        }
    }, []);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Determinar la prioridad según tipo y equipo
    const determinarPrioridad = (tipo, equipo) => {
        if (equipo === "personal") return "Baja";
        
        switch (tipo) {
            case "impresora": return "Baja";
            case "computadora": return "Media";
            case "internet": return "Alta";
            default: return "Media"; // Para "otros" casos
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        if (!userId) {
            setError("No se pudo obtener el ID de usuario. Por favor, inicie sesión nuevamente.");
            setIsSubmitting(false);
            return;
        }
        
        // Mapear los tipos del formulario a los valores esperados por la API
        const mapTipoToTypeOfService = {
            "impresora": "Impresora",
            "computadora": "Computadora",
            "internet": "Internet",
            "otros": "Otro"
        };
        
        // Determinar la prioridad según las reglas establecidas
        const prioridad = determinarPrioridad(formData.tipo, formData.equipo);
        
        // Crear el payload para la API
        const payload = {
            title: formData.titulo,
            description: formData.descripcion,
            typeOfService: mapTipoToTypeOfService[formData.tipo] || formData.tipo,
            equipment: formData.equipo.charAt(0).toUpperCase() + formData.equipo.slice(1), 
            priority: prioridad
        };
        
        try {
            const response = await fetch(`http://localhost:8080/api/tickets/create/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                // Manejar respuestas de error
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
                } else {
                    const errorText = await response.text();
                    throw new Error(errorText || `Error ${response.status}: ${response.statusText}`);
                }
            }
            
            // Manejar respuesta exitosa
            const contentType = response.headers.get("content-type");
            let data;
            
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                // Si la respuesta es texto plano
                const successText = await response.text();
                data = { message: successText };
            }
            
            console.log("Respuesta del servidor:", data);
            
            setShowSuccess(true);
            
            // Reset después de 3 segundos
            setTimeout(() => {
                setShowSuccess(false);
                handleReset();
            }, 3000);
            
        } catch (error) {
            console.error("Error al enviar el reporte:", error);
            setError(`Error al enviar el reporte: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData({
            titulo: "",
            descripcion: "",
            tipo: "",
            equipo: "institucional"
        });
        setCurrentStep(1);
    };

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);
    
    const isFormValid = () => {
        if (currentStep === 1) {
            return formData.titulo.trim() !== "" && formData.tipo !== "";
        }
        return formData.descripcion.trim() !== "";
    };

    const renderStep = () => {
        switch(currentStep) {
            case 1:
                return (
                    <motion.div 
                        key="step1"
                        variants={itemVariants}
                        className=""
                    >
                        <div style={{ backgroundColor: colors.primary, borderLeftColor: colors.accent }} 
                             className="p-4 rounded-lg border-l-4 mb-6">
                            <p style={{ color: colors.text }} className="font-medium">
                                Proporcione la información básica sobre el problema que está experimentando.
                            </p>
                        </div>
                        
                        <div>
                            <label htmlFor="titulo" style={{ color: colors.text }} className="block text-lg font-medium mb-2">
                                Título del Reporte <span style={{ color: colors.error }}>*</span>
                            </label>
                            <motion.input
                                whileFocus={{ scale: 1.01, borderColor: colors.accent }}
                                type="text"
                                id="titulo"
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleChange}
                                placeholder="Ej: No funciona la impresora del cabildo"
                                style={{ backgroundColor: colors.inputBg, color: colors.text }}
                                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                                required
                            />
                            {formData.titulo.length > 0 && formData.titulo.length < 5 && (
                                <p style={{ color: colors.error }} className="text-sm mt-1">El título debe tener al menos 5 caracteres</p>
                            )}
                        </div>
                        
                        <div>
                            <label htmlFor="tipo" style={{ color: colors.text }} className="block text-lg font-medium mb-2">
                                Tipo de Problema <span style={{ color: colors.error }}>*</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                {[
                                    { id: "impresora", icon: <FaPrint className="mr-2" />, label: "Impresora" },
                                    { id: "computadora", icon: <FaLaptop className="mr-2" />, label: "Computadora" },
                                    { id: "internet", icon: <FaWifi className="mr-2" />, label: "Internet" },
                                    { id: "otros", icon: <FaQuestionCircle className="mr-2" />, label: "Otros" }
                                ].map(option => (
                                    <motion.div
                                        key={option.id}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{ 
                                            backgroundColor: formData.tipo === option.id ? colors.primary : colors.cardBg,
                                            borderColor: formData.tipo === option.id ? colors.accent : '#e5e7eb',
                                            color: formData.tipo === option.id ? colors.text : colors.lightText
                                        }}
                                        className="flex items-center p-4 border rounded-lg cursor-pointer transition-all"
                                        onClick={() => setFormData(prev => ({ ...prev, tipo: option.id }))}
                                    >
                                        {option.icon}
                                        <span>{option.label}</span>
                                        {formData.tipo === option.id && (
                                            <FaCheck style={{ color: colors.accent }} className="ml-auto" />
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                            
                            {/* Mensajes informativos según el tipo seleccionado */}
                            {formData.tipo === "impresora" && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center p-3 rounded-lg mb-4 mt-2"
                                    style={{ backgroundColor: `${colors.accent}20` }}
                                >
                                    <FaInfoCircle className="mr-2" style={{ color: colors.accent }} />
                                    <p style={{ color: colors.text }} className="text-sm">
                                        El tiempo de respuesta para problemas con impresoras (conexión a la computadora o problemas básicos) es de 1-2 días hábiles.
                                    </p>
                                </motion.div>
                            )}
                            
                            {formData.tipo === "otros" && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center p-3 rounded-lg mb-4 mt-2"
                                    style={{ backgroundColor: `${colors.secondary}20` }}
                                >
                                    <FaInfoCircle className="mr-2" style={{ color: colors.secondary }} />
                                    <p style={{ color: colors.text }} className="text-sm">
                                        Se analizará tu caso para determinar su complejidad y asignar la prioridad adecuada.
                                    </p>
                                </motion.div>
                            )}
                        </div>
                        
                        <div>
                            <p style={{ color: colors.text }} className="block text-lg font-medium mb-2">Tipo de Equipo</p>
                            <div className="flex flex-wrap gap-4">
                                {["institucional", "personal"].map(tipo => (
                                    <label 
                                        key={tipo} 
                                        style={{ 
                                            backgroundColor: formData.equipo === tipo ? colors.primary : colors.inputBg,
                                            borderColor: formData.equipo === tipo ? colors.accent : '#e5e7eb',
                                            color: formData.equipo === tipo ? colors.text : colors.lightText
                                        }}
                                        className="inline-flex items-center px-4 py-2 rounded-full cursor-pointer border-2"
                                    >
                                        <input
                                            type="radio"
                                            name="equipo"
                                            value={tipo}
                                            checked={formData.equipo === tipo}
                                            onChange={handleChange}
                                            className="form-radio h-4 w-4 hidden"
                                        />
                                        <span className="capitalize">{tipo}</span>
                                    </label>
                                ))}
                            </div>
                            
                            {/* Mostrar la prioridad determinada automáticamente */}
                            {formData.tipo && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-4 p-3 rounded-lg"
                                    style={{ backgroundColor: `${colors.inputBg}` }}
                                >
                                    <p style={{ color: colors.text }} className="text-sm">
                                        <span className="font-medium">Prioridad asignada: </span>
                                        <span className={`font-semibold ${
                                            determinarPrioridad(formData.tipo, formData.equipo) === "Alta" 
                                                ? "text-red-600" 
                                                : determinarPrioridad(formData.tipo, formData.equipo) === "Media"
                                                    ? "text-amber-600"
                                                    : "text-blue-600"
                                        }`}>
                                            {determinarPrioridad(formData.tipo, formData.equipo)}
                                        </span>
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                );
                
            case 2:
                return (
                    <motion.div
                        key="step2"
                        variants={itemVariants}
                        className=""
                    >
                        <div style={{ backgroundColor: colors.primary, borderLeftColor: colors.accent }} 
                             className="p-4 rounded-lg border-l-4 mb-6">
                            <p style={{ color: colors.text }} className="font-medium">
                                Describa el problema en detalle para que podamos entenderlo mejor.
                            </p>
                        </div>
                        
                        <div>
                            <label htmlFor="descripcion" style={{ color: colors.text }} className="block text-lg font-medium mb-2">
                                Descripción del Problema <span style={{ color: colors.error }}>*</span>
                            </label>
                            <div className="relative">
                                <motion.textarea
                                    whileFocus={{ scale: 1.01, borderColor: colors.accent }}
                                    id="descripcion"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    placeholder="Describa el problema con el mayor detalle posible: ¿Qué ocurrió? ¿Cuándo comenzó? ¿Ha intentado alguna solución?"
                                    rows="6"
                                    style={{ backgroundColor: colors.inputBg, color: colors.text }}
                                    className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                                    required
                                ></motion.textarea>
                                <div style={{ color: colors.lightText }} className="absolute bottom-2 right-2 text-sm">
                                    {formData.descripcion.length}/500
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
                
            default:
                return null;
        }
    };

    // Mostrar mensaje de error si existe
    const renderErrorMessage = () => {
        if (!error) return null;
        
        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ backgroundColor: `${colors.error}20`, borderLeftColor: colors.error }}
                className="p-4 rounded-lg border-l-4 mb-6"
            >
                <p style={{ color: colors.error }} className="font-medium">
                    {error}
                </p>
            </motion.div>
        );
    };

    if (showSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ backgroundColor: colors.cardBg, borderColor: colors.success, boxShadow: `0 4px 6px ${colors.shadow}` }}
                className="max-w-2xl mx-auto p-6 mt-10 rounded-2xl shadow-2xl border"
            >
                <div className="text-center">
                    <div style={{ backgroundColor: `${colors.primary}` }} 
                         className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6">
                        <FaCheck style={{ color: colors.success }} className="h-8 w-8" />
                    </div>
                    <h2 style={{ color: colors.text }} className="text-2xl font-bold mb-2">¡Reporte enviado con éxito!</h2>
                    <p style={{ color: colors.lightText }} className="mb-6">
                        Su reporte ha sido registrado y será atendido a la brevedad posible.
                    </p>
                    <p style={{ color: colors.lightText }} className="text-sm">
                        Redirigiendo automáticamente...
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="max-w-7xl mx-auto p-6 mt-10"
        >
            <div style={{ backgroundColor: colors.cardBg, boxShadow: `0 4px 6px ${colors.shadow}` }} 
                 className="rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Cabecera */}
                <div style={{ background: `linear-gradient(to right, ${colors.secondary}, ${colors.accent})` }} 
                     className="p-6 text-white">
                    <h1 className="text-3xl font-extrabold mb-2 text-center">
                        Formulario de Reportes
                    </h1>
                    <p style={{ color: colors.primary }} className="text-center">
                        Complete el formulario para reportar un problema técnico
                    </p>
                </div>
                
                {/* Indicador de progreso */}
                <div className="px-6 pt-6">
                    <div className="flex items-center mb-4">
                        {[1, 2].map((step) => (
                            <React.Fragment key={step}>
                                <div 
                                    onClick={() => step < currentStep && setCurrentStep(step)}
                                    style={{ 
                                        backgroundColor: currentStep >= step ? colors.accent : colors.inputBg,
                                        color: currentStep >= step ? colors.cardBg : colors.lightText
                                    }}
                                    className={`
                                        flex items-center justify-center w-10 h-10 rounded-full 
                                        ${step < currentStep ? "cursor-pointer" : ""}
                                    `}
                                >
                                    {step}
                                </div>
                                {step < 2 && (
                                    <div style={{ backgroundColor: currentStep > step ? colors.accent : colors.inputBg }} 
                                         className="flex-1 h-1 mx-2"></div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                    <p style={{ color: colors.text }} className="font-medium mb-6">
                        {currentStep === 1 ? "Información básica" : "Detalles del problema"}
                    </p>
                </div>
                
                {/* Contenido del formulario */}
                <form onSubmit={handleSubmit} className="px-6 pb-6">
                    {renderErrorMessage()}
                    <AnimatePresence mode="wait">
                        {renderStep()}
                    </AnimatePresence>
                    
                    {/* Botones de navegación */}
                    <motion.div 
                        variants={itemVariants}
                        className="flex justify-between mt-8 pt-6 border-t border-gray-200"
                    >
                        {currentStep > 1 ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={prevStep}
                                style={{ backgroundColor: colors.secondary, color: colors.cardBg }}
                                className="px-6 py-3 rounded-lg shadow-md transition-all flex items-center"
                            >
                                <MdKeyboardArrowRight className="rotate-180 mr-1" /> Anterior
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={handleReset}
                                style={{ backgroundColor: colors.secondary, color: colors.cardBg }}
                                className="px-6 py-3 rounded-lg shadow-md transition-all flex items-center"
                            >
                                <FaTimes className="mr-2" /> Cancelar
                            </motion.button>
                        )}
                        
                        {currentStep < 2 ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={nextStep}
                                disabled={!isFormValid()}
                                style={{ 
                                    backgroundColor: isFormValid() ? colors.accent : colors.secondary,
                                    opacity: isFormValid() ? 1 : 0.6,
                                    color: colors.cardBg
                                }}
                                className="px-6 py-3 rounded-lg shadow-md transition-all flex items-center"
                            >
                                Siguiente <MdKeyboardArrowRight className="ml-1" />
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={isSubmitting || !isFormValid()}
                                style={{ 
                                    backgroundColor: isFormValid() && !isSubmitting ? colors.accent : colors.secondary,
                                    opacity: isFormValid() && !isSubmitting ? 1 : 0.6,
                                    color: colors.cardBg 
                                }}
                                className="px-6 py-3 rounded-lg shadow-md transition-all flex items-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Enviando...
                                    </>
                                ) : (
                                    <>Enviar Reporte</>
                                )}
                            </motion.button>
                        )}
                    </motion.div>
                </form>
            </div>
        </motion.div>
    );
};

export default Reportes;
