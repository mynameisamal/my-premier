'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '../../../lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('email');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setIsLoading(false);
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchUsers();
  }, [currentUser, authLoading]);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, roleFilter, sortBy]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet('/admin/users');
      if (data) {
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        (user.email || '').toLowerCase().includes(term) ||
        (user.uid || '').toLowerCase().includes(term) ||
        (user.role || '').toLowerCase().includes(term)
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter removed - is_active column doesn't exist in backend

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'email') return (a.email || '').localeCompare(b.email || '');
      if (sortBy === 'role') return (a.role || '').localeCompare(b.role || '');
      return 0;
    });

    setFilteredUsers(filtered);
  };

  const handleRoleChange = async (id, newRole) => {
    setUpdatingRole({ ...updatingRole, [id]: true });

    try {
      const result = await apiPatch(`/admin/users/${id}/role`, { role: newRole });

      if (result) {
        setUsers(prevUsers =>
          Array.isArray(prevUsers)
            ? prevUsers.map(u =>
                u.id === id ? { ...u, role: newRole } : u
              )
            : []
        );
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    } finally {
      setUpdatingRole(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    // Status toggle disabled - is_active column doesn't exist
    alert('User status update is not supported');
  };

  const handleAddUser = async (userData) => {
    try {
      const result = await apiPost('/admin/users', userData);
      if (result) {
        await fetchUsers();
        setShowAddModal(false);
        alert('User created successfully');
      } else {
        alert('Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  const handleEditUser = async (id, userData) => {
    try {
      const result = await apiPut(`/admin/users/${id}`, userData);
      if (result) {
        await fetchUsers();
        setShowEditModal(false);
        setEditingUser(null);
        alert('User updated successfully');
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setDeletingUser(id);
    try {
      const result = await apiDelete(`/admin/users/${id}`);
      // DELETE returns null on success (204 No Content)
      await fetchUsers();
      setDeletingUser(null);
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
      setDeletingUser(null);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const formatRole = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'sales': return 'Sales Manager';
      case 'client': return 'Client';
      default: return role || 'User';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#3b82f6';
      case 'sales': return '#8b5cf6';
      case 'client': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getRoleBadge = (role) => {
    const color = getRoleColor(role);
    return {
      backgroundColor: color + '15',
      color: color,
      border: `1px solid ${color}30`
    };
  };

  // Calculate stats
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const salesUsers = users.filter(u => u.role === 'sales').length;
  const clientUsers = users.filter(u => u.role === 'client').length;
  const engineerUsers = users.filter(u => u.role === 'engineer').length;

  // Inline styles - DIPERBAIKI: menghapus semua shorthand 'background'
  const styles = {
    container: {
      padding: '30px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      flexWrap: 'wrap',
      gap: '20px'
    },
    headerLeft: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1f2937',
      margin: '0',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#6b7280',
      margin: '0'
    },
    exportButton: {
      padding: '10px 20px',
      backgroundColor: 'white',
      color: '#3b82f6',
      border: '1px solid #d1d5db',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease'
    },
    exportButtonHover: {
      backgroundColor: '#f3f4f6',
      transform: 'translateY(-1px)'
    },
    stats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer'
    },
    statCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
    },
    statIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    statContent: {
      flex: 1,
      minWidth: 0
    },
    statValue: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '4px'
    },
    statLabel: {
      fontSize: '12px',
      color: '#6b7280',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    statTrend: {
      fontSize: '11px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      marginTop: '4px'
    },
    controls: {
      display: 'flex',
      gap: '16px',
      marginBottom: '30px',
      flexWrap: 'wrap',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '16px',
      border: '1px solid #e5e7eb'
    },
    searchInput: {
      padding: '10px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '10px',
      fontSize: '14px',
      backgroundColor: 'white',
      minWidth: '250px',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    searchInputFocus: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    },
    filterSelect: {
      padding: '10px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '10px',
      fontSize: '14px',
      backgroundColor: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none',
      minWidth: '150px'
    },
    sortSelect: {
      padding: '10px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '10px',
      fontSize: '14px',
      backgroundColor: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none',
      minWidth: '120px'
    },
    refreshButton: {
      padding: '10px 16px',
      backgroundColor: '#f3f4f6',
      color: '#4b5563',
      border: '1px solid #d1d5db',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
      marginLeft: 'auto'
    },
    refreshButtonHover: {
      backgroundColor: '#e5e7eb',
      transform: 'translateY(-1px)'
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e5e7eb'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    tableHeader: {
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb'
    },
    tableHeaderCell: {
      padding: '16px 20px',
      textAlign: 'left',
      fontSize: '12px',
      fontWeight: '600',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    tableRow: {
      borderBottom: '1px solid #f3f4f6',
      transition: 'backgroundColor 0.2s ease'
    },
    tableRowHover: {
      backgroundColor: '#f9fafb'
    },
    tableCell: {
      padding: '18px 20px',
      fontSize: '14px',
      color: '#1f2937',
      verticalAlign: 'middle'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    userAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#3b82f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '600',
      fontSize: '14px',
      flexShrink: 0
    },
    userDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    userEmail: {
      fontWeight: '500',
      color: '#1f2937'
    },
    userId: {
      fontSize: '12px',
      color: '#9ca3af'
    },
    roleBadge: {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      width: 'fit-content'
    },
    statusBadge: {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      display: 'inline-block'
    },
    statusActive: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    },
    statusInactive: {
      backgroundColor: '#fee2e2',
      color: '#dc2626'
    },
    roleSelect: {
      padding: '6px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none',
      minWidth: '120px'
    },
    roleSelectFocus: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    },
    toggleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    toggleSwitch: {
      position: 'relative',
      display: 'inline-block',
      width: '44px',
      height: '24px'
    },
    toggleInput: {
      opacity: '0',
      width: '0',
      height: '0'
    },
    toggleSlider: {
      position: 'absolute',
      cursor: 'pointer',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: '#d1d5db',
      transition: '0.4s',
      borderRadius: '34px'
    },
    toggleSliderBefore: {
      position: 'absolute',
      content: '""',
      height: '16px',
      width: '16px',
      left: '4px',
      bottom: '4px',
      backgroundColor: 'white',
      transition: '0.4s',
      borderRadius: '50%'
    },
    toggleActive: {
      backgroundColor: '#10b981'
    },
    toggleActiveBefore: {
      transform: 'translateX(20px)'
    },
    updatingText: {
      fontSize: '12px',
      color: '#6b7280',
      marginLeft: '8px'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px'
    },
    actionButton: {
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s ease'
    },
    editButton: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    editButtonHover: {
      backgroundColor: '#bfdbfe',
      transform: 'translateY(-1px)'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px'
    },
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '16px',
      opacity: '0.5'
    },
    emptyText: {
      color: '#6b7280',
      marginBottom: '20px',
      fontSize: '15px'
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      gap: '16px'
    },
    spinner: {
      width: '48px',
      height: '48px',
      border: '4px solid #e5e7eb',
      borderTopColor: '#3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  };

  if (authLoading || isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={{ color: '#6b7280' }}>Loading users...</p>
        </div>
        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        input[type="checkbox"]:checked + .toggle-slider {
          background-color: #10b981;
        }
        
        input[type="checkbox"]:checked + .toggle-slider:before {
          transform: translateX(20px);
        }
      `}</style>
      
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.title}>
              <span style={{ color: '#3b82f6' }}>User</span> Management
            </h1>
            <p style={styles.subtitle}>Manage user roles, permissions, and access</p>
          </div>
          
          <button
            type="button"
            onClick={() => {
              // Export functionality would go here
              alert('Export functionality would be implemented here');
            }}
            style={styles.exportButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = styles.exportButtonHover.backgroundColor;
              e.currentTarget.style.transform = styles.exportButtonHover.transform;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = styles.exportButton.backgroundColor;
              e.currentTarget.style.transform = 'none';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Users
          </button>
        </div>

        {/* Stats - DIPERBAIKI: menambahkan key prop dan menghapus background shorthand */}
        <div style={styles.stats}>
          <div 
            key="stat-total-users"
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = styles.statCardHover.transform;
              e.currentTarget.style.boxShadow = styles.statCardHover.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => setRoleFilter('all')}
          >
            <div style={{ 
              ...styles.statIcon, 
              backgroundColor: '#dbeafe' 
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 0a6 6 0 00-9-5.197" />
              </svg>
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{totalUsers}</div>
              <div style={styles.statLabel}>Total Users</div>
            </div>
          </div>

          <div 
            key="stat-admins"
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = styles.statCardHover.transform;
              e.currentTarget.style.boxShadow = styles.statCardHover.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => setRoleFilter('admin')}
          >
            <div style={{ 
              ...styles.statIcon, 
              backgroundColor: '#e0e7ff' 
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804L12 10.5l6.879 7.304-1.597 1.44L12 13.5l-5.282 4.744-1.597-1.44zM12 2v8" />
              </svg>
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{adminUsers}</div>
              <div style={styles.statLabel}>Administrators</div>
            </div>
          </div>

          <div 
            key="stat-sales"
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = styles.statCardHover.transform;
              e.currentTarget.style.boxShadow = styles.statCardHover.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => setRoleFilter('sales')}
          >
            <div style={{ 
              ...styles.statIcon, 
              backgroundColor: '#f3e8ff' 
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{salesUsers}</div>
              <div style={styles.statLabel}>Sales Managers</div>
            </div>
          </div>

          <div 
            key="stat-active"
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = styles.statCardHover.transform;
              e.currentTarget.style.boxShadow = styles.statCardHover.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => setRoleFilter('engineer')}
          >
            <div style={{ 
              ...styles.statIcon, 
              backgroundColor: '#d1fae5' 
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{engineerUsers}</div>
              <div style={styles.statLabel}>Engineers</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = styles.searchInputFocus.borderColor;
              e.currentTarget.style.boxShadow = styles.searchInputFocus.boxShadow;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = styles.searchInput.borderColor;
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={styles.filterSelect}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = styles.searchInputFocus.borderColor;
              e.currentTarget.style.boxShadow = styles.searchInputFocus.boxShadow;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = styles.filterSelect.borderColor;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="sales">Sales Managers</option>
            <option value="client">Clients</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.sortSelect}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = styles.searchInputFocus.borderColor;
              e.currentTarget.style.boxShadow = styles.searchInputFocus.boxShadow;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = styles.sortSelect.borderColor;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <option value="email">Sort by Email</option>
            <option value="role">Sort by Role</option>
          </select>
          
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              ...styles.refreshButton,
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              marginLeft: 'auto'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.transform = styles.refreshButtonHover.transform;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
          <button
            type="button"
            onClick={fetchUsers}
            style={styles.refreshButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = styles.refreshButtonHover.backgroundColor;
              e.currentTarget.style.transform = styles.refreshButtonHover.transform;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = styles.refreshButton.backgroundColor;
              e.currentTarget.style.transform = 'none';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Users Table - DIPERBAIKI: memastikan key prop ada */}
        <div style={styles.tableContainer}>
          {filteredUsers.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>👥</div>
              <p style={styles.emptyText}>
                {searchTerm || roleFilter !== 'all'
                  ? 'No users match your filters'
                  : 'No users found in the system'}
              </p>
              {(searchTerm || roleFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('all');
                  }}
                  style={{
                    ...styles.refreshButton,
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.tableHeaderCell}>User</th>
                  <th style={styles.tableHeaderCell}>Role</th>
                  <th style={styles.tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((userItem) => (
                  <tr 
                    key={userItem.id || userItem.email}
                    style={styles.tableRow}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = styles.tableRowHover.backgroundColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={styles.tableCell}>
                      <div style={styles.userInfo}>
                        <div style={styles.userAvatar}>
                          {(userItem.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div style={styles.userDetails}>
                          <div style={styles.userEmail}>{userItem.email || 'No email'}</div>
                          <div style={styles.userId}>ID: {userItem.id?.substring(0, 8) || 'N/A'}</div>
                          {userItem.full_name && (
                            <div style={{ ...styles.userId, fontSize: '11px', marginTop: '2px' }}>
                              {userItem.full_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <select
                        value={userItem.role || 'client'}
                        onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                        disabled={updatingRole[userItem.id] || userItem.id === currentUser?.id}
                        style={{
                          ...styles.roleSelect,
                          backgroundColor: getRoleBadge(userItem.role).backgroundColor,
                          color: getRoleBadge(userItem.role).color,
                          border: getRoleBadge(userItem.role).border
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = styles.roleSelectFocus.borderColor;
                          e.currentTarget.style.boxShadow = styles.roleSelectFocus.boxShadow;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = getRoleBadge(userItem.role).border;
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <option value="admin">Administrator</option>
                        <option value="sales">Sales Manager</option>
                        <option value="client">Client</option>
                        <option value="engineer">Engineer</option>
                      </select>
                      {updatingRole[userItem.id] && (
                        <span style={styles.updatingText}>Updating...</span>
                      )}
                      {userItem.id === currentUser?.id && (
                        <span style={{ ...styles.updatingText, color: '#3b82f6', marginLeft: '8px' }}>
                          (You)
                        </span>
                      )}
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.actionButtons}>
                        <button
                          type="button"
                          onClick={() => openEditModal(userItem)}
                          disabled={userItem.id === currentUser?.id}
                          style={{
                            ...styles.actionButton,
                            ...styles.editButton
                          }}
                          onMouseEnter={(e) => {
                            if (!e.currentTarget.disabled) {
                              e.currentTarget.style.backgroundColor = styles.editButtonHover.backgroundColor;
                              e.currentTarget.style.transform = styles.editButtonHover.transform;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!e.currentTarget.disabled) {
                              e.currentTarget.style.backgroundColor = styles.editButton.backgroundColor;
                              e.currentTarget.style.transform = 'none';
                            }
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(userItem.id)}
                          disabled={userItem.id === currentUser?.id || deletingUser === userItem.id}
                          style={{
                            ...styles.actionButton,
                            backgroundColor: '#fee2e2',
                            color: '#dc2626'
                          }}
                          onMouseEnter={(e) => {
                            if (!e.currentTarget.disabled) {
                              e.currentTarget.style.backgroundColor = '#fecaca';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!e.currentTarget.disabled) {
                              e.currentTarget.style.backgroundColor = '#fee2e2';
                              e.currentTarget.style.transform = 'none';
                            }
                          }}
                        >
                          {deletingUser === userItem.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <UserModal
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSave={handleAddUser}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <UserModal
          mode="edit"
          user={editingUser}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
          onSave={(data) => handleEditUser(editingUser.id, data)}
        />
      )}
    </>
  );
}

// UserModal Component
function UserModal({ mode, user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    role: user?.role || 'client',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (mode === 'add' && !formData.password) newErrors.password = 'Password is required';
    if (mode === 'add' && formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData = { ...formData };
    if (mode === 'edit') {
      delete submitData.password; // Don't send password if empty in edit mode
      delete submitData.role; // Role is updated separately
    }
    if (mode === 'edit' && !formData.password) {
      delete submitData.password;
    }
    onSave(submitData);
  };

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#1f2937',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#6b7280',
      padding: 0,
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#374151'
    },
    input: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      transition: 'all 0.2s ease'
    },
    inputError: {
      borderColor: '#dc2626'
    },
    errorText: {
      fontSize: '12px',
      color: '#dc2626'
    },
    select: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'white',
      cursor: 'pointer'
    },
    actions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '8px'
    },
    button: {
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s ease'
    },
    cancelButton: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    },
    saveButton: {
      backgroundColor: '#3b82f6',
      color: 'white'
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>
            {mode === 'add' ? 'Add New User' : 'Edit User'}
          </h2>
          <button type="button" style={modalStyles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <form style={modalStyles.form} onSubmit={handleSubmit}>
          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                ...modalStyles.input,
                ...(errors.email ? modalStyles.inputError : {})
              }}
              disabled={mode === 'edit'}
            />
            {errors.email && <span style={modalStyles.errorText}>{errors.email}</span>}
          </div>

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              style={modalStyles.input}
            />
          </div>

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={modalStyles.input}
            />
          </div>

          {mode === 'add' && (
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={modalStyles.select}
              >
                <option value="admin">Administrator</option>
                <option value="sales">Sales Manager</option>
                <option value="client">Client</option>
                <option value="engineer">Engineer</option>
              </select>
            </div>
          )}

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>
              {mode === 'add' ? 'Password *' : 'New Password (leave empty to keep current)'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{
                ...modalStyles.input,
                ...(errors.password ? modalStyles.inputError : {})
              }}
            />
            {errors.password && <span style={modalStyles.errorText}>{errors.password}</span>}
          </div>

          <div style={modalStyles.actions}>
            <button
              type="button"
              style={{ ...modalStyles.button, ...modalStyles.cancelButton }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...modalStyles.button, ...modalStyles.saveButton }}
            >
              {mode === 'add' ? 'Create User' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}