'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { apiGet } from '../../../lib/api';
import Link from 'next/link';

export default function SupportsPage() {
  const [supports, setSupports] = useState([]);
  const [filteredSupports, setFilteredSupports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
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

    const fetchSupports = async () => {
      setIsLoading(true);
      try {
        const data = await apiGet('/admin/supports');
        if (data) {
          setSupports(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching supports:', error);
        setSupports([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupports();
  }, [user, authLoading]);

  useEffect(() => {
    filterSupports();
  }, [supports, searchTerm, statusFilter, priorityFilter, dateFilter]);

  const filterSupports = () => {
    let filtered = [...supports];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(support => {
        const data = support.data || {};
        const issueType = (data.issue_type || '').toLowerCase();
        const description = (data.description || '').toLowerCase();
        const priority = (data.priority || '').toLowerCase();
        const email = (data.email || '').toLowerCase();
        
        return (
          issueType.includes(term) ||
          description.includes(term) ||
          priority.includes(term) ||
          email.includes(term) ||
          support.id.toString().includes(term)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(support => support.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(support => {
        const data = support.data || {};
        return data.priority === priorityFilter;
      });
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(support => {
        const createdDate = new Date(support.created_at);
        const diffTime = Math.abs(now - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case 'today':
            return createdDate.toDateString() === now.toDateString();
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }

    // Sort by latest first
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredSupports(filtered);
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

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#dc2626';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // DIPERBAIKI: Fungsi helper untuk membuat warna dengan opacity
  const withOpacity = (color, opacity = 0.1) => {
    // Simple opacity implementation
    return color;
  };

  const getPriorityBadgeStyle = (priority) => {
    const color = getPriorityColor(priority);
    return {
      backgroundColor: color === '#dc2626' ? '#fee2e2' : 
                     color === '#f59e0b' ? '#fef3c7' : 
                     color === '#10b981' ? '#d1fae5' : '#f3f4f6',
      color: color,
      border: `1px solid ${color === '#dc2626' ? '#fecaca' : 
                           color === '#f59e0b' ? '#fde68a' : 
                           color === '#10b981' ? '#a7f3d0' : '#d1d5db'}`
    };
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'responded': return '#8b5cf6';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusBadgeStyle = (status) => {
    const color = getStatusColor(status);
    return {
      backgroundColor: color === '#3b82f6' ? '#dbeafe' : 
                      color === '#f59e0b' ? '#fef3c7' : 
                      color === '#8b5cf6' ? '#ede9fe' : 
                      color === '#10b981' ? '#d1fae5' : '#f3f4f6',
      color: color,
      border: `1px solid ${color === '#3b82f6' ? '#bfdbfe' : 
                            color === '#f59e0b' ? '#fde68a' : 
                            color === '#8b5cf6' ? '#ddd6fe' : 
                            color === '#10b981' ? '#a7f3d0' : '#d1d5db'}`
    };
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'in_progress':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'responded':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'resolved':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'closed':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Calculate stats
  const openTickets = supports.filter(s => s.status === 'open').length;
  const inProgressTickets = supports.filter(s => s.status === 'in_progress').length;
  const resolvedTickets = supports.filter(s => s.status === 'resolved' || s.status === 'closed').length;
  const highPriorityTickets = supports.filter(s => (s.data?.priority || '').toLowerCase() === 'high').length;

  // Inline styles - DIPERBAIKI: menghapus semua konflik background/backgroundColor
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
      transition: 'transform 0.2s ease, boxShadow 0.2s ease',
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
    ticketsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px'
    },
    ticketCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      padding: '24px',
      textDecoration: 'none',
      color: 'inherit',
      display: 'block',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    },
    ticketCardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      borderColor: '#3b82f6'
    },
    ticketHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    ticketId: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#1f2937'
    },
    badgeContainer: {
      display: 'flex',
      gap: '8px'
    },
    badge: {
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    ticketMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px',
      fontSize: '13px',
      color: '#6b7280'
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    ticketContent: {
      marginBottom: '20px'
    },
    ticketField: {
      marginBottom: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    fieldLabel: {
      fontSize: '12px',
      color: '#6b7280',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    fieldValue: {
      fontSize: '14px',
      color: '#1f2937',
      lineHeight: '1.5'
    },
    description: {
      fontSize: '14px',
      color: '#4b5563',
      lineHeight: '1.5',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    ticketFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '20px',
      borderTop: '1px solid #f3f4f6'
    },
    timeAgo: {
      fontSize: '12px',
      color: '#9ca3af',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    viewButton: {
      padding: '6px 16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    viewButtonHover: {
      backgroundColor: '#2563eb',
      transform: 'translateY(-1px)'
    },
    emptyState: {
      textAlign: 'center',
      padding: '80px 20px',
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      gridColumn: '1 / -1'
    },
    emptyIcon: {
      fontSize: '64px',
      marginBottom: '20px',
      opacity: '0.3'
    },
    emptyTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '8px'
    },
    emptyText: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '24px',
      maxWidth: '400px',
      margin: '0 auto 24px'
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
          <p style={{ color: '#6b7280' }}>Loading support tickets...</p>
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
      `}</style>
      
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.title}>
              <span style={{ color: '#3b82f6' }}>Support</span> Tickets
            </h1>
            <p style={styles.subtitle}>Manage and track customer support requests</p>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.stats}>
          <div 
            key="stat-open"
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = styles.statCardHover.transform;
              e.currentTarget.style.boxShadow = styles.statCardHover.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => setStatusFilter('open')}
          >
            <div style={{ 
              ...styles.statIcon, 
              backgroundColor: '#dbeafe' 
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{openTickets}</div>
              <div style={styles.statLabel}>Open Tickets</div>
              {openTickets > 0 && (
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
            key="stat-in-progress"
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = styles.statCardHover.transform;
              e.currentTarget.style.boxShadow = styles.statCardHover.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => setStatusFilter('in_progress')}
          >
            <div style={{ 
              ...styles.statIcon, 
              backgroundColor: '#fef3c7' 
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{inProgressTickets}</div>
              <div style={styles.statLabel}>In Progress</div>
            </div>
          </div>

          <div 
            key="stat-high-priority"
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = styles.statCardHover.transform;
              e.currentTarget.style.boxShadow = styles.statCardHover.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => setPriorityFilter('high')}
          >
            <div style={{ 
              ...styles.statIcon, 
              backgroundColor: '#fee2e2' 
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{highPriorityTickets}</div>
              <div style={styles.statLabel}>High Priority</div>
              {highPriorityTickets > 0 && (
                <div style={{ ...styles.statTrend, color: '#dc2626' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804L12 10.5l6.879 7.304-1.597 1.44L12 13.5l-5.282 4.744-1.597-1.44zM12 2v8" />
                  </svg>
                  Urgent attention needed
                </div>
              )}
            </div>
          </div>

          <div 
            key="stat-resolved"
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = styles.statCardHover.transform;
              e.currentTarget.style.boxShadow = styles.statCardHover.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => setStatusFilter('resolved')}
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
              <div style={styles.statValue}>{resolvedTickets}</div>
              <div style={styles.statLabel}>Resolved</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          <input
            type="text"
            placeholder="Search tickets..."
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
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="responded">Responded</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
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
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
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
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
          
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPriorityFilter('all');
              setDateFilter('all');
            }}
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
            Clear Filters
          </button>
        </div>

        {/* Tickets Grid */}
        {filteredSupports.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🎫</div>
            <h3 style={styles.emptyTitle}>No Support Tickets Found</h3>
            <p style={styles.emptyText}>
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || dateFilter !== 'all'
                ? 'No tickets match your current filters. Try adjusting your search criteria.'
                : 'There are no support tickets at the moment. All clear!'}
            </p>
            {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || dateFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setDateFilter('all');
                }}
                style={{
                  ...styles.refreshButton,
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none'
                }}
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div style={styles.ticketsGrid}>
            {filteredSupports.map((support) => {
              const data = support.data || {};
              const issueType = data.issue_type || 'General Inquiry';
              const description = data.description || 'No description provided';
              const priority = data.priority || 'medium';
              const email = data.email || 'No email provided';
              const statusBadgeStyle = getStatusBadgeStyle(support.status);
              const priorityBadgeStyle = getPriorityBadgeStyle(priority);
              
              return (
                <Link
                  key={support.id}
                  href={`/dashboard/supports/${support.id}`}
                  style={styles.ticketCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = styles.ticketCardHover.transform;
                    e.currentTarget.style.boxShadow = styles.ticketCardHover.boxShadow;
                    e.currentTarget.style.borderColor = styles.ticketCardHover.borderColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = styles.ticketCard.borderColor;
                  }}
                >
                  <div style={styles.ticketHeader}>
                    <div style={styles.ticketId}>Ticket #{support.id}</div>
                    <div style={styles.badgeContainer}>
                      <span style={{ 
                        ...styles.badge,
                        backgroundColor: statusBadgeStyle.backgroundColor,
                        color: statusBadgeStyle.color,
                        border: statusBadgeStyle.border
                      }}>
                        {getStatusIcon(support.status)}
                        {support.status.replace('_', ' ')}
                      </span>
                      <span style={{ 
                        ...styles.badge,
                        backgroundColor: priorityBadgeStyle.backgroundColor,
                        color: priorityBadgeStyle.color,
                        border: priorityBadgeStyle.border
                      }}>
                        {priority} Priority
                      </span>
                    </div>
                  </div>

                  <div style={styles.ticketMeta}>
                    <div style={styles.metaItem}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {email}
                    </div>
                    <div style={styles.metaItem}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(support.created_at)}
                    </div>
                  </div>

                  <div style={styles.ticketContent}>
                    <div style={styles.ticketField}>
                      <div style={styles.fieldLabel}>Issue Type</div>
                      <div style={styles.fieldValue}>{issueType}</div>
                    </div>
                    
                    <div style={styles.ticketField}>
                      <div style={styles.fieldLabel}>Description</div>
                      <div style={styles.description} title={description}>
                        {description}
                      </div>
                    </div>
                  </div>

                  <div style={styles.ticketFooter}>
                    <div style={styles.timeAgo}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatRelativeTime(support.created_at)}
                    </div>
                    <div 
                      style={styles.viewButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = styles.viewButtonHover.backgroundColor;
                        e.currentTarget.style.transform = styles.viewButtonHover.transform;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = styles.viewButton.backgroundColor;
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      View Details
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}