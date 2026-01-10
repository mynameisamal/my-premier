'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { apiGet } from '../../../lib/api';

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateSort, setDateSort] = useState('newest');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
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

    fetchRequests();
  }, [user, authLoading]);

  useEffect(() => {
    filterAndSortRequests();
  }, [requests, searchTerm, statusFilter, dateSort]);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await apiGet('/admin/requests');
      if (data) {
        setRequests(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
      setError('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortRequests = () => {
    let filtered = [...requests];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(request => {
        const data = request.data || {};
        return (
          (data.name || '').toLowerCase().includes(term) ||
          (data.company || '').toLowerCase().includes(term) ||
          (data.email || '').toLowerCase().includes(term) ||
          (data.phone || '').toLowerCase().includes(term) ||
          (data.message || '').toLowerCase().includes(term)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => {
        const isRead = request.is_read || false;
        return statusFilter === 'read' ? isRead : !isRead;
      });
    }

    // Apply date sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredRequests(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return 'N/A';
    }
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) {
        return `${diffMins} min ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffDays < 7) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else {
        return formatDate(dateString);
      }
    } catch {
      return '';
    }
  };

  const getFieldValue = (request, fieldName) => {
    if (!request.data || typeof request.data !== 'object') {
      return '—';
    }
    return request.data[fieldName] || '—';
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
    
    // Mark as read if not already read
    if (!request.is_read) {
      // You would typically make an API call here to mark as read
      // For now, we'll just update the local state
      setRequests(prev => prev.map(req => 
        req.id === request.id ? { ...req, is_read: true } : req
      ));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  // Inline styles
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
    requestsGrid: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    requestCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    requestCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
    },
    requestCardUnread: {
      borderLeft: '4px solid #3b82f6',
      backgroundColor: '#f8fafc'
    },
    requestHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 24px',
      borderBottom: '1px solid #f3f4f6'
    },
    requestTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    requestAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#3b82f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '600',
      fontSize: '16px',
      flexShrink: 0
    },
    requestInfo: {
      flex: 1,
      minWidth: 0
    },
    requestName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1f2937',
      margin: '0 0 4px 0'
    },
    requestMeta: {
      fontSize: '13px',
      color: '#6b7280',
      margin: '0',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    requestStatus: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    statusBadge: {
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    statusRead: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    },
    statusUnread: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    requestTime: {
      fontSize: '12px',
      color: '#9ca3af',
      marginLeft: 'auto',
      whiteSpace: 'nowrap'
    },
    requestContent: {
      padding: '20px 24px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px'
    },
    detailItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    detailLabel: {
      fontSize: '11px',
      color: '#6b7280',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    detailValue: {
      fontSize: '14px',
      color: '#1f2937',
      fontWeight: '500'
    },
    messagePreview: {
      fontSize: '14px',
      color: '#4b5563',
      lineHeight: '1.5',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    viewButton: {
      padding: '8px 16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    viewButtonHover: {
      backgroundColor: '#2563eb',
      transform: 'translateY(-1px)'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #e5e7eb'
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
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
      padding: '20px'
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '20px',
      width: '100%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '24px 28px',
      borderBottom: '1px solid #e5e7eb'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1f2937',
      margin: '0',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '28px',
      color: '#9ca3af',
      cursor: 'pointer',
      padding: '0',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      transition: 'all 0.2s ease'
    },
    closeButtonHover: {
      backgroundColor: '#f3f4f6',
      color: '#6b7280'
    },
    modalContent: {
      padding: '28px'
    },
    modalSection: {
      marginBottom: '24px'
    },
    modalSectionTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    detailGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      backgroundColor: '#f9fafb',
      padding: '20px',
      borderRadius: '12px'
    },
    modalDetailItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    modalDetailLabel: {
      fontSize: '12px',
      color: '#6b7280',
      fontWeight: '500'
    },
    modalDetailValue: {
      fontSize: '14px',
      color: '#1f2937',
      fontWeight: '500'
    },
    messageContent: {
      backgroundColor: '#f9fafb',
      padding: '20px',
      borderRadius: '12px',
      marginTop: '12px'
    },
    messageText: {
      fontSize: '14px',
      color: '#4b5563',
      lineHeight: '1.6',
      whiteSpace: 'pre-wrap'
    },
    modalFooter: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '32px',
      paddingTop: '24px',
      borderTop: '1px solid #e5e7eb'
    },
    modalButton: {
      padding: '10px 20px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s ease'
    },
    closeModalButton: {
      backgroundColor: '#f3f4f6',
      color: '#4b5563'
    },
    closeModalButtonHover: {
      backgroundColor: '#e5e7eb',
      transform: 'translateY(-1px)'
    },
    contactButton: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    contactButtonHover: {
      backgroundColor: '#2563eb',
      transform: 'translateY(-1px)'
    },
    errorMessage: {
      backgroundColor: '#fee2e2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '12px 16px',
      borderRadius: '12px',
      marginBottom: '20px',
      fontSize: '14px'
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
          <p style={{ color: '#6b7280' }}>Loading requests...</p>
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

  // Calculate stats
  const totalRequests = requests.length;
  const readRequests = requests.filter(r => r.is_read).length;
  const unreadRequests = totalRequests - readRequests;
  const todayRequests = requests.filter(r => {
    const today = new Date().toDateString();
    const requestDate = new Date(r.created_at).toDateString();
    return today === requestDate;
  }).length;

  return (
    <>
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      `}</style>
      
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.title}>
              <span style={{ color: '#3b82f6' }}>Customer</span> Requests
            </h1>
            <p style={styles.subtitle}>Manage and review customer inquiries</p>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.stats}>
          <div 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = styles.statCardHover.transform;
              e.currentTarget.style.boxShadow = styles.statCardHover.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => setStatusFilter('all')}
          >
            <div style={{ ...styles.statIcon, backgroundColor: '#dbeafe' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{totalRequests}</div>
              <div style={styles.statLabel}>Total Requests</div>
            </div>
          </div>

          <div 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = styles.statCardHover.transform;
              e.currentTarget.style.boxShadow = styles.statCardHover.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => setStatusFilter('unread')}
          >
            <div style={{ ...styles.statIcon, backgroundColor: '#fef3c7' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{unreadRequests}</div>
              <div style={styles.statLabel}>Unread Requests</div>
              {unreadRequests > 0 && (
                <div style={{ ...styles.statTrend, color: '#dc2626' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Requires attention
                </div>
              )}
            </div>
          </div>

          <div 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = styles.statCardHover.transform;
              e.currentTarget.style.boxShadow = styles.statCardHover.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => setStatusFilter('read')}
          >
            <div style={{ ...styles.statIcon, backgroundColor: '#d1fae5' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{readRequests}</div>
              <div style={styles.statLabel}>Read Requests</div>
            </div>
          </div>

          <div 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = styles.statCardHover.transform;
              e.currentTarget.style.boxShadow = styles.statCardHover.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ ...styles.statIcon, backgroundColor: '#e0e7ff' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{todayRequests}</div>
              <div style={styles.statLabel}>Today's Requests</div>
              {todayRequests > 0 && (
                <div style={{ ...styles.statTrend, color: '#059669' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Active today
                </div>
              )}
            </div>
          </div>
        </div>

        {error && <div style={styles.errorMessage}>{error}</div>}

        {/* Controls */}
        <div style={styles.controls}>
          <input
            type="text"
            placeholder="Search requests..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            <option value="all">All Status</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
          
          <select
            value={dateSort}
            onChange={(e) => setDateSort(e.target.value)}
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
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          
          <button
            type="button"
            onClick={fetchRequests}
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

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <p style={styles.emptyText}>
              {searchTerm || statusFilter !== 'all'
                ? 'No requests match your filters'
                : 'No customer requests found'}
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
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
          <div style={styles.requestsGrid}>
            {filteredRequests.map((request) => {
              const data = request.data || {};
              const name = data.name || 'Anonymous';
              const company = data.company || '—';
              const email = data.email || '—';
              const phone = data.phone || '—';
              const message = data.message || '—';
              const isRead = request.is_read || false;
              
              return (
                <div 
                  key={request.id} 
                  style={{
                    ...styles.requestCard,
                    ...(!isRead && styles.requestCardUnread)
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = styles.requestCardHover.transform;
                    e.currentTarget.style.boxShadow = styles.requestCardHover.boxShadow;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onClick={() => handleViewDetails(request)}
                >
                  <div style={styles.requestHeader}>
                    <div style={styles.requestTitle}>
                      <div style={styles.requestAvatar}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div style={styles.requestInfo}>
                        <h3 style={styles.requestName}>{name}</h3>
                        <div style={styles.requestMeta}>
                          <span>{company}</span>
                          <span>•</span>
                          <span>{email}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={styles.requestStatus}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(isRead ? styles.statusRead : styles.statusUnread)
                      }}>
                        {isRead ? 'Read' : 'New'}
                      </span>
                      <span style={styles.requestTime}>
                        {formatRelativeTime(request.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  <div style={styles.requestContent}>
                    <div style={styles.detailItem}>
                      <div style={styles.detailLabel}>Email</div>
                      <div style={styles.detailValue}>{email}</div>
                    </div>
                    
                    <div style={styles.detailItem}>
                      <div style={styles.detailLabel}>Phone</div>
                      <div style={styles.detailValue}>{phone}</div>
                    </div>
                    
                    <div style={{ ...styles.detailItem, gridColumn: '1 / -1' }}>
                      <div style={styles.detailLabel}>Message</div>
                      <div style={styles.messagePreview}>{message}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Request Details Modal */}
        {isModalOpen && selectedRequest && (
          <div style={styles.modalOverlay} onClick={handleCloseModal}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Request Details
                </h2>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={styles.closeButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = styles.closeButtonHover.backgroundColor;
                    e.currentTarget.style.color = styles.closeButtonHover.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = styles.closeButton.color;
                  }}
                >
                  ×
                </button>
              </div>

              <div style={styles.modalContent}>
                <div style={styles.modalSection}>
                  <h3 style={styles.modalSectionTitle}>Customer Information</h3>
                  <div style={styles.detailGrid}>
                    <div style={styles.modalDetailItem}>
                      <div style={styles.modalDetailLabel}>Full Name</div>
                      <div style={styles.modalDetailValue}>
                        {getFieldValue(selectedRequest, 'name')}
                      </div>
                    </div>
                    
                    <div style={styles.modalDetailItem}>
                      <div style={styles.modalDetailLabel}>Company</div>
                      <div style={styles.modalDetailValue}>
                        {getFieldValue(selectedRequest, 'company')}
                      </div>
                    </div>
                    
                    <div style={styles.modalDetailItem}>
                      <div style={styles.modalDetailLabel}>Email</div>
                      <div style={styles.modalDetailValue}>
                        {getFieldValue(selectedRequest, 'email')}
                      </div>
                    </div>
                    
                    <div style={styles.modalDetailItem}>
                      <div style={styles.modalDetailLabel}>Phone</div>
                      <div style={styles.modalDetailValue}>
                        {getFieldValue(selectedRequest, 'phone')}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={styles.modalSection}>
                  <h3 style={styles.modalSectionTitle}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Message
                  </h3>
                  <div style={styles.messageContent}>
                    <div style={styles.messageText}>
                      {getFieldValue(selectedRequest, 'message')}
                    </div>
                  </div>
                </div>

                <div style={styles.modalSection}>
                  <h3 style={styles.modalSectionTitle}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Request Information
                  </h3>
                  <div style={styles.detailGrid}>
                    <div style={styles.modalDetailItem}>
                      <div style={styles.modalDetailLabel}>Request ID</div>
                      <div style={styles.modalDetailValue}>#{selectedRequest.id}</div>
                    </div>
                    
                    <div style={styles.modalDetailItem}>
                      <div style={styles.modalDetailLabel}>Status</div>
                      <div style={{
                        ...styles.statusBadge,
                        ...((selectedRequest.is_read ? styles.statusRead : styles.statusUnread)),
                        display: 'inline-block'
                      }}>
                        {selectedRequest.is_read ? 'Read' : 'New'}
                      </div>
                    </div>
                    
                    <div style={styles.modalDetailItem}>
                      <div style={styles.modalDetailLabel}>Submitted</div>
                      <div style={styles.modalDetailValue}>
                        {formatDate(selectedRequest.created_at)}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={styles.modalFooter}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={styles.modalButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = styles.closeModalButtonHover.backgroundColor;
                      e.currentTarget.style.transform = styles.closeModalButtonHover.transform;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = styles.closeModalButton.backgroundColor;
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const email = getFieldValue(selectedRequest, 'email');
                      window.location.href = `mailto:${email}`;
                    }}
                    style={{
                      ...styles.modalButton,
                      ...styles.contactButton
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = styles.contactButtonHover.backgroundColor;
                      e.currentTarget.style.transform = styles.contactButtonHover.transform;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = styles.contactButton.backgroundColor;
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Reply via Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}