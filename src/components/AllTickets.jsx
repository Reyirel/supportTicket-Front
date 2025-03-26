import React, { useState, useEffect } from "react";
import { Steps } from 'primereact/steps';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primeicons/primeicons.css';
import { motion, AnimatePresence } from "framer-motion";

const AllTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [highlightedTicketId, setHighlightedTicketId] = useState(null);
    
    const isTokenValid = () => {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            if (!userData || !userData.token) {
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error al verificar el token:", error);
            return false;
        }
    };

    const fetchTickets = async () => {
        try {
            setRefreshing(true);
            
            const userData = JSON.parse(localStorage.getItem('userData'));
            if (!userData || !userData.token) {
                throw new Error("No se encontró información de usuario");
            }

            const userId = userData.userTicketDTO?.id;
            if (!userId) {
                throw new Error("No se encontró el ID del usuario");
            }

            const response = await fetch(`http://localhost:8080/api/tickets/get-all/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userData.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                localStorage.removeItem('userData'); 
                window.location.href = '/login'; 
                throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
            }

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setTickets(data);
            
            if (selectedTicket) {
                const updatedSelectedTicket = data.find(t => t.id === selectedTicket.id);
                if (updatedSelectedTicket) {
                    setSelectedTicket(updatedSelectedTicket);
                }
            }

            return true;
        } catch (error) {
            console.error("Error al obtener tickets:", error);
            setError(error.message);
            return false;
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // Carga inicial de tickets
        fetchTickets();
        
        // Configurar polling con actualización selectiva
        const pollingInterval = setInterval(async () => {
            if (isTokenValid()) {
                try {
                    const userData = JSON.parse(localStorage.getItem('userData'));
                    const userId = userData.userTicketDTO?.id;
                    
                    const response = await fetch(`http://localhost:8080/api/tickets/get-all/${userId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${userData.token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (!response.ok) throw new Error(`Error: ${response.status}`);
                    
                    const newTickets = await response.json();
                    
                    // Comparar con el estado actual y solo actualizar los que cambiaron
                    setTickets(prevTickets => {
                        // Crear un mapa de los tickets actuales para fácil comparación
                        const prevTicketsMap = prevTickets.reduce((map, ticket) => {
                            map[ticket.id] = ticket;
                            return map;
                        }, {});
                        
                        // Lista para almacenar los tickets actualizados
                        let updatedTickets = [...prevTickets];
                        let hasChanges = false;
                        
                        // Actualizar los tickets que cambiaron
                        newTickets.forEach(newTicket => {
                            const prevTicket = prevTicketsMap[newTicket.id];
                            
                            if (!prevTicket) {
                                // Es un nuevo ticket
                                updatedTickets.push(newTicket);
                                hasChanges = true;
                                console.log("Nuevo ticket detectado:", newTicket.id);
                            } 
                            // Comparar fechas de actualización o alguna otra propiedad
                            else if (newTicket.lastUpdated !== prevTicket.lastUpdated || 
                                    newTicket.status !== prevTicket.status) {
                                // Reemplazar el ticket en la lista
                                updatedTickets = updatedTickets.map(t => 
                                    t.id === newTicket.id ? newTicket : t
                                );
                                hasChanges = true;
                                console.log("Ticket actualizado:", newTicket.id);
                            }
                        });
                        
                        // Si hay cambios, actualizar el estado
                        return hasChanges ? updatedTickets : prevTickets;
                    });
                    
                } catch (error) {
                    console.error("Error en polling:", error);
                }
            } else {
                clearInterval(pollingInterval);
            }
        }, 10000); // cada 10 segundos
        
        return () => clearInterval(pollingInterval);
    }, []);

    useEffect(() => {
        if (selectedTicket) {
            const updatedTicket = tickets.find(t => t.id === selectedTicket.id);
            if (updatedTicket) {
                setSelectedTicket(updatedTicket);
            }
        }
    }, [tickets]);

    const handleOpenModal = (ticket) => {
        setSelectedTicket(ticket);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedTicket(null);
    };

    const handleManualRefresh = () => {
        fetchTickets();
    };

    const updateSingleTicket = async (ticketId) => {
   
        setHighlightedTicketId(ticketId);
        setTimeout(() => setHighlightedTicketId(null), 2000); 
    };

    const TicketSteps = ({ status }) => {
        const items = [
            { 
                label: 'No iniciado', 
                icon: 'pi pi-clock',
                description: 'Ticket registrado'
            },
            { 
                label: 'En progreso', 
                icon: 'pi pi-spin pi-spinner',
                description: 'En atención' 
            },
            { 
                label: 'Completado', 
                icon: 'pi pi-check',
                description: 'Tarea finalizada' 
            }
        ];

        const getActiveIndex = () => {
            const statusLower = status?.toLowerCase() || '';
            switch(statusLower) {
                case 'not_started':
                case 'not started':
                    return 0;
                case 'in_progress':
                case 'in progress':
                    return 1;
                case 'completed':
                    return 2;
                default:
                    return 0;
            }
        };

        const activeIndex = getActiveIndex();
        
        const getProgressColor = () => {
            switch(activeIndex) {
                case 0:
                    return 'from-yellow-300 to-yellow-500';
                case 1: 
                    return 'from-blue-300 to-blue-600';
                case 2:
                    return 'from-green-300 to-green-600';
                default:
                    return 'from-gray-300 to-gray-500';
            }
        };

        return (
            <motion.div 
                className="w-full mt-4 relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="relative pt-6 pb-3">
                    <div className="h-1.5 bg-gray-200 absolute top-7 left-0 w-full rounded-full z-0" />
                    
                    <motion.div 
                        className={`h-1.5 bg-gradient-to-r ${getProgressColor()} absolute top-7 left-0 z-[1] rounded-full`}
                        initial={{ width: '0%' }}
                        animate={{ 
                            width: `${activeIndex === 0 ? '5%' : activeIndex === 1 ? '50%' : '100%'}`
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />

                    <div className="flex justify-between relative z-[2]">
                        {items.map((item, index) => {
                            const isActive = index <= activeIndex;
                            const isCompleted = index < activeIndex;
                            
                            return (
                                <motion.div 
                                    key={index}
                                    className="flex flex-col items-center"
                                    initial={{ scale: 0.8 }}
                                    animate={{ 
                                        scale: isActive ? 1 : 0.9,
                                        opacity: isActive ? 1 : 0.7
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <motion.div 
                                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md
                                            ${isCompleted 
                                                ? 'bg-green-500 text-white' 
                                                : isActive 
                                                    ? index === 0 ? 'bg-yellow-500 text-white' : index === 1 ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                                                    : 'bg-white border-2 border-gray-300 text-gray-400'
                                            }`}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {isCompleted ? (
                                            <i className="pi pi-check text-sm"></i>
                                        ) : (
                                            <i className={`${item.icon} text-sm`}></i>
                                        )}
                                    </motion.div>
                                    
                                    <span className={`text-xs font-medium mt-2 ${isActive ? 'text-gray-800' : 'text-gray-500'}`}>
                                        {item.label}
                                    </span>
                                    
                                    <span className="text-[10px] text-gray-500 mt-1">
                                        {item.description}
                                    </span>
                                    
                                    {index === 2 && isActive && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ 
                                                scale: [0, 1.2, 1], 
                                                opacity: [0, 1, 1],
                                                rotate: [0, 10, -10, 0]
                                            }}
                                            transition={{ 
                                                delay: 0.5,
                                                duration: 0.8, 
                                                times: [0, 0.6, 1] 
                                            }}
                                            className="absolute -top-1 -right-1"
                                        >
                                            <span className="text-lg"></span>
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        );
    };

    const getStatusStyles = (status) => {
        const statusLower = status?.toLowerCase() || '';
        switch(statusLower) {
            case 'not_started':
            case 'not started':
                return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'in_progress':
            case 'in progress':
                return 'bg-blue-100 text-blue-800 border border-blue-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    const translateStatus = (status) => {
        if (!status) return '';
        const statusLower = status.toLowerCase();
        switch(statusLower) {
            case 'not_started':
            case 'not started':
                return 'No iniciado';
            case 'in_progress':
            case 'in progress':
                return 'En progreso';
            case 'completed':
                return 'Completado';
            default:
                return status;
        }
    };

    const TicketModal = () => {
        if (!selectedTicket || !modalOpen) return null;

        // Cierra el modal cuando se presiona Escape
        useEffect(() => {
            const handleEscKey = (e) => {
                if (e.key === 'Escape') handleCloseModal();
            };
            window.addEventListener('keydown', handleEscKey);
            return () => window.removeEventListener('keydown', handleEscKey);
        }, []);

        return (
            <AnimatePresence>
                {modalOpen && (
                    <motion.div 
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCloseModal}
                    >
                        <motion.div 
                            className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto shadow-xl"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Encabezado */}
                            <div className="relative border-b">
                                <div className={`absolute top-0 left-0 h-1.5 w-full ${
                                    selectedTicket.status?.toLowerCase().includes('completed') ? 'bg-green-500' :
                                    selectedTicket.status?.toLowerCase().includes('progress') ? 'bg-blue-500' :
                                    'bg-yellow-500'
                                }`}></div>
                                <div className="flex justify-between items-center p-4 pt-6">
                                    <h2 className="text-xl font-semibold">{selectedTicket.title || 'Detalle del Ticket'}</h2>
                                    <button 
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" 
                                        onClick={handleCloseModal}
                                        aria-label="Cerrar modal"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Contenido */}
                            <div className="p-6">
                                {/* Estado y fecha */}
                                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                                    <div className="flex items-center mb-3 md:mb-0">
                                        <span className="font-medium text-gray-700 mr-2">Estado:</span>
                                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusStyles(selectedTicket.status)}`}>
                                            {translateStatus(selectedTicket.status)}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                        <span className="text-gray-600">
                                            {selectedTicket.openingDate ? new Date(selectedTicket.openingDate).toLocaleString() : 'Fecha no disponible'}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Descripción */}
                                <motion.div 
                                    className="mb-6 bg-gray-50 p-5 rounded-lg border border-gray-100 shadow-sm"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h3 className="font-medium text-gray-800 mb-3">Descripción</h3>
                                    <p className="text-gray-700 whitespace-pre-line">{selectedTicket.description || 'Sin descripción'}</p>
                                </motion.div>
                                
                                {/* Progreso de la tarea */}
                                <motion.div 
                                    className="mt-6"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <h3 className="text-lg font-semibold mb-4">Progreso de la tarea</h3>
                                    <TicketSteps status={selectedTicket.status} />
                                </motion.div>
                                
                                {/* Acciones */}
                                <motion.div 
                                    className="mt-8 pt-4 border-t flex justify-end gap-3"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <button 
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={handleCloseModal}
                                    >
                                        Cerrar
                                    </button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };

    // Nuevo componente para mostrar el personal de soporte (añadir dentro del componente principal)
    const SupportStaffInfo = ({ staffName }) => {
        if (!staffName || staffName === "null") return null;
        
        return (
            <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span>Atendido por: <span className="font-medium">{staffName}</span></span>
            </div>
        );
    };

    if (loading) return (
        <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="p-6 text-center text-red-600">
            <p>Error: {error}</p>
            <button 
                onClick={handleManualRefresh}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
                Intentar nuevamente
            </button>
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold text-gray-800">Mis Tickets</h1>
                <div className="flex items-center">
                    {refreshing && (
                        <span className="mr-3 text-sm text-gray-500 flex items-center">
                            <div className="w-4 h-4 mr-2 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                            Actualizando...
                        </span>
                    )}
                    <button 
                        onClick={handleManualRefresh} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors shadow-sm"
                        disabled={refreshing}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Actualizar
                    </button>
                </div>
            </div>
            
            {tickets.length === 0 ? (
                <div className="bg-white p-10 text-center rounded-lg shadow-sm">
                    <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p className="text-center text-gray-500 mt-4">No tienes tickets asignados actualmente.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tickets.map((ticket) => (
                        <div 
                            key={ticket.id} 
                            onClick={() => handleOpenModal(ticket)}
                            className={`bg-white border rounded-lg shadow-sm p-5 cursor-pointer transition-all 
                                ${highlightedTicketId === ticket.id 
                                    ? 'animate-pulse border-blue-500 shadow-blue-100' 
                                    : 'hover:shadow-md hover:-translate-y-1'} 
                                duration-300`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-800 flex-1">{ticket.title}</h3>
                                <span className={`text-xs px-3 py-1 rounded-full ml-2 ${getStatusStyles(ticket.status)}`}>
                                    {translateStatus(ticket.status)}
                                </span>
                            </div>
                            <p className="text-gray-600 mb-4 line-clamp-2">{ticket.description}</p>
                            
                            <div className="mt-4 pt-3 border-t">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm text-gray-500 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                        {ticket.openingDate && new Date(ticket.openingDate).toLocaleDateString()}
                                    </span>
                                    <span className="text-sm text-blue-600 hover:underline">Ver detalles →</span>
                                </div>
                                
                                {/* Añadir el personal de soporte antes del TicketSteps */}
                                {ticket.userSupportStaffName && ticket.userSupportStaffName !== "null" && (
                                    <div className="mb-3">
                                        <SupportStaffInfo staffName={ticket.userSupportStaffName} />
                                    </div>
                                )}
                                
                                <TicketSteps status={ticket.status} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <TicketModal />
        </div>
    );
};

export default AllTickets;