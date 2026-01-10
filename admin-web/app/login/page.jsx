'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLoginMode, setIsLoginMode] = useState(true); // true = login, false = register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      router.push('/dashboard');
      return;
    }
    setIsLoading(false);
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError(errorText || 'Email atau password salah. Silakan coba kembali.');
        setIsLoggingIn(false);
        return;
      }

      const data = await response.json();
      
      if (data.token && typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', email);
      }
      
      router.push('/dashboard');
    } catch (err) {
      setError('Koneksi gagal. Periksa jaringan Anda.');
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    if (password.length < 6) {
      setError('Password harus minimal 6 karakter');
      setIsLoggingIn(false);
      return;
    }

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          full_name: fullName || undefined,
          phone: phone || undefined,
          role: 'client' // Default role
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError(errorText || 'Pendaftaran gagal. Silakan coba kembali.');
        setIsLoggingIn(false);
        return;
      }

      const data = await response.json();
      
      if (data.token && typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', email);
      }
      
      router.push('/dashboard');
    } catch (err) {
      setError('Koneksi gagal. Periksa jaringan Anda.');
      setIsLoggingIn(false);
    }
  };

  // Styles untuk komponen
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      padding: '16px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    wrapper: {
      width: '100%',
      maxWidth: '420px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    logoContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '16px'
    },
    logo: {
      width: '64px',
      height: '64px',
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    },
    companyName: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1f2937',
      margin: '0'
    },
    companySubtitle: {
      fontSize: '14px',
      color: '#6b7280',
      marginTop: '8px',
      marginBottom: '0'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '40px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1f2937',
      textAlign: 'center',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#6b7280',
      textAlign: 'center',
      marginBottom: '32px'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    inputWrapper: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '12px 16px 12px 44px',
      border: '1px solid #d1d5db',
      borderRadius: '12px',
      fontSize: '14px',
      backgroundColor: '#f9fafb',
      boxSizing: 'border-box',
      outline: 'none',
      transition: 'all 0.2s ease'
    },
    inputFocus: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      backgroundColor: 'white'
    },
    icon: {
      position: 'absolute',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af',
      width: '20px',
      height: '20px'
    },
    passwordToggle: {
      position: 'absolute',
      right: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#9ca3af'
    },
    errorBox: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '12px 16px',
      borderRadius: '12px',
      fontSize: '14px',
      marginTop: '8px'
    },
    button: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    buttonHover: {
      background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
      boxShadow: '0 6px 8px -1px rgba(37, 99, 235, 0.4)',
      transform: 'translateY(-1px)'
    },
    buttonDisabled: {
      opacity: '0.6',
      cursor: 'not-allowed'
    },
    footer: {
      marginTop: '32px',
      paddingTop: '24px',
      borderTop: '1px solid #e5e7eb',
      textAlign: 'center'
    },
    footerText: {
      fontSize: '12px',
      color: '#6b7280',
      lineHeight: '1.5',
      margin: '0'
    },
    versionText: {
      fontSize: '11px',
      color: '#9ca3af',
      marginTop: '8px'
    },
    securityNotice: {
      fontSize: '11px',
      color: '#6b7280',
      textAlign: 'center',
      marginTop: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px'
    },
    loadingSpinner: {
      display: 'inline-block',
      width: '20px',
      height: '20px',
      border: '2px solid #ffffff',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    '@keyframes spin': {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' }
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #2563eb',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: '#4b5563', fontWeight: '500' }}>Memuat aplikasi...</p>
        </div>
        <style jsx>{`
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
        
        * {
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
          margin: 0;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }
      `}</style>
      
      <div style={styles.container}>
        <div style={styles.wrapper}>

          {/* Login/Register Card */}
          <div style={styles.card}>
            {/* Toggle between Login and Register */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '24px',
              backgroundColor: '#f3f4f6',
              padding: '4px',
              borderRadius: '12px'
            }}>
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(true);
                  setError('');
                  setFullName('');
                  setPhone('');
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backgroundColor: isLoginMode ? 'white' : 'transparent',
                  color: isLoginMode ? '#3b82f6' : '#6b7280',
                  boxShadow: isLoginMode ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(false);
                  setError('');
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backgroundColor: !isLoginMode ? 'white' : 'transparent',
                  color: !isLoginMode ? '#3b82f6' : '#6b7280',
                  boxShadow: !isLoginMode ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                Daftar
              </button>
            </div>

            <h2 style={styles.title}>{isLoginMode ? 'Login Admin' : 'Daftar Akun'}</h2>
            <p style={styles.subtitle}>Sistem Manajemen My Premier</p>

            <form onSubmit={isLoginMode ? handleLogin : handleRegister} style={styles.form}>
              {/* Full Name Input - Only for Register */}
              {!isLoginMode && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nama Lengkap</label>
                  <div style={styles.inputWrapper}>
                    <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Nama Lengkap (Opsional)"
                      style={styles.input}
                      onFocus={(e) => {
                        e.target.style.borderColor = styles.inputFocus.borderColor;
                        e.target.style.boxShadow = styles.inputFocus.boxShadow;
                        e.target.style.backgroundColor = styles.inputFocus.backgroundColor;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = styles.input.borderColor;
                        e.target.style.boxShadow = 'none';
                        e.target.style.backgroundColor = styles.input.backgroundColor;
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <div style={styles.inputWrapper}>
                  <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@perusahaan.co.id"
                    required
                    style={styles.input}
                    onFocus={(e) => {
                      e.target.style.borderColor = styles.inputFocus.borderColor;
                      e.target.style.boxShadow = styles.inputFocus.boxShadow;
                      e.target.style.backgroundColor = styles.inputFocus.backgroundColor;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = styles.input.borderColor;
                      e.target.style.boxShadow = 'none';
                      e.target.style.backgroundColor = styles.input.backgroundColor;
                    }}
                  />
                </div>
              </div>

              {/* Phone Input - Only for Register */}
              {!isLoginMode && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nomor Telepon</label>
                  <div style={styles.inputWrapper}>
                    <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="Nomor Telepon (Opsional)"
                      style={styles.input}
                      onFocus={(e) => {
                        e.target.style.borderColor = styles.inputFocus.borderColor;
                        e.target.style.boxShadow = styles.inputFocus.boxShadow;
                        e.target.style.backgroundColor = styles.inputFocus.backgroundColor;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = styles.input.borderColor;
                        e.target.style.boxShadow = 'none';
                        e.target.style.backgroundColor = styles.input.backgroundColor;
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Password Input */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.inputWrapper}>
                  <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={styles.input}
                    onFocus={(e) => {
                      e.target.style.borderColor = styles.inputFocus.borderColor;
                      e.target.style.boxShadow = styles.inputFocus.boxShadow;
                      e.target.style.backgroundColor = styles.inputFocus.backgroundColor;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = styles.input.borderColor;
                      e.target.style.boxShadow = 'none';
                      e.target.style.backgroundColor = styles.input.backgroundColor;
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div style={styles.errorBox}>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                style={{
                  ...styles.button,
                  ...(isLoggingIn ? styles.buttonDisabled : {}),
                }}
                onMouseEnter={(e) => {
                  if (!isLoggingIn) {
                    e.currentTarget.style.background = styles.buttonHover.background;
                    e.currentTarget.style.boxShadow = styles.buttonHover.boxShadow;
                    e.currentTarget.style.transform = styles.buttonHover.transform;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoggingIn) {
                    e.currentTarget.style.background = styles.button.background;
                    e.currentTarget.style.boxShadow = styles.button.boxShadow;
                    e.currentTarget.style.transform = 'none';
                  }
                }}
              >
                {isLoggingIn ? (
                  <>
                    <div style={styles.loadingSpinner}></div>
                    Memproses...
                  </>
                ) : (
                  isLoginMode ? 'Masuk ke Dashboard' : 'Daftar Sekarang'
                )}
              </button>
            </form>

            {/* Footer */}
            <div style={styles.footer}>
              <p style={styles.footerText}>
                © {new Date().getFullYear()} PT Premier Engineering Indonesia
                <br />
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Akses terbatas untuk Admin My Premier
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}