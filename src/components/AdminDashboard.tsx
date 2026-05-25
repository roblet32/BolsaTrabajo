import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  User,
  Briefcase,
  Calendar,
  MessageSquare,
  Search,
  Filter,
  Trash2,
  Edit3,
  ShieldAlert,
  CheckCircle2,
  AlertOctagon,
  Shield,
  X,
  Star,
  RefreshCw,
  Lock,
  Unlock,
  Phone,
  FileText,
  Check,
  DollarSign,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { db, Profile, Review } from '../services/db';

export const AdminDashboard: React.FC = () => {
  const {
    profiles,
    appointments,
    deleteProfile,
    toggleProfileActive,
    deleteReview,
    deleteAppointment,
    refreshProfiles,
    refreshAppointments,
    signUpAdmin
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'reviews' | 'appointments' | 'new_admin'>('users');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtros para la pestaña de usuarios
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'todos' | 'cliente' | 'prestador' | 'admin'>('todos');
  const [userStatusFilter, setUserStatusFilter] = useState<'todos' | 'activos' | 'suspendidos'>('todos');

  // Filtros para la pestaña de reseñas
  const [reviewSearch, setReviewSearch] = useState('');

  // Filtros para la pestaña de citas
  const [apptStatusFilter, setApptStatusFilter] = useState<'todos' | 'pendiente' | 'aceptada' | 'completada' | 'cancelada'>('todos');

  // Estado para el modal de edición de perfil
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editRate, setEditRate] = useState(0);
  const [editSchedule, setEditSchedule] = useState('');
  const [editCategories, setEditCategories] = useState('');

  // Estados para Registro de Nuevo Administrador
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState(false);
  const [adminError, setAdminError] = useState('');

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminSuccess(false);
    setAdminError('');

    try {
      if (adminPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.');
      }
      await signUpAdmin(adminEmail, adminPassword, adminName, adminPhone);
      setAdminSuccess(true);
      setAdminName('');
      setAdminPhone('');
      setAdminEmail('');
      setAdminPassword('');
    } catch (err) {
      console.error(err);
      let errMsg = err instanceof Error ? err.message : 'Error al registrar al administrador.';
      if (errMsg.toLowerCase().includes('rate limit') || errMsg.toLowerCase().includes('limit exceeded')) {
        errMsg = 'Límite de correos de Supabase excedido. Para solucionar esto en desarrollo, desactiva la opción "Confirm email" en el panel de Supabase (Authentication -> Providers -> Email -> Confirm email: OFF).';
      }
      setAdminError(errMsg);
    } finally {
      setAdminLoading(false);
    }
  };

  // Cargar reseñas al montar el componente
  const loadReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const data = await db.adminGetAllReviews();
      setReviews(data);
    } catch (err) {
      console.error('Error al cargar reseñas en admin panel:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadReviews();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleGlobalRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshProfiles(),
        refreshAppointments(),
        loadReviews()
      ]);
    } catch (err) {
      console.error('Error al refrescar datos:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Cálculos de Estadísticas
  const stats = useMemo(() => {
    const totalUsers = profiles.length;
    const totalClients = profiles.filter(p => p.role === 'cliente').length;
    const totalProviders = profiles.filter(p => p.role === 'prestador').length;
    const totalAppointments = appointments.length;
    const totalReviews = reviews.length;

    return {
      totalUsers,
      totalClients,
      totalProviders,
      totalAppointments,
      totalReviews
    };
  }, [profiles, appointments, reviews]);

  // Lista de usuarios filtrados
  const filteredUsers = useMemo(() => {
    return profiles.filter(p => {
      // Filtro por término de búsqueda
      const term = userSearch.toLowerCase().trim();
      const matchesSearch = term === '' ||
        p.name.toLowerCase().includes(term) ||
        p.phone.includes(term) ||
        p.bio.toLowerCase().includes(term) ||
        p.categories.some(cat => cat.toLowerCase().includes(term));

      // Filtro por rol
      const matchesRole = userRoleFilter === 'todos' || p.role === userRoleFilter;

      // Filtro por estado
      const isActive = p.isActive !== false; // por defecto es activo
      const matchesStatus = userStatusFilter === 'todos' ||
        (userStatusFilter === 'activos' && isActive) ||
        (userStatusFilter === 'suspendidos' && !isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [profiles, userSearch, userRoleFilter, userStatusFilter]);

  // Lista de reseñas filtradas
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const term = reviewSearch.toLowerCase().trim();
      if (term === '') return true;

      // Buscar por autor, comentario, o ID de prestador
      return (
        r.clienteName.toLowerCase().includes(term) ||
        r.comment.toLowerCase().includes(term) ||
        r.prestadorId.toLowerCase().includes(term)
      );
    });
  }, [reviews, reviewSearch]);

  // Lista de citas filtradas
  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      return apptStatusFilter === 'todos' || a.status === apptStatusFilter;
    });
  }, [appointments, apptStatusFilter]);

  // Manejar el toggle de suspensión
  const handleToggleActive = async (user: Profile) => {
    const isCurrentlyActive = user.isActive !== false;
    const actionWord = isCurrentlyActive ? 'SUSPENDER' : 'ACTIVAR';
    const confirmMessage = `¿Está seguro de que desea ${actionWord} la cuenta de "${user.name}"?\n` +
      (isCurrentlyActive
        ? 'Si lo suspende, no aparecerá en las búsquedas ni en los mapas de servicios para clientes.'
        : 'Volverá a estar visible y activo en la plataforma.');

    if (window.confirm(confirmMessage)) {
      try {
        await toggleProfileActive(user.id, !isCurrentlyActive);
      } catch (err) {
        alert('Error al cambiar el estado del perfil.');
        console.error(err);
      }
    }
  };

  // Manejar la eliminación de un usuario
  const handleDeleteUser = async (user: Profile) => {
    if (user.role === 'admin') {
      alert('Por motivos de seguridad, no se puede eliminar la cuenta del Super Administrador.');
      return;
    }

    const confirmMessage = `⚠️ ¡ATENCIÓN! ¿Está seguro de que desea ELIMINAR permanentemente la cuenta de "${user.name}"?\n\n` +
      'Esta acción borrará por completo su perfil de la base de datos y no se puede deshacer.';

    if (window.confirm(confirmMessage)) {
      try {
        await deleteProfile(user.id);
      } catch (err) {
        alert('Error al eliminar el perfil.');
        console.error(err);
      }
    }
  };

  // Manejar la eliminación de una reseña
  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar permanentemente esta reseña? Esta acción recalculará las estrellas promedio del proveedor.')) {
      try {
        await deleteReview(reviewId);
        // Recargar reseñas de forma local
        const allReviews = await db.adminGetAllReviews();
        setReviews(allReviews);
      } catch (err) {
        alert('Error al eliminar la reseña.');
        console.error(err);
      }
    }
  };

  // Manejar la cancelación de una cita
  const handleCancelAppointment = async (apptId: string) => {
    if (window.confirm('¿Está seguro de que desea cancelar esta cita administrativa? Se eliminará de la base de datos de citas activas.')) {
      try {
        await deleteAppointment(apptId);
      } catch (err) {
        alert('Error al cancelar la cita.');
        console.error(err);
      }
    }
  };

  // Abrir modal de edición
  const handleOpenEditModal = (user: Profile) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditPhone(user.phone);
    setEditBio(user.bio || '');
    setEditRate(user.rate || 0);
    setEditSchedule(user.schedule || '');
    setEditCategories((user.categories || []).join(', '));
  };

  // Guardar cambios del perfil editado
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const parsedCategories = editCategories
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const updated: Partial<Profile> & { id: string } = {
        id: editingUser.id,
        name: editName,
        phone: editPhone,
        bio: editBio,
        role: editingUser.role, // Mantener el mismo rol
        categories: parsedCategories,
        rate: Number(editRate),
        schedule: editSchedule
      };

      await db.saveProfile(updated as Profile);
      await refreshProfiles();

      // Si editamos un prestador cuyas reseñas afectaron el estado actual, también refrescamos reseñas
      await loadReviews();

      setEditingUser(null);
    } catch (err) {
      alert('Error al guardar el perfil.');
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', minHeight: 'calc(100vh - 120px)' }}>
      {/* Encabezado */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '5px solid var(--danger)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '10px' }}>
                <Shield size={24} />
              </div>
              <h1 style={{ margin: 0, fontSize: '1.85rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
                Panel de Control Super Admin
              </h1>
            </div>
            <p style={{ margin: 0, color: 'var(--text-dark-secondary)', fontSize: '0.95rem' }}>
              Moderación global de usuarios, citas, calificaciones y control de suspensión para Bolsa de Trabajo Jalpan.
            </p>
          </div>

          <button
            className="btn-secondary"
            onClick={handleGlobalRefresh}
            disabled={isRefreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}
          >
            <RefreshCw size={16} className={isRefreshing ? 'spin-animation' : ''} />
            <span>{isRefreshing ? 'Actualizando...' : 'Sincronizar'}</span>
          </button>
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="admin-stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Total Usuarios */}
        <div className="glass-card admin-stat-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(15, 118, 110, 0.15)', color: 'var(--primary-light)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-dark-primary)' }}>{stats.totalUsers}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dark-secondary)', fontWeight: 600 }}>Total Usuarios</div>
          </div>
        </div>

        {/* Clientes */}
        <div className="glass-card admin-stat-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.15)', color: '#818cf8' }}>
            <User size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-dark-primary)' }}>{stats.totalClients}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dark-secondary)', fontWeight: 600 }}>Clientes</div>
          </div>
        </div>

        {/* Proveedores */}
        <div className="glass-card admin-stat-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--secondary-light)' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-dark-primary)' }}>{stats.totalProviders}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dark-secondary)', fontWeight: 600 }}>Proveedores</div>
          </div>
        </div>

        {/* Citas */}
        <div className="glass-card admin-stat-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--info)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-dark-primary)' }}>{stats.totalAppointments}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dark-secondary)', fontWeight: 600 }}>Citas Activas</div>
          </div>
        </div>

        {/* Reseñas */}
        <div className="glass-card admin-stat-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-dark-primary)' }}>{stats.totalReviews}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dark-secondary)', fontWeight: 600 }}>Reseñas Moderadas</div>
          </div>
        </div>
      </div>

      {/* Menú de Navegación de Pestañas */}
      <div className="admin-tabs-nav" style={{
        display: 'flex',
        borderBottom: '1px solid var(--bg-dark-card-border)',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        <button
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'users' ? '3px solid var(--danger)' : '3px solid transparent',
            color: activeTab === 'users' ? 'var(--text-dark-primary)' : 'var(--text-dark-secondary)',
            fontWeight: activeTab === 'users' ? 'bold' : 'normal',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'var(--transition-fast)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            outline: 'none'
          }}
        >
          <Users size={16} />
          <span>Gestión de Usuarios ({filteredUsers.length})</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'reviews' ? '3px solid var(--danger)' : '3px solid transparent',
            color: activeTab === 'reviews' ? 'var(--text-dark-primary)' : 'var(--text-dark-secondary)',
            fontWeight: activeTab === 'reviews' ? 'bold' : 'normal',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'var(--transition-fast)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            outline: 'none'
          }}
        >
          <MessageSquare size={16} />
          <span>Moderación de Reseñas ({filteredReviews.length})</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'appointments' ? '3px solid var(--danger)' : '3px solid transparent',
            color: activeTab === 'appointments' ? 'var(--text-dark-primary)' : 'var(--text-dark-secondary)',
            fontWeight: activeTab === 'appointments' ? 'bold' : 'normal',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'var(--transition-fast)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            outline: 'none'
          }}
        >
          <Calendar size={16} />
          <span>Monitoreo de Citas ({filteredAppointments.length})</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'new_admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('new_admin')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'new_admin' ? '3px solid var(--danger)' : '3px solid transparent',
            color: activeTab === 'new_admin' ? 'var(--text-dark-primary)' : 'var(--text-dark-secondary)',
            fontWeight: activeTab === 'new_admin' ? 'bold' : 'normal',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'var(--transition-fast)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            outline: 'none'
          }}
        >
          <Shield size={16} />
          <span>Registrar Administrador</span>
        </button>
      </div>

      {/* Pestaña: Gestión de Usuarios */}
      {activeTab === 'users' && (
        <div>
          {/* Barra de Filtros */}
          <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
                {/* Buscador */}
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dark-secondary)' }} />
                  <input
                    type="text"
                    className="search-field"
                    placeholder="Buscar por nombre, teléfono, especialidad..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{ paddingLeft: '2.5rem', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Filtro de Rol */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Filter size={16} style={{ color: 'var(--text-dark-secondary)' }} />
                  <select
                    className="filter-select"
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value as 'todos' | 'cliente' | 'prestador' | 'admin')}
                    style={{ minWidth: '130px' }}
                  >
                    <option value="todos">Todos los Roles</option>
                    <option value="cliente">Clientes</option>
                    <option value="prestador">Proveedores</option>
                    <option value="admin">Administradores</option>
                  </select>
                </div>

                {/* Filtro de Estado */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={16} style={{ color: 'var(--text-dark-secondary)' }} />
                  <select
                    className="filter-select"
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value as 'todos' | 'activos' | 'suspendidos')}
                    style={{ minWidth: '130px' }}
                  >
                    <option value="todos">Todos los Estados</option>
                    <option value="activos">Activos</option>
                    <option value="suspendidos">Suspendidos</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de Usuarios */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--bg-dark-card-border)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-dark-secondary)', fontWeight: 600 }}>Usuario</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dark-secondary)', fontWeight: 600 }}>Rol</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dark-secondary)', fontWeight: 600 }}>Teléfono</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dark-secondary)', fontWeight: 600 }}>Tarifa / Categorías</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dark-secondary)', fontWeight: 600 }}>Estado</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dark-secondary)', fontWeight: 600, textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dark-secondary)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                          <AlertOctagon size={32} style={{ color: 'var(--text-dark-secondary)' }} />
                          <span>No se encontraron usuarios con los filtros aplicados.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isActive = u.isActive !== false;
                      return (
                        <tr
                          key={u.id}
                          className={!isActive ? 'user-suspended-row' : ''}
                          style={{
                            borderBottom: '1px solid var(--bg-dark-card-border)',
                            transition: 'var(--transition-fast)',
                            opacity: isActive ? 1 : 0.65,
                            background: !isActive ? 'rgba(239, 68, 68, 0.02)' : 'none'
                          }}
                        >
                          {/* Datos de Perfil */}
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: u.role === 'admin'
                                  ? 'rgba(239, 68, 68, 0.2)'
                                  : u.role === 'prestador'
                                    ? 'rgba(245, 158, 11, 0.2)'
                                    : 'rgba(79, 70, 229, 0.2)',
                                color: u.role === 'admin'
                                  ? 'var(--danger)'
                                  : u.role === 'prestador'
                                    ? 'var(--secondary-color)'
                                    : '#818cf8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.95rem'
                              }}>
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 'bold', color: 'var(--text-dark-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  {u.name}
                                  {u.role === 'admin' && <Shield size={14} style={{ color: 'var(--danger)' }} />}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dark-secondary)' }}>ID: {u.id}</div>
                              </div>
                            </div>
                          </td>

                          {/* Rol */}
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              background: u.role === 'admin'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : u.role === 'prestador'
                                  ? 'rgba(245, 158, 11, 0.15)'
                                  : 'rgba(79, 70, 229, 0.15)',
                              color: u.role === 'admin'
                                ? 'var(--danger)'
                                : u.role === 'prestador'
                                  ? 'var(--secondary-color)'
                                  : '#818cf8'
                            }}>
                              {u.role === 'admin' ? 'Administrador' : u.role === 'prestador' ? 'Proveedor' : 'Cliente'}
                            </span>
                          </td>

                          {/* Teléfono */}
                          <td style={{ padding: '1rem', color: 'var(--text-dark-primary)', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Phone size={14} style={{ color: 'var(--text-dark-secondary)' }} />
                              <span>{u.phone || 'Sin número'}</span>
                            </div>
                          </td>

                          {/* Tarifa / Especialidad */}
                          <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                            {u.role === 'prestador' ? (
                              <div>
                                <div style={{ color: 'var(--text-dark-primary)', fontWeight: 'bold' }}>
                                  ${u.rate || 0} / hora
                                </div>
                                <div style={{ color: 'var(--text-dark-secondary)', display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                                  {(u.categories || []).map(c => (
                                    <span key={c} style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.1rem 0.35rem', borderRadius: '4px', border: '1px solid var(--bg-dark-card-border)' }}>{c}</span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-dark-secondary)' }}>N/A</span>
                            )}
                          </td>

                          {/* Estado */}
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              {isActive ? (
                                <>
                                  <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                                  <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>Activo</span>
                                </>
                              ) : (
                                <>
                                  <AlertOctagon size={16} style={{ color: 'var(--danger)' }} />
                                  <span style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>Suspendido</span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* Acciones */}
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button
                                className="btn-secondary"
                                onClick={() => handleOpenEditModal(u)}
                                title="Editar Perfil"
                                style={{ padding: '0.4rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <Edit3 size={15} style={{ color: 'var(--info)' }} />
                              </button>

                              <button
                                className="btn-secondary"
                                onClick={() => handleToggleActive(u)}
                                title={isActive ? 'Suspender Usuario' : 'Activar Usuario'}
                                style={{
                                  padding: '0.4rem',
                                  borderRadius: '8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: isActive ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                  border: '1px solid transparent'
                                }}
                              >
                                {isActive ? (
                                  <Lock size={15} style={{ color: 'var(--warning)' }} />
                                ) : (
                                  <Unlock size={15} style={{ color: 'var(--success)' }} />
                                )}
                              </button>

                              {u.role !== 'admin' && (
                                <button
                                  className="btn-secondary"
                                  onClick={() => handleDeleteUser(u)}
                                  title="Eliminar permanentemente"
                                  style={{
                                    padding: '0.4rem',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid transparent'
                                  }}
                                >
                                  <Trash2 size={15} style={{ color: 'var(--danger)' }} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Pestaña: Moderación de Reseñas */}
      {activeTab === 'reviews' && (
        <div>
          {/* Buscador de reseñas */}
          <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dark-secondary)' }} />
              <input
                type="text"
                className="search-field"
                placeholder="Buscar por cliente, comentario, proveedor..."
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Listado de Reseñas */}
          {isLoadingReviews ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dark-secondary)' }}>
              <RefreshCw size={32} className="spin-animation" style={{ marginBottom: '0.5rem' }} />
              <div>Cargando calificaciones de la base de datos...</div>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dark-secondary)' }}>
              <MessageSquare size={36} style={{ color: 'var(--text-dark-secondary)', marginBottom: '0.5rem' }} />
              <div>No hay reseñas que coincidan con la búsqueda.</div>
            </div>
          ) : (
            <div className="admin-reviews-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem'
            }}>
              {filteredReviews.map((r) => {
                // Encontrar datos del prestador para mostrar su nombre
                const targetProvider = profiles.find(p => p.id === r.prestadorId);

                return (
                  <div key={r.id} className="glass-card" style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderTop: '3px solid var(--secondary-color)',
                    position: 'relative'
                  }}>
                    {/* Botón borrar en esquina */}
                    <button
                      onClick={() => handleDeleteReview(r.id)}
                      title="Eliminar Reseña Inapropiada"
                      style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: 'none',
                        color: 'var(--danger)',
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>

                    <div>
                      {/* Autor y Fecha */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.85rem',
                          color: 'var(--text-dark-primary)'
                        }}>
                          {r.clienteName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-dark-primary)' }}>{r.clienteName}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dark-secondary)' }}>{r.date}</div>
                        </div>
                      </div>

                      {/* Calificación y Destinatario */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', color: 'var(--secondary-color)' }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < r.score ? 'var(--secondary-color)' : 'none'}
                              strokeWidth={2}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dark-secondary)' }}>({r.score} estrellas)</span>
                      </div>

                      {/* Comentario */}
                      <p style={{
                        margin: '0 0 1rem 0',
                        fontSize: '0.9rem',
                        color: 'var(--text-dark-primary)',
                        lineHeight: 1.4,
                        fontStyle: 'italic',
                        background: 'rgba(255, 255, 255, 0.02)',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        borderLeft: '2px solid var(--bg-dark-card-border)'
                      }}>
                        "{r.comment}"
                      </p>
                    </div>

                    {/* Info de Prestador Relacionado */}
                    <div style={{
                      marginTop: 'auto',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--bg-dark-card-border)',
                      fontSize: '0.8rem',
                      color: 'var(--text-dark-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>Dirigido a:</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--primary-light)' }}>
                        {targetProvider ? targetProvider.name : `Proveedor (ID: ${r.prestadorId.slice(0, 5)}...)`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pestaña: Monitoreo de Citas */}
      {activeTab === 'appointments' && (
        <div>
          {/* Filtros de Citas */}
          <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} style={{ color: 'var(--text-dark-secondary)' }} />
              <select
                className="filter-select"
                value={apptStatusFilter}
                onChange={(e) => setApptStatusFilter(e.target.value as 'todos' | 'pendiente' | 'aceptada' | 'completada' | 'cancelada')}
                style={{ minWidth: '150px' }}
              >
                <option value="todos">Todos los Estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="aceptada">Aceptadas</option>
                <option value="completada">Completadas</option>
                <option value="cancelada">Canceladas</option>
              </select>
            </div>
          </div>

          {/* Tabla de Citas */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--bg-dark-card-border)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-dark-secondary)', fontWeight: 600 }}>ID de Cita</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dark-secondary)', fontWeight: 600 }}>Cliente</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dark-secondary)', fontWeight: 600 }}>Proveedor</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dark-secondary)', fontWeight: 600 }}>Fecha / Hora</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dark-secondary)', fontWeight: 600 }}>Notas de la Cita</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dark-secondary)', fontWeight: 600 }}>Estado</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dark-secondary)', fontWeight: 600, textAlign: 'right' }}>Moderación</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dark-secondary)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                          <Calendar size={32} style={{ color: 'var(--text-dark-secondary)' }} />
                          <span>No hay citas registradas en la base de datos con este estado.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((a) => {
                      return (
                        <tr key={a.id} style={{ borderBottom: '1px solid var(--bg-dark-card-border)', transition: 'var(--transition-fast)' }}>
                          {/* ID Cita */}
                          <td style={{ padding: '1rem', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-dark-secondary)' }}>
                            {a.id.slice(0, 8)}...
                          </td>

                          {/* Cliente */}
                          <td style={{ padding: '1rem', color: 'var(--text-dark-primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            {a.clienteName}
                          </td>

                          {/* Prestador */}
                          <td style={{ padding: '1rem', color: 'var(--primary-light)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            {a.prestadorName}
                          </td>

                          {/* Fecha / Hora */}
                          <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-dark-primary)' }}>
                            <div style={{ fontWeight: 600 }}>{a.date}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dark-secondary)' }}>{a.time}</div>
                          </td>

                          {/* Notas */}
                          <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-dark-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.notes}>
                            {a.notes || <span style={{ fontStyle: 'italic' }}>Sin detalles</span>}
                          </td>

                          {/* Estado */}
                          <td style={{ padding: '1rem' }}>
                            <span className={`appt-status ${a.status}`}>
                              {a.status === 'pendiente' && 'Pendiente'}
                              {a.status === 'aceptada' && 'Aceptada'}
                              {a.status === 'completada' && 'Completada'}
                              {a.status === 'cancelada' && 'Cancelada'}
                            </span>
                          </td>

                          {/* Acciones */}
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <button
                              onClick={() => handleCancelAppointment(a.id)}
                              className="btn-secondary"
                              title="Cancelar y eliminar cita"
                              style={{
                                padding: '0.4rem 0.6rem',
                                fontSize: '0.75rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: 'var(--danger)',
                                border: '1px solid transparent',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              <Trash2 size={12} />
                              <span>Eliminar</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Pestaña: Registrar Administrador */}
      {activeTab === 'new_admin' && (
        <div style={{ maxWidth: '650px', margin: '0 auto', padding: '1rem' }}>
          <div className="glass-card" style={{ padding: '2.5rem', borderTop: '4px solid var(--danger)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>
                <Shield size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                  Registrar Nuevo Administrador
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-dark-secondary)' }}>
                  Crea cuentas administrativas con privilegios completos de supervisión.
                </p>
              </div>
            </div>

            {/* Banners de Notificación */}
            {adminError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertOctagon size={16} style={{ flexShrink: 0 }} />
                <span>{adminError}</span>
              </div>
            )}

            {adminSuccess && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>¡Administrador registrado exitosamente! La cuenta ya está activa para iniciar sesión.</span>
              </div>
            )}

            <form onSubmit={handleRegisterAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Nombre */}
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark-primary)' }}>
                  Nombre Completo
                </label>
                <div className="search-input-group" style={{ margin: 0 }}>
                  <User size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ing. Carlos Mendoza"
                    className="search-field"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark-primary)' }}>
                  Teléfono de Contacto
                </label>
                <div className="search-input-group" style={{ margin: 0 }}>
                  <Phone size={18} />
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 4411002233"
                    className="search-field"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Correo Electrónico */}
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark-primary)' }}>
                  Correo Electrónico
                </label>
                <div className="search-input-group" style={{ margin: 0 }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dark-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>@</span>
                  <input
                    type="email"
                    required
                    placeholder="administrador@Trabajalpan.com"
                    className="search-field"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark-primary)' }}>
                  Contraseña de Acceso
                </label>
                <div className="search-input-group" style={{ margin: 0 }}>
                  <Lock size={18} />
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    className="search-field"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Información importante */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--bg-dark-card-border)',
                borderRadius: '8px',
                padding: '1rem',
                fontSize: '0.75rem',
                color: 'var(--text-dark-secondary)',
                lineHeight: '1.4'
              }}>
                <strong>NOTA DE SEGURIDAD:</strong> Al registrar este usuario, se creará un perfil administrativo completo en Supabase. El registro se realiza de manera segura y en segundo plano sin alterar ni cerrar la sesión actual de super administrador con la que estás operando.
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={adminLoading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  marginTop: '0.5rem',
                  background: 'var(--danger)',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
                }}
              >
                {adminLoading ? 'Registrando...' : 'Registrar Administrador'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EDICIÓN DE PERFIL DE USUARIO */}
      {editingUser && (
        <div className="admin-modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '550px',
            padding: '2rem',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderTop: '4px solid var(--info)',
            position: 'relative',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {/* Botón cerrar */}
            <button
              onClick={() => setEditingUser(null)}
              style={{
                position: 'absolute',
                right: '1.25rem',
                top: '1.25rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-dark-secondary)',
                cursor: 'pointer',
                padding: '0.25rem'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Edit3 size={20} style={{ color: 'var(--info)' }} />
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                Editar Perfil de Usuario
              </h3>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Info General (Fija) */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--bg-dark-card-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-dark-secondary)' }}>
                  <span>ID de Usuario:</span>
                  <span style={{ fontFamily: 'monospace' }}>{editingUser.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-dark-secondary)', marginTop: '0.25rem' }}>
                  <span>Rol de Cuenta:</span>
                  <span style={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--primary-light)' }}>{editingUser.role}</span>
                </div>
              </div>

              {/* Nombre */}
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark-primary)' }}>
                  Nombre Completo
                </label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              {/* Teléfono */}
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark-primary)' }}>
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              {/* Biografía / Descripción */}
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark-primary)' }}>
                  Biografía / Resumen de Perfil
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }}
                  placeholder="Escribe una breve reseña de las habilidades o información del usuario..."
                />
              </div>

              {/* Campos Extra para Prestadores */}
              {editingUser.role === 'prestador' && (
                <>
                  <div style={{ borderTop: '1px solid var(--bg-dark-card-border)', paddingTop: '1rem', margin: '0.5rem 0' }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: 'var(--secondary-color)', fontWeight: 'bold' }}>
                      Campos de Proveedor de Servicios
                    </h4>
                  </div>

                  {/* Tarifa por Hora */}
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark-primary)' }}>
                      <DollarSign size={14} />
                      <span>Tarifa por Hora (MXN)</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      value={editRate}
                      onChange={(e) => setEditRate(Number(e.target.value))}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Horario */}
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark-primary)' }}>
                      <Clock size={14} />
                      <span>Horario de Atención</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={editSchedule}
                      onChange={(e) => setEditSchedule(e.target.value)}
                      placeholder="Ej. Lunes a Viernes: 9:00 AM - 6:00 PM"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Categorías / Especialidades */}
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark-primary)' }}>
                      <FileText size={14} />
                      <span>Categorías (separadas por comas)</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={editCategories}
                      onChange={(e) => setEditCategories(e.target.value)}
                      placeholder="Ej. plomería, electricidad, albañilería"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                    <small style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dark-secondary)', marginTop: '0.25rem' }}>
                      Las categorías ayudan a clasificar al proveedor en el buscador. Use minúsculas.
                    </small>
                  </div>
                </>
              )}

              {/* Botones */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingUser(null)}
                  style={{ padding: '0.6rem 1.2rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: '0.6rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'var(--primary-color)'
                  }}
                >
                  <Check size={16} />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
