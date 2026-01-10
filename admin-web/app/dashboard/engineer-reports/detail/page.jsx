'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiGet } from '../../../../lib/api';

function EngineerReportsDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEngineer = searchParams?.get('engineer') || null;

  const [summary, setSummary] = useState({
    reports: [],
    stats: [],
    period_start: null,
    period_end: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEngineer, setSelectedEngineer] = useState(initialEngineer);
  
  // Month filter
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  useEffect(() => {
    if (initialEngineer) {
      setSelectedEngineer(initialEngineer);
    }
  }, [initialEngineer]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const endpoint = selectedMonth 
          ? `/admin/engineer-reports/summary?month=${selectedMonth}`
          : '/admin/engineer-reports/summary';
        const data = await apiGet(endpoint);
        if (data) {
          setSummary({
            reports: Array.isArray(data.reports) ? data.reports : [],
            stats: Array.isArray(data.stats) ? data.stats : [],
            period_start: data.period_start || null,
            period_end: data.period_end || null,
          });
        } else {
          setError('Gagal memuat data laporan engineer');
          setSummary({ reports: [], stats: [], period_start: null, period_end: null });
        }
      } catch (err) {
        console.error('Error fetching engineer reports summary:', err);
        setError('Terjadi kesalahan saat memuat data laporan engineer');
        setSummary({ reports: [], stats: [], period_start: null, period_end: null });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  // Inline Styles
  const styles = {
    container: {
      minHeight: '100vh',
      padding: '24px',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '14px',
      lineHeight: '1.5',
    },
    header: {
      marginBottom: '32px',
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 600,
      color: '#1f2937',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#6b7280',
      margin: 0,
    },
    backButton: {
      padding: '8px 16px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      color: '#374151',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s',
    },
    errorCard: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px',
      color: '#dc2626',
      fontSize: '14px',
    },
    monthFilterCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    monthFilterLabel: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#374151',
      marginBottom: '12px',
      display: 'block',
    },
    monthSelect: {
      padding: '10px 16px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      fontSize: '14px',
      color: '#111827',
      minWidth: '200px',
      cursor: 'pointer',
      outline: 'none',
      transition: 'all 0.2s',
    },
    periodInfo: {
      fontSize: '13px',
      color: '#6b7280',
      marginTop: '12px',
      padding: '8px 12px',
      backgroundColor: '#f9fafb',
      borderRadius: '6px',
      border: '1px solid #e5e7eb',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '16px',
      marginBottom: '24px',
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    },
    statCardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px',
    },
    statLabel: {
      fontSize: '12px',
      fontWeight: 600,
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    statValue: {
      fontSize: '28px',
      fontWeight: 700,
      color: '#111827',
      margin: '8px 0',
    },
    statIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
    },
    filtersCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    filterRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      marginBottom: '16px',
    },
    filterGroup: {
      flex: '1',
      minWidth: '250px',
    },
    filterLabel: {
      fontSize: '13px',
      fontWeight: 600,
      color: '#374151',
      marginBottom: '8px',
      display: 'block',
    },
    input: {
      width: '100%',
      padding: '10px 16px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      fontSize: '14px',
      color: '#111827',
      outline: 'none',
      transition: 'all 0.2s',
    },
    select: {
      width: '100%',
      padding: '10px 16px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      fontSize: '14px',
      color: '#111827',
      cursor: 'pointer',
      outline: 'none',
      transition: 'all 0.2s',
    },
    clearButton: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      backgroundColor: '#f9fafb',
      color: '#374151',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s',
      alignSelf: 'flex-end',
    },
    activeFiltersBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      fontSize: '12px',
      fontWeight: 600,
      padding: '4px 10px',
      borderRadius: '999px',
      marginRight: '8px',
    },
    tableCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    tableHeader: {
      padding: '20px',
      borderBottom: '1px solid #e5e7eb',
    },
    tableTitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#111827',
      margin: 0,
      marginBottom: '4px',
    },
    tableSubtitle: {
      fontSize: '13px',
      color: '#6b7280',
      margin: 0,
    },
    tableWrapper: {
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '14px',
    },
    th: {
      textAlign: 'left',
      padding: '12px 20px',
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb',
      fontSize: '12px',
      fontWeight: 600,
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      whiteSpace: 'nowrap',
    },
    td: {
      padding: '16px 20px',
      borderBottom: '1px solid #f3f4f6',
      color: '#374151',
    },
    engineerCell: {
      fontWeight: 600,
      color: '#2563eb',
      cursor: 'pointer',
      padding: '6px 12px',
      borderRadius: '6px',
      transition: 'all 0.2s',
      display: 'inline-block',
    },
    engineerEmail: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '2px',
    },
    titleCell: {
      fontWeight: 500,
      color: '#111827',
    },
    descriptionPreview: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '4px',
      lineHeight: '1.4',
      maxWidth: '300px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    detailButton: {
      padding: '6px 16px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: '#3b82f6',
      color: 'white',
      fontSize: '13px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    emptyState: {
      padding: '60px 20px',
      textAlign: 'center',
      color: '#6b7280',
    },
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '16px',
      opacity: 0.5,
    },
    loading: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      color: '#6b7280',
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '3px solid #e5e7eb',
      borderTopColor: '#3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '16px',
    },
    
    // Modal Styles
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(4px)',
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '16px',
      maxWidth: '700px',
      width: '100%',
      maxHeight: '85vh',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      animation: 'modalSlideIn 0.3s ease-out',
    },
    modalHeader: {
      padding: '24px',
      borderBottom: '1px solid #f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#f8fafc',
    },
    modalTitleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    modalIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      backgroundColor: '#3b82f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '18px',
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: 600,
      color: '#0f172a',
      margin: 0,
    },
    modalSubtitle: {
      fontSize: '14px',
      color: '#64748b',
      marginTop: '4px',
    },
    closeButton: {
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: 'white',
      color: '#64748b',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      transition: 'all 0.2s',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    modalContent: {
      padding: '24px',
      overflowY: 'auto',
      maxHeight: 'calc(85vh - 200px)',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
      marginBottom: '24px',
    },
    infoCard: {
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e2e8f0',
    },
    infoCardTitle: {
      fontSize: '12px',
      fontWeight: 600,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    infoCardValue: {
      fontSize: '16px',
      fontWeight: 500,
      color: '#0f172a',
      lineHeight: '1.5',
    },
    infoCardEmail: {
      fontSize: '13px',
      color: '#64748b',
      marginTop: '4px',
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#334155',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    contentCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e2e8f0',
      marginBottom: '20px',
      overflow: 'visible',
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      width: '100%',
      boxSizing: 'border-box',
    },
    contentCardLarge: {
      minHeight: '120px',
      maxHeight: 'none',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      lineHeight: '1.7',
      color: '#334155',
      overflow: 'visible',
    },
    noteCard: {
      backgroundColor: '#fffbeb',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #fcd34d',
      marginTop: '8px',
    },
    noteHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '12px',
    },
    noteIcon: {
      width: '24px',
      height: '24px',
      borderRadius: '6px',
      backgroundColor: '#f59e0b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '12px',
    },
    noteTitle: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#92400e',
    },
    noteContent: {
      fontSize: '14px',
      color: '#78350f',
      lineHeight: '1.7',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      wordBreak: 'break-word',
    },
    modalFooter: {
      padding: '20px',
      borderTop: '1px solid #f1f5f9',
      backgroundColor: '#f8fafc',
      display: 'flex',
      justifyContent: 'flex-end',
    },
  };

  // Utility functions
  const periodStartDate = summary.period_start ? new Date(summary.period_start) : null;
  const periodEndDate = summary.period_end ? new Date(summary.period_end) : null;

  const formatPeriod = () => {
    if (!periodStartDate || !periodEndDate) return null;
    const opts = { day: '2-digit', month: 'long', year: 'numeric' };
    const start = new Intl.DateTimeFormat('id-ID', opts).format(periodStartDate);
    const end = new Intl.DateTimeFormat('id-ID', opts).format(new Date(periodEndDate.getTime() - 1));
    return `${start} - ${end}`;
  };

  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    for (let i = 12; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const value = `${year}-${String(month + 1).padStart(2, '0')}`;
      const label = `${monthNames[month]} ${year}`;
      options.push({ value, label });
    }

    return options;
  };

  const monthOptions = generateMonthOptions();
  const allReports = Array.isArray(summary.reports) ? summary.reports : [];
  const uniqueEngineers = Array.from(new Set(allReports.map(rep => rep.user_email).filter(Boolean))).sort();

  const formatEngineerName = (email) => {
    if (!email) return '-';
    const namePart = email.split('@')[0];
    return namePart
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Filter reports
  const filteredReports = (() => {
    let filtered = [...allReports];

    if (selectedEngineer && selectedEngineer !== 'all') {
      filtered = filtered.filter(rep => rep.user_email === selectedEngineer);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(rep => {
        const engineerName = formatEngineerName(rep.user_email).toLowerCase();
        const email = (rep.user_email || '').toLowerCase();
        const title = (rep.title || '').toLowerCase();
        const description = (rep.description || '').toLowerCase();
        return engineerName.includes(term) || email.includes(term) || title.includes(term) || description.includes(term);
      });
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return filtered;
  })();

  const handleEngineerClick = (email) => {
    setSelectedEngineer(email === selectedEngineer ? 'all' : email);
    setSearchTerm('');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedEngineer('all');
  };

  const activeFiltersCount = [
    selectedEngineer && selectedEngineer !== 'all',
    searchTerm.trim(),
  ].filter(Boolean).length;

  return (
    <>
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        * {
          box-sizing: border-box;
        }
      `}</style>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <div>
              <h1 style={styles.title}>
                📋 Daily Reports
              </h1>
              <p style={styles.subtitle}>
                Daftar lengkap semua laporan harian engineer
              </p>
            </div>
            <button
              style={styles.backButton}
              onClick={() => router.push('/dashboard/engineer-reports')}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              ← Kembali
            </button>
          </div>
          
          {error && (
            <div style={styles.errorCard}>
              {error}
            </div>
          )}
        </div>

        {/* Month Filter */}
        <div style={styles.monthFilterCard}>
          <label style={styles.monthFilterLabel}>Filter Berdasarkan Bulan</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={styles.monthSelect}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formatPeriod() && (
              <div style={styles.periodInfo}>
                📅 Periode: {formatPeriod()}
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div style={styles.loading}>
            <div style={styles.spinner} />
            <p>Memuat data laporan...</p>
          </div>
        ) : (
          <>

            {/* Filters Card */}
            <div style={styles.filtersCard}>
              <div style={styles.filterRow}>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Cari Laporan</label>
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama, email, judul, atau deskripsi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.input}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Filter Engineer</label>
                  <select
                    value={selectedEngineer || 'all'}
                    onChange={(e) => setSelectedEngineer(e.target.value === 'all' ? 'all' : e.target.value)}
                    style={styles.select}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="all">Semua Engineer</option>
                    {uniqueEngineers.map((email) => (
                      <option key={email} value={email}>
                        {formatEngineerName(email)}
                      </option>
                    ))}
                  </select>
                </div>
                
                {activeFiltersCount > 0 && (
                  <button
                    style={styles.clearButton}
                    onClick={clearFilters}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#9ca3af';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                  >
                    🗑️ Hapus Filter
                  </button>
                )}
              </div>
              
              {activeFiltersCount > 0 && (
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  <span style={styles.activeFiltersBadge}>
                    🔍 {activeFiltersCount} filter aktif
                  </span>
                  <span>
                    Menampilkan {filteredReports.length} dari {allReports.length} laporan
                  </span>
                </div>
              )}
            </div>

            {/* Reports Table */}
            <div style={styles.tableCard}>
              <div style={styles.tableHeader}>
                <h2 style={styles.tableTitle}>Detail Laporan</h2>
                <p style={styles.tableSubtitle}>
                  {filteredReports.length === allReports.length
                    ? `Menampilkan semua ${filteredReports.length} laporan`
                    : `Menampilkan ${filteredReports.length} dari ${allReports.length} laporan`}
                </p>
              </div>
              
              {filteredReports.length > 0 ? (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>No</th>
                        <th style={styles.th}>Tanggal</th>
                        <th style={styles.th}>Engineer</th>
                        <th style={styles.th}>Judul Laporan</th>
                        <th style={styles.th}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.map((rep, index) => {
                        const isEngineerActive = selectedEngineer === rep.user_email;
                        return (
                          <tr 
                            key={rep.id}
                            style={{
                              backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f9fafb';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#fafafa';
                            }}
                          >
                            <td style={{ ...styles.td, color: '#6b7280', textAlign: 'center' }}>
                              {index + 1}
                            </td>
                            <td style={styles.td}>
                              <div style={{ fontWeight: 500, color: '#374151' }}>
                                {formatDate(rep.created_at)}
                              </div>
                            </td>
                            <td style={styles.td}>
                              <div
                                style={{
                                  ...styles.engineerCell,
                                  backgroundColor: isEngineerActive ? '#dbeafe' : 'transparent',
                                }}
                                onClick={() => handleEngineerClick(rep.user_email)}
                                title={`Filter: ${formatEngineerName(rep.user_email)}`}
                              >
                                {formatEngineerName(rep.user_email)}
                              </div>
                              <div style={styles.engineerEmail}>
                                {rep.user_email}
                              </div>
                            </td>
                            <td style={styles.td}>
                              <div style={styles.titleCell}>
                                {rep.title || '-'}
                              </div>
                              {rep.description && (
                                <div style={styles.descriptionPreview}>
                                  {rep.description}
                                </div>
                              )}
                            </td>
                            <td style={styles.td}>
                              <button
                                style={styles.detailButton}
                                onClick={() => setSelectedReport(rep)}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#2563eb';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#3b82f6';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }}
                              >
                                Lihat Detail
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📄</div>
                  <h3 style={{ color: '#374151', marginBottom: '8px' }}>
                    Tidak ada laporan ditemukan
                  </h3>
                  <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto' }}>
                    {allReports.length === 0
                      ? 'Belum ada daily report yang tercatat untuk periode ini.'
                      : 'Coba gunakan filter yang berbeda atau hapus filter yang aktif.'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Modal Detail Laporan */}
        {selectedReport && (
          <div 
            style={styles.modalOverlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedReport(null);
              }
            }}
          >
            <div style={styles.modal}>
              {/* Modal Header */}
              <div style={styles.modalHeader}>
                <div style={styles.modalTitleContainer}>
                  <div style={styles.modalIcon}>
                    📄
                  </div>
                  <div>
                    <h3 style={styles.modalTitle}>Detail Laporan Harian</h3>
                    <p style={styles.modalSubtitle}>
                      {formatDateTime(selectedReport.created_at)}
                    </p>
                  </div>
                </div>
                <button
                  style={styles.closeButton}
                  onClick={() => setSelectedReport(null)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ef4444';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'rotate(90deg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = '#64748b';
                    e.currentTarget.style.transform = 'rotate(0deg)';
                  }}
                >
                  ✕
                </button>
              </div>
              
              {/* Modal Content */}
              <div style={styles.modalContent}>
                {/* Informasi Engineer & Tanggal */}
                <div style={styles.infoGrid}>
                  <div style={styles.infoCard}>
                    <div style={styles.infoCardTitle}>
                      <span style={{ color: '#3b82f6' }}>👨‍💼</span>
                      ENGINEER
                    </div>
                    <div style={styles.infoCardValue}>
                      {formatEngineerName(selectedReport.user_email)}
                    </div>
                    <div style={styles.infoCardEmail}>
                      {selectedReport.user_email}
                    </div>
                  </div>
                  
                  <div style={styles.infoCard}>
                    <div style={styles.infoCardTitle}>
                      <span style={{ color: '#10b981' }}>📅</span>
                      TANGGAL & WAKTU
                    </div>
                    <div style={styles.infoCardValue}>
                      {formatDate(selectedReport.created_at)}
                    </div>
                    <div style={styles.infoCardEmail}>
                      {new Date(selectedReport.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Judul Laporan */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={styles.sectionTitle}>
                    <span style={{ color: '#6366f1' }}>🏷️</span>
                    JUDUL LAPORAN
                  </div>
                  <div style={styles.contentCard}>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: 600, 
                      color: '#0f172a',
                      lineHeight: '1.4'
                    }}>
                      {selectedReport.title || 'Tidak ada judul'}
                    </div>
                  </div>
                </div>
                
                {/* Deskripsi */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={styles.sectionTitle}>
                    <span style={{ color: '#0ea5e9' }}>📝</span>
                    DESKRIPSI LAPORAN
                  </div>
                  <div style={styles.contentCard}>
                    {selectedReport.description ? (
                      <div style={{ 
                        fontSize: '15px', 
                        color: '#334155',
                        lineHeight: '1.7',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        maxWidth: '100%',
                        overflow: 'visible',
                        width: '100%',
                      }}>
                        {selectedReport.description}
                      </div>
                    ) : (
                      <div style={{ 
                        color: '#94a3b8', 
                        fontStyle: 'italic',
                        textAlign: 'center',
                        padding: '40px 20px'
                      }}>
                        Tidak ada deskripsi yang ditambahkan
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Catatan Khusus (jika ada) */}
                {selectedReport.note && (
                  <div>
                    <div style={styles.sectionTitle}>
                      <span style={{ color: '#f59e0b' }}>📌</span>
                      CATATAN KHUSUS
                    </div>
                    <div style={styles.noteCard}>
                      <div style={styles.noteHeader}>
                        <div style={styles.noteIcon}>
                          ⚠️
                        </div>
                        <div style={styles.noteTitle}>PENTING</div>
                      </div>
                      <div style={styles.noteContent}>
                        {selectedReport.note}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Modal Footer */}
              <div style={styles.modalFooter}>
                <button
                  style={{
                    padding: '12px 28px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                  }}
                  onClick={() => setSelectedReport(null)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function EngineerReportsDetailPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          color: '#6b7280',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e5e7eb',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <div>Memuat halaman...</div>
        </div>
      </div>
    }>
      <EngineerReportsDetailContent />
    </Suspense>
  );
}