'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet } from '../../../lib/api';

export default function EngineerReportsPage() {
  const router = useRouter();
  const [summary, setSummary] = useState({
    reports: [],
    stats: [],
    period_start: null,
    period_end: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for month filter (format: YYYY-MM)
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

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

  const styles = {
    container: {
      minHeight: '100vh',
      padding: '24px',
      backgroundColor: '#f8fafc',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
      marginBottom: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: '24px',
      fontWeight: 700,
      color: '#111827',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#6b7280',
      marginTop: '4px',
    },
    periodText: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '4px',
    },
    chip: {
      padding: '4px 10px',
      borderRadius: '999px',
      backgroundColor: '#e0f2fe',
      color: '#0369a1',
      fontSize: '12px',
      fontWeight: 600,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '24px',
      alignItems: 'flex-start',
    },
    gridWithDetail: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 3fr)',
      gap: '24px',
      alignItems: 'flex-start',
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
      border: '1px solid #e5e7eb',
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
    },
    cardTitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#111827',
      margin: 0,
    },
    cardSubtitle: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '4px',
    },
    tableWrapper: {
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '13px',
    },
    th: {
      textAlign: 'left',
      padding: '10px 12px',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb',
      color: '#6b7280',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontSize: '11px',
    },
    tr: {
      borderBottom: '1px solid #f3f4f6',
      cursor: 'pointer',
    },
    td: {
      padding: '10px 12px',
      color: '#111827',
      fontSize: '13px',
    },
    rankBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '28px',
      height: '28px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 700,
    },
    rank1: {
      background: 'linear-gradient(135deg, #fbbf24, #f97316)',
      color: '#111827',
    },
    rank2: {
      background: 'linear-gradient(135deg, #e5e7eb, #9ca3af)',
      color: '#111827',
    },
    rank3: {
      background: 'linear-gradient(135deg, #facc15, #a16207)',
      color: '#111827',
    },
    rankDefault: {
      backgroundColor: '#e5e7eb',
      color: '#374151',
    },
    pill: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '11px',
      fontWeight: 600,
      backgroundColor: '#eff6ff',
      color: '#1d4ed8',
    },
    email: {
      fontWeight: 600,
      color: '#111827',
    },
    nameHint: {
      fontSize: '11px',
      color: '#6b7280',
      marginTop: '2px',
    },
    statNumber: {
      fontWeight: 700,
      color: '#111827',
    },
    statMuted: {
      fontSize: '11px',
      color: '#6b7280',
      marginLeft: '4px',
    },
    barChartContainer: {
      marginBottom: '16px',
    },
    barRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '6px',
      fontSize: '11px',
      color: '#4b5563',
    },
    barLabel: {
      flex: '0 0 120px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    barTrack: {
      flex: 1,
      height: '8px',
      borderRadius: '999px',
      backgroundColor: '#e5e7eb',
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      borderRadius: '999px',
      transition: 'background 0.3s ease',
    },
    barFillRed: {
      background: 'linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
    },
    barFillYellow: {
      background: 'linear-gradient(90deg, #ca8a04 0%, #eab308 50%, #facc15 100%)',
    },
    barFillGreen: {
      background: 'linear-gradient(90deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)',
    },
    barValue: {
      flex: '0 0 56px',
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums',
    },
    chartsRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '16px',
      alignItems: 'flex-start',
    },
    chartCard: {
      padding: '12px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb',
    },
    chartTitle: {
      fontSize: '12px',
      fontWeight: 600,
      color: '#4b5563',
      margin: '0 0 8px 0',
    },
    chartSubtitle: {
      fontSize: '11px',
      color: '#9ca3af',
      margin: '0 0 8px 0',
    },
    pieLegend: {
      marginTop: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      fontSize: '11px',
      color: '#4b5563',
    },
    pieLegendRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    pieColorDot: {
      width: '10px',
      height: '10px',
      borderRadius: '999px',
    },
    badgeStatus: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    statusDraft: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
    },
    statusSubmitted: {
      backgroundColor: '#dbeafe',
      color: '#1d4ed8',
    },
    statusApproved: {
      backgroundColor: '#dcfce7',
      color: '#166534',
    },
    error: {
      marginBottom: '16px',
      padding: '12px 16px',
      borderRadius: '12px',
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      border: '1px solid #fecaca',
      fontSize: '13px',
    },
    loading: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      padding: '40px 0',
      color: '#6b7280',
      fontSize: '14px',
    },
    loadingSpinner: {
      width: '32px',
      height: '32px',
      borderRadius: '999px',
      border: '3px solid #e5e7eb',
      borderTopColor: '#3b82f6',
      animation: 'spin 1s linear infinite',
    },
    empty: {
      padding: '24px 0',
      textAlign: 'center',
      color: '#6b7280',
      fontSize: '14px',
    },
    tagSelected: {
      fontSize: '12px',
      color: '#6b7280',
    },
    clearButton: {
      padding: '6px 12px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      backgroundColor: '#ffffff',
      color: '#374151',
      fontSize: '12px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    clearButtonHover: {
      backgroundColor: '#f9fafb',
      borderColor: '#9ca3af',
    },
    viewAllButton: {
      padding: '12px 24px',
      borderRadius: '10px',
      border: 'none',
      backgroundColor: '#3b82f6',
      color: 'white',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
    },
    viewAllButtonHover: {
      backgroundColor: '#2563eb',
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 8px rgba(59, 130, 246, 0.4)',
    },
    trSelected: {
      backgroundColor: '#eff6ff',
      borderLeft: '3px solid #3b82f6',
    },
    monthFilter: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px',
      padding: '16px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    monthFilterLabel: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#374151',
    },
    monthSelect: {
      padding: '8px 12px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      backgroundColor: '#ffffff',
      fontSize: '14px',
      fontWeight: 500,
      color: '#111827',
      cursor: 'pointer',
      minWidth: '200px',
      transition: 'all 0.2s ease',
    },
    periodInfo: {
      fontSize: '13px',
      color: '#6b7280',
      marginLeft: 'auto',
    },
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return { ...styles.rankBadge, ...styles.rank1 };
    if (rank === 2) return { ...styles.rankBadge, ...styles.rank2 };
    if (rank === 3) return { ...styles.rankBadge, ...styles.rank3 };
    return { ...styles.rankBadge, ...styles.rankDefault };
  };

  const formatPercent = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return '0%';
    return `${value.toFixed(1)}%`;
  };

  const getBarColor = (percentage) => {
    if (percentage < 55) return { ...styles.barFill, ...styles.barFillRed };
    if (percentage <= 85) return { ...styles.barFill, ...styles.barFillYellow };
    return { ...styles.barFill, ...styles.barFillGreen };
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

  const formatDateOnly = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const statusStyle = (status) => {
    if (status === 'draft') return { ...styles.badgeStatus, ...styles.statusDraft };
    if (status === 'approved') return { ...styles.badgeStatus, ...styles.statusApproved };
    return { ...styles.badgeStatus, ...styles.statusSubmitted };
  };


  // Hitung informasi periode (bulan berjalan dari backend)
  const periodStartDate = summary.period_start ? new Date(summary.period_start) : null;
  const periodEndDate = summary.period_end ? new Date(summary.period_end) : null;

  const formatPeriod = () => {
    if (!periodStartDate || !periodEndDate) return null;
    const opts = { day: '2-digit', month: 'long', year: 'numeric' };
    const start = new Intl.DateTimeFormat('id-ID', opts).format(periodStartDate);
    const end = new Intl.DateTimeFormat('id-ID', opts).format(new Date(periodEndDate.getTime() - 1));
    return `${start} s/d ${end}`;
  };

  // Generate list bulan untuk dropdown (12 bulan terakhir + bulan berjalan)
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // Generate 12 bulan terakhir + bulan berjalan
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

  // Data untuk pie chart: distribusi laporan per engineer
  const totalReportsAll = Array.isArray(summary.stats)
    ? summary.stats.reduce((sum, s) => sum + (s.total_reports || 0), 0)
    : 0;

  const pieSegments = Array.isArray(summary.stats)
    ? summary.stats.map((stat, index) => ({
        label: stat.user_email,
        value: stat.total_reports || 0,
        percentage: totalReportsAll ? (stat.total_reports / totalReportsAll) : 0,
        color: [
          '#3b82f6',
          '#22c55e',
          '#f97316',
          '#a855f7',
          '#ec4899',
          '#0ea5e9',
          '#facc15',
        ][index % 7],
      }))
    : [];

  const pieCircumference = 2 * Math.PI * 16; // radius 16
  let pieOffsetAccumulator = 0;

  return (
    <>
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              📊 Engineer Daily Reports
              <span style={styles.chip}>Monitoring & Ranking</span>
            </h1>
            <p style={styles.subtitle}>
              Pantau kepatuhan pengisian daily report setiap engineer, persentase laporan, ranking, dan detail activity per bulan.
            </p>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Month Filter */}
        <div style={styles.monthFilter}>
          <label style={styles.monthFilterLabel} htmlFor="month-select">
            Filter Bulan:
          </label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={styles.monthSelect}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = 'none';
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
              Periode: {formatPeriod()}
            </div>
          )}
        </div>

        {isLoading ? (
          <div style={styles.loading}>
            <div style={styles.loadingSpinner} />
            <span>Memuat data laporan engineer...</span>
          </div>
        ) : (
          <div style={styles.grid}>
            {/* Left: per-engineer statistics & ranking */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>Ringkasan per Engineer</h2>
                  <p style={styles.cardSubtitle}>
                    Data per bulan berjalan. Klik baris engineer untuk melihat detail report. Klik lagi untuk kembali ke semua engineer.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={styles.pill}>
                    Total engineer: {summary.stats?.length || 0}
                  </div>
                  {Array.isArray(summary.stats) && summary.stats.length > 0 && (
                    <button
                      style={{ ...styles.viewAllButton, padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => router.push('/dashboard/engineer-reports/detail')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = styles.viewAllButtonHover.backgroundColor;
                        e.currentTarget.style.transform = styles.viewAllButtonHover.transform;
                        e.currentTarget.style.boxShadow = styles.viewAllButtonHover.boxShadow;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = styles.viewAllButton.backgroundColor;
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = styles.viewAllButton.boxShadow;
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Detail Reports
                    </button>
                  )}
                </div>
              </div>

              {/* Rank terbagus & terbawah */}
              {Array.isArray(summary.stats) && summary.stats.length > 0 && (
                <div style={styles.chartsRow}>
                  {/* Rank Terbagus (Top 3) */}
                  <div style={styles.chartCard}>
                    <p style={styles.chartTitle}>🏆 Top 3 Engineer</p>
                    <p style={styles.chartSubtitle}>
                      Engineer dengan completion rate tertinggi.
                    </p>
                    {summary.stats
                      .filter(stat => stat.rank <= 3)
                      .sort((a, b) => a.rank - b.rank)
                      .map((stat) => (
                        <div key={stat.user_email} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px', 
                          padding: '12px',
                          marginBottom: '8px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <span style={getRankStyle(stat.rank)}>{stat.rank}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ ...styles.email, fontSize: '13px' }}>{stat.user_email}</div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '11px', color: '#6b7280' }}>
                              <span>{formatPercent(stat.completion_rate)}</span>
                              <span>•</span>
                              <span>{stat.total_reports} laporan</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Rank Terbawah (Bottom 3) */}
                  <div style={styles.chartCard}>
                    <p style={styles.chartTitle}>📉 Bottom 3 Engineer</p>
                    <p style={styles.chartSubtitle}>
                      Engineer dengan completion rate terendah.
                    </p>
                    {summary.stats
                      .sort((a, b) => (b.rank || 999) - (a.rank || 999))
                      .slice(0, 3)
                      .map((stat, idx) => {
                        // Assign rank untuk bottom 3 (rank terakhir, terakhir-1, terakhir-2)
                        const maxRank = Math.max(...summary.stats.map(s => s.rank || 0));
                        const bottomRank = maxRank - idx;
                        return (
                          <div key={stat.user_email} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            padding: '12px',
                            marginBottom: '8px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <span style={getRankStyle(bottomRank)}>{bottomRank}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ ...styles.email, fontSize: '13px' }}>{stat.user_email}</div>
                              <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '11px', color: '#6b7280' }}>
                                <span>{formatPercent(stat.completion_rate)}</span>
                                <span>•</span>
                                <span>{stat.total_reports} laporan</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Grafik bar & pie chart */}
              {Array.isArray(summary.stats) && summary.stats.length > 0 && (
                <div style={styles.chartsRow}>
                  {/* Bar chart persentase per engineer */}
                  <div style={styles.chartCard}>
                    <p style={styles.chartTitle}>Completion Rate per Engineer</p>
                    <p style={styles.chartSubtitle}>
                      Persentase penyelesaian laporan harian per engineer.
                    </p>
                    <div style={styles.barChartContainer}>
                      {summary.stats.map((stat) => {
                        const value = stat.completion_rate || 0;
                        const widthPercent = Math.min(value, 100); // Cap at 100%
                        const barColorStyle = getBarColor(value);
                        return (
                          <div key={stat.user_email} style={styles.barRow}>
                            <span style={styles.barLabel}>{stat.user_email}</span>
                            <div style={styles.barTrack}>
                              <div style={{ ...barColorStyle, width: `${widthPercent}%` }} />
                            </div>
                            <span style={styles.barValue}>{formatPercent(value)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pie chart distribusi laporan per engineer */}
                  <div style={styles.chartCard}>
                    <p style={styles.chartTitle}>Distribusi Laporan per Engineer</p>
                    <p style={styles.chartSubtitle}>
                      Persentase jumlah laporan per engineer pada bulan ini.
                    </p>
                    {totalReportsAll > 0 ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <svg viewBox="0 0 40 40" width="80" height="80">
                          <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="#e5e7eb"
                          />
                          {pieSegments.map((seg, idx) => {
                            const dash = seg.percentage * pieCircumference;
                            const circle = (
                              <circle
                                key={seg.label}
                                cx="20"
                                cy="20"
                                r="16"
                                fill="transparent"
                                stroke={seg.color}
                                strokeWidth="8"
                                strokeDasharray={`${dash} ${pieCircumference - dash}`}
                                strokeDashoffset={-pieOffsetAccumulator}
                              />
                            );
                            pieOffsetAccumulator += dash;
                            return circle;
                          })}
                        </svg>
                        <div style={styles.pieLegend}>
                          {pieSegments.map((seg) => (
                            <div key={seg.label} style={styles.pieLegendRow}>
                              <span style={{ ...styles.pieColorDot, backgroundColor: seg.color }} />
                              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {seg.label}
                              </span>
                              <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {formatPercent(seg.percentage * 100 / 100)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p style={styles.chartSubtitle}>Belum ada data laporan untuk periode ini.</p>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}
      </div>
    </>
  );
}

