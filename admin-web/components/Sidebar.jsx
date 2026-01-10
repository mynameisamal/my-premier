'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { apiGet } from '../lib/api';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const hasFetched = useRef(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }

    if (hasFetched.current) {
      setIsLoading(false);
      return;
    }

    hasFetched.current = true;

    const fetchUserRole = async () => {
      try {
        const data = await apiGet('/admin/me');
        if (data) {
          setUserRole(data.role || null);
          setUserEmail(data.email || '');
          setUserName(data.name || data.email?.split('@')[0] || 'Admin');
        } else {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('userEmail');
          }
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching admin info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [router]);

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
      }
      router.push('/login');
    } catch (error) {
      alert('Failed to logout');
    }
  };

  // Menu items configuration with icons
  const allNavItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      path: '/dashboard/categories', 
      label: 'Categories',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      roles: ['admin']
    },
    { 
      path: '/dashboard/products', 
      label: 'Products',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      roles: ['admin']
    },
    { 
      path: '/dashboard/requests', 
      label: 'Requests',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      path: '/dashboard/supports', 
      label: 'Support',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      path: '/dashboard/promos', 
      label: 'Promos',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 5h18v4H3zM5 9v10h14V9" />
          <path d="M9 13h6" />
        </svg>
      ),
      roles: ['admin']
    },
    { 
      path: '/dashboard/engineer-reports', 
      label: 'Engineer Reports',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 4h18v4H3z" />
          <path d="M3 10h18v4H3z" />
          <path d="M3 16h18v4H3z" />
        </svg>
      ),
      roles: ['admin']
    },
    { 
      path: '/dashboard/users', 
      label: 'Users',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 0a6 6 0 00-9-5.197" />
        </svg>
      ),
      roles: ['admin']
    },
  ];

  // Filter nav items based on role
  const getVisibleNavItems = () => {
    if (!userRole) return [];
    
    if (userRole === 'admin') {
      return allNavItems;
    } else if (userRole === 'sales') {
      return allNavItems.filter(item => 
        !item.roles || item.roles.includes('sales')
      );
    }
    return allNavItems;
  };

  const navItems = getVisibleNavItems();

  // Inline styles dengan ukuran lebih compact
  const styles = {
    sidebar: {
      width: '240px',
      height: '100vh',
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 50,
      boxShadow: '4px 0 20px rgba(0, 0, 0, 0.2)',
      overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    sidebarHeader: {
      padding: '24px 16px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px'
    },
    logoIcon: {
      width: '36px',
      height: '36px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '16px',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
    },
    sidebarTitle: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#ffffff',
      margin: '0 0 4px 0',
      lineHeight: '1.2'
    },
    sidebarSubtitle: {
      fontSize: '11px',
      color: '#94a3b8',
      margin: '0',
      fontWeight: '500',
      letterSpacing: '0.5px'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 16px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '10px',
      margin: '0 16px 20px 16px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    userAvatar: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '600',
      fontSize: '14px',
      flexShrink: 0
    },
    userDetails: {
      flex: 1,
      minWidth: 0,
      overflow: 'hidden'
    },
    userName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#ffffff',
      margin: '0',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    userRole: {
      fontSize: '12px',
      color: '#94a3b8',
      margin: '4px 0 0 0',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    nav: {
      flex: 1,
      overflowY: 'auto',
      padding: '0 16px'
    },
    navList: {
      listStyle: 'none',
      padding: '0',
      margin: '0',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    navItem: {
      margin: '0'
    },
    navIcon: {
      width: '18px',
      height: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    loadingContainer: {
      padding: '30px 16px',
      textAlign: 'center'
    },
    spinner: {
      width: '24px',
      height: '24px',
      border: '3px solid rgba(255, 255, 255, 0.1)',
      borderTopColor: '#3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 12px auto'
    },
    loadingText: {
      color: '#94a3b8',
      fontSize: '13px'
    },
    sidebarFooter: {
      padding: '20px 16px',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      marginTop: 'auto'
    },
    logoutButton: {
      width: '100%',
      padding: '12px 16px',
      background: 'rgba(239, 68, 68, 0.1)',
      color: '#fca5a5',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s ease'
    },
    logoutButtonHover: {
      background: 'rgba(239, 68, 68, 0.2)',
      color: '#fecaca',
      transform: 'translateY(-1px)'
    },
    companyInfo: {
      padding: '16px',
      textAlign: 'center',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      marginTop: '16px'
    },
    companyName: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#94a3b8',
      margin: '0 0 4px 0'
    },
    companySubtitle: {
      fontSize: '10px',
      color: '#64748b',
      margin: '0',
      opacity: '0.8'
    },
    divider: {
      height: '1px',
      background: 'rgba(255, 255, 255, 0.08)',
      margin: '12px 16px'
    },
    sectionTitle: {
      fontSize: '11px',
      fontWeight: '600',
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      margin: '0 0 8px 16px',
      paddingTop: '12px'
    }
  };

  // Base style untuk nav link (tidak aktif)
  const navLinkBaseStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    textDecoration: 'none',
    color: '#cbd5e1',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    background: 'transparent',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
  };

  // Style untuk nav link aktif
  const navLinkActiveStyle = {
    ...navLinkBaseStyle,
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(29, 78, 216, 0.2) 100%)',
    color: '#ffffff',
    fontWeight: '600',
    // Gunakan border-left secara eksplisit tanpa properti border umum
    borderLeft: '3px solid #3b82f6',
    borderTop: 'none',
    borderRight: 'none',
    borderBottom: 'none'
  };

  return (
    <>
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        main {
          margin-left: 240px !important;
          width: calc(100% - 240px) !important;
          transition: margin-left 0.3s ease;
        }
        
        @media (max-width: 768px) {
          main {
            margin-left: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
      
      <aside style={styles.sidebar}>
        {/* Header dengan Logo */}
        <div style={styles.sidebarHeader}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={styles.sidebarTitle}>Premier Engineering</h2>
              <p style={styles.sidebarSubtitle}>Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Title */}
        <div style={styles.sectionTitle}>MENU</div>

        {/* Navigation */}
        <nav style={styles.nav}>
          {isLoading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Loading...</p>
            </div>
          ) : (
            <ul style={styles.navList}>
              {navItems.map((item) => {
                const isActive = pathname === item.path || 
                               (item.path !== '/dashboard' && pathname?.startsWith(item.path));
                
                return (
                  <li key={item.path} style={styles.navItem}>
                    <Link
                      href={item.path}
                      style={isActive ? navLinkActiveStyle : navLinkBaseStyle}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.color = '#ffffff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#cbd5e1';
                        }
                      }}
                    >
                      <span style={styles.navIcon}>{item.icon}</span>
                      <span style={{ 
                        flex: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>

        {/* Company Info */}
        <div style={styles.companyInfo}>
          <p style={styles.companyName}>PT Premier Engineering</p>
          <p style={styles.companySubtitle}>© {new Date().getFullYear()} • v2.0</p>
        </div>

        {/* Footer dengan Logout Button */}
        <div style={styles.sidebarFooter}>
          <button
            type="button"
            onClick={handleLogout}
            style={styles.logoutButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.color = '#fecaca';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = '#fca5a5';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}