import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Check, Clock, RefreshCcw, Filter, Search,
  Calendar, User, SortDesc
} from 'lucide-react';

const AdminTicketsSelect = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // Nuevos estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState('');
  const [newStatus, setNewStatus] = useState('');

  // Paleta de colores para mantener consistencia con AdminTickets
  const colors = {
    primary: '#C4E5D8',
    secondary: '#8BBAB0',
    accent: '#5B95A0',
    background: '#F9FAFB',
    text: '#243442',
    lightText: '#546678',
    success: '#25913A',
    error: '#E01E3C',
    cardBg: '#FFFFFF',
    shadow: 'rgba(91, 149, 160, 0.12)',
  };

  const statusColors = {
    NOT_STARTED: { bg: '#FEF3C7', text: '#D97706', icon: Clock },
    IN_PROGRESS: { bg: '#DBEAFE', text: '#2563EB', icon: RefreshCcw },
    COMPLETED: { bg: '#D1FAE5', text: '#059669', icon: Check },
    CANCELLED: { bg: '#FEE2E2', text: '#DC2626', icon: AlertTriangle }
  };

  // Obtener el ID del usuario del localStorage y cargar los tickets
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      const { userTicketDTO } = JSON.parse(storedUserData);
      setCurrentUserId(userTicketDTO.id);
      fetchUserTickets(userTicketDTO.id);
    } else {
      setError('No se encontró información del usuario en la sesión');
      setLoading(false);
    }
  }, []);

  // Función para obtener los tickets del usuario
  const fetchUserTickets = async (userId) => {
    setLoading(true);
    try {
      const storedUserData = localStorage.getItem("userData");
      if (!storedUserData) {
        setError('No hay datos de autenticación');
        setLoading(false);
        return;
      }
      
      const { token } = JSON.parse(storedUserData);
      
      const response = await fetch(`http://localhost:8080/api/tickets/list-all-mytickets/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Asegurar que los datos se estén manejando correctamente
      if (Array.isArray(data)) {
        setTickets(data);
      } else if (data.success && Array.isArray(data.data)) {
        setTickets(data.data);
      } else if (data.success) {
        setTickets(data.data || []);
      } else {
        setError(data.message || 'Error al obtener los tickets');
      }
    } catch (err) {
      setError('Error al cargar los tickets: ' + err.message);
      console.error('Error completo:', err);
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha para mostrar en formato local
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-MX', { 
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Filtrado de tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      searchTerm === '' ||
      ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = 
      filterStatus === 'ALL' || 
      ticket.status === filterStatus;
      
    const matchesPriority = 
      filterPriority === 'ALL' || 
      ticket.priority === filterPriority;
      
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  // Función para abrir el modal con el ticket seleccionado
  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status); // Inicializar con el estado actual
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const closeTicketModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
    setStatusUpdateError('');
    setNewStatus('');
  };

  // Función para actualizar el estado de un ticket
  const updateTicketStatus = async () => {
    setUpdatingStatus(true);
    setStatusUpdateError('');
    
    try {
      const storedUserData = localStorage.getItem("userData");
      if (!storedUserData) {
        setStatusUpdateError('No hay datos de autenticación');
        setUpdatingStatus(false);
        return;
      }
      
      const { token, userTicketDTO } = JSON.parse(storedUserData);
      const localUserId = userTicketDTO.id;
      
      const response = await fetch(`http://localhost:8080/api/tickets/update-status/${localUserId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id: selectedTicket.id, 
          status: newStatus 
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Actualizar el ticket en la lista
      const updatedTickets = tickets.map(ticket => {
        if (ticket.id === selectedTicket.id) {
          return { ...ticket, status: newStatus };
        }
        return ticket;
      });
      
      setTickets(updatedTickets);
      setSelectedTicket({ ...selectedTicket, status: newStatus });
      
    } catch (err) {
      setStatusUpdateError('Error al actualizar el estado: ' + err.message);
      console.error('Error al actualizar estado:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Mostrar spinner durante la carga
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }
  
  // Mostrar error si ocurre alguno
  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-5 lg:p-8 max-w-7xl mx-auto"
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: colors.text }}>
            Mis Tickets
          </h1>
          <p className="text-sm" style={{ color: colors.lightText }}>
            Visualiza y administra todos tus tickets de soporte
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-accent hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2"
          onClick={() => currentUserId && fetchUserTickets(currentUserId)}
        >
          <RefreshCcw size={16} />
          <span>Actualizar</span>
        </motion.button>
      </div>

      {/* Dashboard cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl p-5 shadow-md"
          whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium" style={{ color: colors.lightText }}>Total de tickets</p>
              <h3 className="text-2xl font-semibold" style={{ color: colors.text }}>{tickets.length}</h3>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#e6f1ee' }}>
              <SortDesc size={20} style={{ color: colors.accent }} />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants} 
          className="bg-white rounded-xl p-5 shadow-md"
          whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium" style={{ color: colors.lightText }}>Tickets pendientes</p>
              <h3 className="text-2xl font-semibold" style={{ color: colors.text }}>
                {tickets.filter(t => t.status === 'NOT_STARTED' || t.status === 'IN_PROGRESS').length}
              </h3>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
              <Clock size={20} style={{ color: '#D97706' }} />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants} 
          className="bg-white rounded-xl p-5 shadow-md"
          whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium" style={{ color: colors.lightText }}>Completados</p>
              <h3 className="text-2xl font-semibold" style={{ color: colors.text }}>
                {tickets.filter(t => t.status === 'COMPLETED').length}
              </h3>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#D1FAE5' }}>
              <Check size={20} style={{ color: '#059669' }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
              style={{ focusRing: colors.primary }}
              placeholder="Buscar por título o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 md:mt-0">
            <div className="relative w-full sm:w-auto">
              <select
                className="pl-3 pr-8 py-2 rounded-lg border border-gray-200 appearance-none bg-white focus:outline-none focus:ring-2 w-full"
                style={{ focusRing: colors.primary }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">Todos los estados</option>
                <option value="NOT_STARTED">Por atender</option>
                <option value="IN_PROGRESS">En proceso</option>
                <option value="COMPLETED">Completado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <Filter size={18} className="text-gray-400" />
              </div>
            </div>
            
            <div className="relative w-full sm:w-auto">
              <select
                className="pl-3 pr-8 py-2 rounded-lg border border-gray-200 appearance-none bg-white focus:outline-none focus:ring-2 w-full"
                style={{ focusRing: colors.primary }}
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="ALL">Todas las prioridades</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <Filter size={18} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets list */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">
            No se encontraron tickets que coincidan con los criterios de búsqueda.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map(ticket => {
            const status = ticket.status || 'NOT_STARTED';
            const StatusIcon = statusColors[status]?.icon || Clock;
            
            return (
              <motion.div 
                key={ticket.id}
                variants={itemVariants}
                className="bg-white rounded-xl shadow-md overflow-hidden p-5 hover:bg-gray-50 cursor-pointer"
                whileHover={{ y: -2, boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.1)' }}
                onClick={() => openTicketModal(ticket)}
              >
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <span 
                      className="inline-block px-2 py-1 text-xs font-medium rounded-md mb-2"
                      style={{ 
                        backgroundColor: statusColors[status]?.bg, 
                        color: statusColors[status]?.text 
                      }}
                    >
                      <div className="flex items-center space-x-1">
                        <StatusIcon size={14} />
                        <span>
                          {status === 'NOT_STARTED' && 'Por atender'}
                          {status === 'IN_PROGRESS' && 'En proceso'}
                          {status === 'COMPLETED' && 'Completado'}
                          {status === 'CANCELLED' && 'Cancelado'}
                        </span>
                      </div>
                    </span>
                    <h3 className="text-lg font-medium mb-1" style={{ color: colors.text }}>
                      {ticket.title}
                    </h3>
                    <p className="text-sm mb-3" style={{ color: colors.lightText }}>
                      {ticket.description}
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                      {ticket.typeOfService}
                    </div>
                    <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                      {ticket.equipment}
                    </div>
                    <div 
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: 
                          ticket.priority === 'Alta' ? '#FEE2E2' :
                          ticket.priority === 'Media' ? '#FEF3C7' : 
                          '#D1FAE5',
                        color:
                          ticket.priority === 'Alta' ? '#DC2626' :
                          ticket.priority === 'Media' ? '#D97706' : 
                          '#059669'
                      }}
                    >
                      {ticket.priority}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-4 text-xs" style={{ color: colors.lightText }}>
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    <span>Creado el {formatDate(ticket.openingDate)}</span>
                  </div>
                  
                  {ticket.userSupportStaffId && (
                    <div className="flex items-center">
                      <User size={14} className="mr-1" />
                      <span>Técnico asignado: {ticket.userSupportStaffName || 'ID: ' + ticket.userSupportStaffId}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal para detalles del ticket */}
      <AnimatePresence>
        {isModalOpen && selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeTicketModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
                    Detalles del Ticket
                  </h2>
                  <button
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={closeTicketModal}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Estado, título y descripción */}
                  <div>
                    <span 
                      className="inline-block px-2 py-1 text-xs font-medium rounded-md mb-2"
                      style={{ 
                        backgroundColor: statusColors[selectedTicket.status]?.bg, 
                        color: statusColors[selectedTicket.status]?.text 
                      }}
                    >
                      <div className="flex items-center space-x-1">
                        {React.createElement(statusColors[selectedTicket.status]?.icon || Clock, { size: 14 })}
                        <span>
                          {selectedTicket.status === 'NOT_STARTED' && 'Por atender'}
                          {selectedTicket.status === 'IN_PROGRESS' && 'En proceso'}
                          {selectedTicket.status === 'COMPLETED' && 'Completado'}
                          {selectedTicket.status === 'CANCELLED' && 'Cancelado'}
                        </span>
                      </div>
                    </span>
                    <h3 className="text-lg font-medium mb-2" style={{ color: colors.text }}>
                      {selectedTicket.title}
                    </h3>
                    <p className="text-sm mb-4" style={{ color: colors.lightText }}>
                      {selectedTicket.description}
                    </p>
                  </div>
                  
                  {/* Detalles del ticket */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium" style={{ color: colors.text }}>Tipo de servicio</p>
                      <p style={{ color: colors.lightText }}>{selectedTicket.typeOfService}</p>
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: colors.text }}>Equipo</p>
                      <p style={{ color: colors.lightText }}>{selectedTicket.equipment}</p>
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: colors.text }}>Prioridad</p>
                      <p style={{ color: colors.lightText }}>{selectedTicket.priority}</p>
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: colors.text }}>Fecha de apertura</p>
                      <p style={{ color: colors.lightText }}>{formatDate(selectedTicket.openingDate)}</p>
                    </div>
                    {selectedTicket.userSupportStaffId && (
                      <div className="col-span-2">
                        <p className="font-medium" style={{ color: colors.text }}>Técnico asignado</p>
                        <p style={{ color: colors.lightText }}>
                          {selectedTicket.userSupportStaffName || 'ID: ' + selectedTicket.userSupportStaffId}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Cambiar estado */}
                  <div className="border-t pt-4 mt-4">
                    <label className="block mb-2 font-medium text-sm" style={{ color: colors.text }}>
                      Actualizar estado del ticket
                    </label>
                    <div className="flex flex-col gap-3">
                      <select
                        className="pl-3 pr-8 py-2 rounded-lg border border-gray-200 appearance-none bg-white focus:outline-none focus:ring-2"
                        style={{ focusRing: colors.primary }}
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        disabled={updatingStatus}
                      >
                        <option value="NOT_STARTED">Por atender</option>
                        <option value="IN_PROGRESS">En proceso</option>
                        <option value="COMPLETED">Completado</option>
                      </select>
                      
                      <button 
                        className="px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2"
                        style={{ 
                          backgroundColor: colors.accent,
                          opacity: updatingStatus ? 0.7 : 1
                        }}
                        onClick={updateTicketStatus}
                        disabled={updatingStatus}
                      >
                        {updatingStatus ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                            Actualizando...
                          </div>
                        ) : (
                          "Actualizar estado"
                        )}
                      </button>
                      
                      {statusUpdateError && (
                        <p className="mt-2 text-sm text-red-600">{statusUpdateError}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminTicketsSelect;