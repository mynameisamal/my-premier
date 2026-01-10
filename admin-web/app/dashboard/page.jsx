'use client';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { apiGet, apiPatch } from '../../lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_products: 0,
    total_categories: 0,
    total_requests: 0,
    support_open: 0,
    support_closed: 0,
  });
  const [requests, setRequests] = useState([]);
  const [supports, setSupports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [statsError, setStatsError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
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

    const fetchData = async () => {
      setIsLoading(true);

      try {
        try {
          const statsData = await apiGet('/admin/stats/summary');
          if (statsData) {
            setStats({
              total_products: statsData.total_products || 0,
              total_categories: statsData.total_categories || 0,
              total_requests: statsData.total_requests || 0,
              support_open: statsData.support_open || 0,
              support_closed: statsData.support_closed || 0,
            });
            setStatsError('');
          }
        } catch (error) {
          setStatsError('Failed to load statistics');
          setStats({
            total_products: 0,
            total_categories: 0,
            total_requests: 0,
            support_open: 0,
            support_closed: 0,
          });
        }

        try {
          const requestsData = await apiGet('/admin/requests');
          if (requestsData) {
            setRequests(Array.isArray(requestsData) ? requestsData : []);
          }
        } catch (error) {
          console.error('Error fetching requests:', error);
          setRequests([]);
        }

        try {
          const supportsData = await apiGet('/admin/supports');
          if (supportsData) {
            setSupports(Array.isArray(supportsData) ? supportsData : []);
          }
        } catch (error) {
          console.error('Error fetching supports:', error);
          setSupports([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setStatsError('Failed to load statistics');
        setStats({
          total_products: 0,
          total_categories: 0,
          total_requests: 0,
          support_open: 0,
          support_closed: 0,
        });
        setRequests([]);
        setSupports([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading]);

  const handleStatusUpdate = async (supportId, newStatus) => {
    setUpdatingStatus({ ...updatingStatus, [supportId]: true });

    try {
      const result = await apiPatch(`/admin/support/${supportId}`, { status: newStatus });
      
      if (result) {
        setSupports(prevSupports =>
          Array.isArray(prevSupports)
            ? prevSupports.map(support =>
                support.id === supportId ? { ...support, status: newStatus } : support
              )
            : []
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [supportId]: false }));
    }
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

  // Inline Styles - DIPERBAIKI: menghapus shorthand 'background'
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: '20px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '1px solid #e5e7eb'
    },
    headerLeft: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    welcomeText: {
      fontSize: '14px',
      color: '#6b7280',
      margin: '0'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1f2937',
      margin: '0',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: 'white',
      padding: '10px 16px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    userInitial: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '600',
      fontSize: '14px'
    },
    userName: {
      fontWeight: '600',
      color: '#1f2937'
    },
    userRole: {
      fontSize: '12px',
      color: '#6b7280'
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '30px',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '16px'
    },
    // DIPERBAIKI: Menghapus penggunaan shorthand 'background'
    tab: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      color: '#6b7280'
    },
    activeTab: {
      backgroundColor: '#3b82f6',
      color: 'white'
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
    cardsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e5e7eb',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer'
    },
    cardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    cardTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#6b7280',
      margin: '0',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    cardIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    cardValue: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#1f2937',
      margin: '0',
      lineHeight: '1'
    },
    cardSubtitle: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    section: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '30px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e5e7eb'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      margin: '0 0 20px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
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
      padding: '12px 16px',
      textAlign: 'left',
      fontSize: '12px',
      fontWeight: '600',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    tableRow: {
      borderBottom: '1px solid #f3f4f6',
      transition: 'background-color 0.2s ease'
    },
    tableRowHover: {
      backgroundColor: '#f9fafb'
    },
    tableCell: {
      padding: '16px',
      fontSize: '14px',
      color: '#1f2937'
    },
    status: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    statusOpen: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    statusResponded: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    statusClosed: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    },
    select: {
      padding: '6px 12px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      fontSize: '14px',
      cursor: 'pointer',
      minWidth: '120px',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
    },
    selectHover: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    },
    updating: {
      fontSize: '12px',
      color: '#6b7280',
      marginLeft: '8px'
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      gap: '16px',
      backgroundColor: '#f8fafc'
    },
    spinner: {
      width: '48px',
      height: '48px',
      border: '4px solid #e5e7eb',
      borderTopColor: '#3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    requestList: {
      listStyle: 'none',
      padding: '0',
      margin: '0',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    requestItem: {
      backgroundColor: '#f9fafb',
      padding: '16px',
      borderRadius: '12px',
      borderLeft: '4px solid #3b82f6'
    },
    requestName: {
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '4px'
    },
    requestEmail: {
      fontSize: '14px',
      color: '#6b7280'
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#6b7280'
    },
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '16px',
      opacity: '0.5'
    }
  };

  if (authLoading || isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={{ color: '#6b7280' }}>Memuat dashboard...</p>
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

  // Card colors and icons
  const cardConfig = [
    { key: 'total_products', title: 'Total Produk', color: '#3b82f6', bgColor: '#dbeafe', icon: '📦' },
    { key: 'total_categories', title: 'Total Kategori', color: '#10b981', bgColor: '#d1fae5', icon: '📑' },
    { key: 'total_requests', title: 'Total Permintaan', color: '#f59e0b', bgColor: '#fef3c7', icon: '📋' },
    { key: 'support_open', title: 'Support Terbuka', color: '#ef4444', bgColor: '#fee2e2', icon: '🆘' },
    { key: 'support_closed', title: 'Support Tertutup', color: '#8b5cf6', bgColor: '#ede9fe', icon: '✅' }
  ];

  return (
    <>
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        body {
          margin: 0;
          background-color: #f8fafc;
        }
        * {
          box-sizing: border-box;
        }
        button {
          font-family: inherit;
        }
      `}</style>
      
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <p style={styles.welcomeText}>Selamat datang di</p>
            <h1 style={styles.title}>
              <span style={{ color: '#3b82f6' }}>Dashboard</span> Admin
            </h1>
          </div>
          
          <div style={styles.userInfo}>
            <div style={styles.userInitial}>
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <div style={styles.userName}>{user?.email || 'Admin'}</div>
              <div style={styles.userRole}>Administrator</div>
            </div>
          </div>
        </div>

        {/* Tabs - DIPERBAIKI: Tidak ada konflik background/backgroundColor */}
        <div style={styles.tabs}>
          {['overview', 'requests', 'support'].map(tab => (
            <button
              key={tab}
              style={{
                ...styles.tab,
                ...(activeTab === tab ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'requests' && 'Permintaan'}
              {tab === 'support' && 'Support'}
            </button>
          ))}
        </div>

        {statsError && <div style={styles.errorMessage}>{statsError}</div>}

        {/* Stats Cards */}
        {activeTab === 'overview' && (
          <div style={styles.cardsGrid}>
            {cardConfig.map(({ key, title, color, bgColor, icon }) => (
              <div
                key={key}
                style={styles.card}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = styles.cardHover.transform;
                  e.currentTarget.style.boxShadow = styles.cardHover.boxShadow;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = styles.card.boxShadow;
                }}
              >
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{title}</h3>
                  <div style={{ 
                    ...styles.cardIcon, 
                    backgroundColor: bgColor, 
                    color: color
                  }}>
                    {icon}
                  </div>
                </div>
                <p style={styles.cardValue}>{stats[key]}</p>
                <div style={styles.cardSubtitle}>
                  <span>Total</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Requests Section */}
        {activeTab === 'requests' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>📋 Permintaan Informasi</h2>
            {Array.isArray(requests) && requests.length > 0 ? (
              <ul style={styles.requestList}>
                {requests.slice(0, 10).map(r => (
                  <li key={r.id} style={styles.requestItem}>
                    <div style={styles.requestName}>{r.name || 'No Name'}</div>
                    <div style={styles.requestEmail}>{r.email || 'No Email'}</div>
                    {r.message && (
                      <div style={{ fontSize: '14px', color: '#4b5563', marginTop: '8px' }}>
                        {r.message.length > 100 ? `${r.message.substring(0, 100)}...` : r.message}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📭</div>
                <p>Tidak ada permintaan informasi</p>
              </div>
            )}
          </div>
        )}

        {/* Support Section */}
        {activeTab === 'support' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>🆘 Support Requests</h2>
            {Array.isArray(supports) && supports.length > 0 ? (
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell}>ID</th>
                    <th style={styles.tableHeaderCell}>Status</th>
                    <th style={styles.tableHeaderCell}>Tanggal Dibuat</th>
                    <th style={styles.tableHeaderCell}>Data</th>
                    <th style={styles.tableHeaderCell}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {supports.map(support => {
                    const statusStyle = support.status === 'open' ? styles.statusOpen :
                                      support.status === 'responded' ? styles.statusResponded : styles.statusClosed;
                    
                    return (
                      <tr 
                        key={support.id} 
                        style={styles.tableRow}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = styles.tableRowHover.backgroundColor;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <td style={styles.tableCell}>
                          <span style={{ fontWeight: '600', color: '#3b82f6' }}>#{support.id}</span>
                        </td>
                        <td style={styles.tableCell}>
                          <span style={{ ...styles.status, ...statusStyle }}>
                            {support.status}
                          </span>
                        </td>
                        <td style={styles.tableCell}>{formatDate(support.created_at)}</td>
                        <td style={styles.tableCell}>
                          <div style={{
                            backgroundColor: '#f9fafb',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            maxHeight: '80px',
                            overflow: 'auto',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {support.data ? JSON.stringify(support.data, null, 2).substring(0, 100) + '...' : 'N/A'}
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <select
                            value={support.status}
                            onChange={(e) => handleStatusUpdate(support.id, e.target.value)}
                            disabled={updatingStatus[support.id]}
                            style={styles.select}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = styles.selectHover.borderColor;
                              e.currentTarget.style.boxShadow = styles.selectHover.boxShadow;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#d1d5db';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <option value="open">Open</option>
                            <option value="responded">Responded</option>
                            <option value="closed">Closed</option>
                          </select>
                          {updatingStatus[support.id] && (
                            <span style={styles.updating}>Updating...</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>✅</div>
                <p>Tidak ada support requests</p>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb',
          color: '#6b7280',
          fontSize: '12px'
        }}>
          <div>
            © {new Date().getFullYear()} PT Premier Engineering Indonesia • Sistem Manajemen Internal v1.0
          </div>
          <div>
            Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID')}
          </div>
        </div>
      </div>
    </>
  );
}