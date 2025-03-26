import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllTickets } from '../services/ticketService';
import { 
  AlertTriangle, Check, Clock, RefreshCcw, Filter, Search,
  SortDesc, Phone, Calendar, User, Building
} from 'lucide-react';

const AdminTickets = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedUsers, setExpandedUsers] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  // Estados para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalSuccess, setModalSuccess] = useState(false);
  // Agregar un nuevo estado para el usuario actual
  const [currentUserId, setCurrentUserId] = useState(null);
  
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
  
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await getAllTickets();
      if (response.success) {
        setUsers(response.data);
        const initialExpandState = {};
        response.data.forEach(user => {
          initialExpandState[user.userId] = true;
        });
        setExpandedUsers(initialExpandState);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Error al cargar los tickets: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    
    // Obtener el ID del usuario actual desde localStorage
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      const { userTicketDTO } = JSON.parse(storedUserData);
      setCurrentUserId(userTicketDTO.id);
    }
  }, []);
  
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
  
  const toggleUserExpand = (userId) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Función para tomar el ticket mediante PATCH y mostrar modal según resultado
  const handleTakeTicket = async (ticketId) => {
    const storedUserData = localStorage.getItem("userData");
    if (!storedUserData) return;
    const { token, userTicketDTO } = JSON.parse(storedUserData);
    const localUserId = userTicketDTO.id;
    try {
      const response = await fetch(`http://localhost:8080/api/tickets/update-status/${localUserId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: ticketId, status: "IN_PROGRESS" })
      });

      let data = {};
      try {
          data = await response.json();
      } catch (error) {
          data = {};
      }

      if (response.ok) {
        setModalMessage("Ticket asignado correctamente.");
        setModalSuccess(true);
        // Se vuelve a obtener la lista actualizada
        await fetchTickets();
      } else {
        console.error("Error al tomar el ticket:", data.message || "Detalle no recibido");
        setModalMessage("Error al asignar el ticket: " + (data.message || "Detalle no recibido"));
        setModalSuccess(false);
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      setModalMessage("Error en la petición: " + error.message);
      setModalSuccess(false);
    }
    setModalVisible(true);
  };

  // Función para marcar un ticket como completado
  const handleCompleteTicket = async (ticketId, assignedUserId) => {
    const storedUserData = localStorage.getItem("userData");
    if (!storedUserData) return;
    const { token, userTicketDTO } = JSON.parse(storedUserData);
    const localUserId = userTicketDTO.id;
    
    // Verificar que el usuario asignado sea el usuario actual
    if (assignedUserId !== localUserId) {
      setModalMessage("No puedes completar este ticket porque fue asignado a otro usuario.");
      setModalSuccess(false);
      setModalVisible(true);
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8080/api/tickets/update-status/${localUserId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: ticketId, status: "COMPLETED" })
      });

      let data = {};
      try {
          data = await response.json();
      } catch (error) {
          data = {};
      }

      if (response.ok) {
        setModalMessage("Ticket marcado como completado correctamente.");
        setModalSuccess(true);
        await fetchTickets();
      } else {
        setModalMessage("Error al completar el ticket: " + (data.message || "Detalle no recibido"));
        setModalSuccess(false);
      }
    } catch (error) {
      setModalMessage("Error en la petición: " + error.message);
      setModalSuccess(false);
    }
    setModalVisible(true);
  };
  
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
  
  const filteredUsers = users.filter(user => {
    const filteredTickets = user.ticketList.filter(ticket => {
      const matchesSearch = 
        searchTerm === '' ||
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userName.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = 
        filterStatus === 'ALL' || 
        ticket.status === filterStatus;
        
      const matchesPriority = 
        filterPriority === 'ALL' || 
        ticket.priority === filterPriority;
        
      return matchesSearch && matchesStatus && matchesPriority;
    });
    
    return filteredTickets.length > 0;
  }).map(user => ({
    ...user,
    ticketList: user.ticketList.filter(ticket => {
      const matchesSearch = 
        searchTerm === '' ||
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userName.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = 
        filterStatus === 'ALL' || 
        ticket.status === filterStatus;
        
      const matchesPriority = 
        filterPriority === 'ALL' || 
        ticket.priority === filterPriority;
        
      return matchesSearch && matchesStatus && matchesPriority;
    })
  }));
  
  const totalTickets = filteredUsers.reduce(
    (sum, user) => sum + user.ticketList.length, 0
  );
  
  const pendingTickets = filteredUsers.reduce(
    (sum, user) => sum + user.ticketList.filter(t => t.status === 'NOT_STARTED').length, 0
  );
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }
  
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
    <>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="p-5 lg:p-8 max-w-7xl mx-auto"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-semibold" style={{ color: colors.text }}>
            Panel de Tickets
          </h1>
          <p className="text-sm" style={{ color: colors.lightText }}>
            Administra y da seguimiento a todos los tickets de soporte
          </p>
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
                <h3 className="text-2xl font-semibold" style={{ color: colors.text }}>{totalTickets}</h3>
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
                <h3 className="text-2xl font-semibold" style={{ color: colors.text }}>{pendingTickets}</h3>
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
                <p className="text-sm font-medium" style={{ color: colors.lightText }}>Usuarios con tickets</p>
                <h3 className="text-2xl font-semibold" style={{ color: colors.text }}>{filteredUsers.length}</h3>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#DBEAFE' }}>
                <User size={20} style={{ color: '#2563EB' }} />
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
                placeholder="Buscar por título, descripción o usuario..."
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
        
        {filteredUsers.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-500">
              No se encontraron tickets que coincidan con los criterios de búsqueda.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredUsers.map(user => (
              <motion.div 
                key={user.userId}
                variants={itemVariants}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                {/* User header */}
                <div 
                  className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer"
                  onClick={() => toggleUserExpand(user.userId)}
                  style={{ backgroundColor: colors.primary + '30' }}
                >
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: colors.text }}>
                      {user.userName} {' '}
                      <span className="text-sm font-normal" style={{ color: colors.lightText }}>
                        ({user.ticketList.length} ticket{user.ticketList.length !== 1 ? 's' : ''})
                      </span>
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs" style={{ color: colors.lightText }}>
                      <div className="flex items-center">
                        <Building size={14} className="mr-1" />
                        <span>{user.userSecretary}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone size={14} className="mr-1" />
                        <span>{user.userPhone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <motion.div
                      animate={{ rotate: expandedUsers[user.userId] ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white p-1 rounded-full shadow"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="20" 
                        height="20" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke={colors.accent}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                  </div>
                </div>
                
                {/* User tickets */}
                <AnimatePresence>
                  {expandedUsers[user.userId] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="divide-y">
                        {user.ticketList.map(ticket => {
                          const status = ticket.status || 'NOT_STARTED';
                          const StatusIcon = statusColors[status]?.icon || Clock;
                          
                          return (
                            <div key={ticket.id} className="p-5 hover:bg-gray-50">
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
                              
                              <div className="mt-4 flex items-center text-xs" style={{ color: colors.lightText }}>
                                <Calendar size={14} className="mr-1" />
                                <span>Creado el {formatDate(ticket.openingDate)}</span>
                              </div>
                              
                              <div className="mt-3 flex space-x-2">
                                {status === 'NOT_STARTED' ? (
                                  <button 
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none"
                                    style={{
                                      backgroundColor: colors.accent,
                                      color: 'white'
                                    }}
                                    onClick={() => handleTakeTicket(ticket.id)}
                                  >
                                    Tomar ticket
                                  </button>
                                ) : status === 'IN_PROGRESS' && ticket.assignedUserId === currentUserId ? (
                                  <button 
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none"
                                    style={{
                                      backgroundColor: colors.accent,
                                      color: 'white'
                                    }}
                                    onClick={() => handleCompleteTicket(ticket.id, ticket.assignedUserId)}
                                  >
                                    Marcar como completado
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      
      {/* Modal para notificar el estado de la asignación */}
      {modalVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-50"
          onClick={() => setModalVisible(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-xl shadow-2xl border border-gray-100 p-6 max-w-md w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón para cerrar en la esquina */}
            <button 
              onClick={() => setModalVisible(false)} 
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
              aria-label="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                stroke={colors.lightText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            {/* Contenido del modal con icono */}
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                modalSuccess ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {modalSuccess ? (
                  <Check size={32} className="text-green-600" />
                ) : (
                  <AlertTriangle size={32} className="text-red-600" />
                )}
              </div>
              
              <h2 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>
                {modalSuccess ? '¡Operación exitosa!' : 'Ha ocurrido un error'}
              </h2>
              
              <p className="text-base mb-6" style={{ color: colors.lightText }}>
                {modalMessage}
              </p>
              
              <button 
                onClick={() => setModalVisible(false)} 
                className="px-6 py-2.5 rounded-lg font-medium focus:outline-none focus:ring-2 transition-colors"
                style={{ 
                  backgroundColor: modalSuccess ? colors.accent : colors.error, 
                  color: 'white',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                {modalSuccess ? 'Continuar' : 'Entendido'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default AdminTickets;