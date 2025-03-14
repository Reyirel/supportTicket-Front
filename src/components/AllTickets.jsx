import React, { useState, useEffect, useRef } from "react";
import io from 'socket.io-client';
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
    
    const REFRESH_INTERVAL = 30000; 
    const intervalRef = useRef(null);
    const socketRef = useRef(null);

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
        fetchTickets();
        
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData && userData.token) {
            socketRef.current = io('http://localhost:8080', {
                auth: {
                    token: userData.token
                }
            });
            
            socketRef.current.on('ticket-updated', (updatedTicket) => {
                setTickets(prevTickets => 
                    prevTickets.map(ticket => 
                        ticket.id === updatedTicket.id ? updatedTicket : ticket
                    )
                );
            });
        }
        
        intervalRef.current = setInterval(() => {
            fetchTickets();
        }, REFRESH_INTERVAL);
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
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

    // Reemplazamos ProgressBar por el componente TicketSteps con animaciones
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

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto shadow-xl" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center border-b p-4 bg-gray-50">
                        <h2 className="text-xl font-semibold">{selectedTicket.title || 'Detalle del Ticket'}</h2>
                        <button className="text-3xl leading-none hover:text-gray-700" onClick={handleCloseModal}>&times;</button>
                    </div>
                    <div className="p-6">
                        <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                            <p className="mb-2"><span className="font-bold">Descripción:</span> {selectedTicket.description}</p>
                            <p className="mb-2"><span className="font-bold">Estado:</span> 
                                <span className={`ml-2 px-2 py-1 rounded-full ${getStatusStyles(selectedTicket.status)}`}>
                                    {translateStatus(selectedTicket.status)}
                                </span>
                            </p>
                            <p className="mb-2"><span className="font-bold">Fecha:</span> {selectedTicket.createdAt && new Date(selectedTicket.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3">Progreso de la tarea</h3>
                            <TicketSteps status={selectedTicket.status} />
                        </div>
                    </div>
                </div>
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
                            className="bg-white border rounded-lg shadow-sm p-5 cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 duration-300"
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
                                        {ticket.createdAt && new Date(ticket.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="text-sm text-blue-600 hover:underline">Ver detalles →</span>
                                </div>
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