'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, apiPut, apiDelete, apiRequest } from '../../../lib/api';

export default function PromosPage() {
  const router = useRouter();
  const [promos, setPromos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    is_active: true,
    start_date: '',
    end_date: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchPromos();
  }, [router]);

  const fetchPromos = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await apiGet('/admin/promos');
      if (Array.isArray(data)) {
        setPromos(data);
      } else {
        setPromos([]);
        setError('Failed to load promos');
      }
    } catch (err) {
      console.error('Error fetching promos:', err);
      setError('Failed to load promos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (promo = null) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        title: promo.title || '',
        description: promo.description || '',
        image_url: promo.image_url || '',
        is_active: !!promo.is_active,
        start_date: promo.start_date ? promo.start_date.split('T')[0] : '',
        end_date: promo.end_date ? promo.end_date.split('T')[0] : '',
      });
    } else {
      setEditingPromo(null);
      setFormData({
        title: '',
        description: '',
        image_url: '',
        is_active: true,
        start_date: '',
        end_date: '',
      });
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPromo(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await apiRequest('/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response) {
        throw new Error('Upload request failed or unauthorized');
      }

      if (!response.ok) {
        // Try to read JSON error message from backend
        let message = `Upload failed (status ${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData && typeof errorData.error === 'string') {
            message = errorData.error;
          } else if (errorData && typeof errorData.message === 'string') {
            message = errorData.message;
          }
        } catch {
          // ignore JSON parse errors, keep default message
        }
        throw new Error(message);
      }

      const data = await response.json();
      const url = data?.url || data?.path;
      if (!url) {
        throw new Error('Invalid upload response: missing url');
      }

      setFormData((prev) => ({
        ...prev,
        image_url: url,
      }));
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.title.trim() || !formData.description.trim() || !formData.image_url.trim()) {
      setError('Title, description, and image are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

      const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      image_url: formData.image_url.trim(),
      is_active: !!formData.is_active,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
    };

    try {
      let result;
      if (editingPromo) {
        result = await apiPut(`/admin/promos/${editingPromo.id}`, payload);
      } else {
        result = await apiPost('/admin/promos', payload);
      }

      if (result) {
        await fetchPromos();
        handleCloseModal();
      } else {
        setError('Failed to save promo');
      }
    } catch (err) {
      console.error('Error saving promo:', err);
      setError('Failed to save promo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (promoId) => {
    if (!confirm('Are you sure you want to delete this promo?')) return;

    try {
      const result = await apiDelete(`/admin/promos/${promoId}`);
      if (result !== null) {
        await fetchPromos();
      }
    } catch (err) {
      console.error('Error deleting promo:', err);
      alert('Failed to delete promo');
    }
  };

  const handleToggleActive = async (promo) => {
    try {
      const payload = {
        title: promo.title || '',
        description: promo.description || '',
        image_url: promo.image_url || '',
        is_active: !promo.is_active,
        start_date: promo.start_date || null,
        end_date: promo.end_date || null,
      };

      const result = await apiPut(`/admin/promos/${promo.id}`, payload);
      if (result) {
        await fetchPromos();
      }
    } catch (err) {
      console.error('Error toggling promo status:', err);
      alert('Failed to toggle promo status');
    }
  };

  const styles = {
    container: {
      padding: '30px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
    },
    title: {
      fontSize: '26px',
      fontWeight: '700',
      color: '#1f2937',
      margin: 0,
    },
    subtitle: {
      fontSize: '14px',
      color: '#6b7280',
      margin: 0,
    },
    addButton: {
      padding: '10px 20px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '999px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 4px rgba(15, 23, 42, 0.06)',
      padding: '20px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      textAlign: 'left',
      padding: '12px 8px',
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: '#6b7280',
      borderBottom: '1px solid #e5e7eb',
    },
    td: {
      padding: '12px 8px',
      fontSize: '14px',
      color: '#111827',
      borderBottom: '1px solid #f3f4f6',
      verticalAlign: 'middle',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    badgeActive: {
      backgroundColor: '#d1fae5',
      color: '#047857',
    },
    badgeInactive: {
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
    },
    actions: {
      display: 'flex',
      gap: '8px',
    },
    actionButton: {
      padding: '6px 10px',
      borderRadius: '999px',
      border: 'none',
      fontSize: '12px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
    },
    actionEdit: {
      backgroundColor: '#e0f2fe',
      color: '#0369a1',
    },
    actionDelete: {
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
    },
    actionToggle: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
    },
    imageThumb: {
      width: '80px',
      height: '48px',
      borderRadius: '8px',
      objectFit: 'cover',
      border: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb',
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#6b7280',
      fontSize: '14px',
    },
    error: {
      marginBottom: '16px',
      padding: '12px 14px',
      borderRadius: '8px',
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      fontSize: '13px',
    },
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
    },
    modal: {
      backgroundColor: '#fff',
      borderRadius: '16px',
      width: '100%',
      maxWidth: '640px',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 20px 40px rgba(15, 23, 42, 0.3)',
    },
    modalHeader: {
      padding: '16px 20px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: '600',
      margin: 0,
      color: '#111827',
    },
    modalBody: {
      padding: '20px',
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '6px',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      outline: 'none',
      backgroundColor: '#f9fafb',
      marginBottom: '12px',
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      outline: 'none',
      backgroundColor: '#f9fafb',
      minHeight: '100px',
      resize: 'vertical',
      marginBottom: '12px',
    },
    checkboxRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '16px',
    },
    footer: {
      padding: '16px 20px',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
    },
    secondaryButton: {
      padding: '8px 16px',
      borderRadius: '999px',
      border: '1px solid #d1d5db',
      backgroundColor: '#fff',
      color: '#374151',
      fontSize: '14px',
      cursor: 'pointer',
    },
    primaryButton: {
      padding: '8px 16px',
      borderRadius: '999px',
      border: 'none',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      color: '#fff',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      minWidth: '120px',
    },
    uploadButton: {
      padding: '6px 10px',
      borderRadius: '999px',
      border: '1px solid #d1d5db',
      backgroundColor: '#fff',
      color: '#374151',
      fontSize: '12px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Promos</h1>
          <p style={styles.subtitle}>Manage promotional banners for client dashboard</p>
        </div>
        <button type="button" style={styles.addButton} onClick={() => handleOpenModal(null)}>
          <span>＋</span>
          New Promo
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.card}>
        {isLoading ? (
          <div style={styles.emptyState}>Loading promos...</div>
        ) : promos.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No promos found.</p>
            <p>Create your first promo to highlight special offers for clients.</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Image</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Start Date</th>
                <th style={styles.th}>End Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((promo) => (
                <tr key={promo.id}>
                  <td style={styles.td}>
                    {promo.image_url ? (
                      <img
                        src={promo.image_url}
                        alt={promo.title}
                        style={styles.imageThumb}
                      />
                    ) : (
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>No image</span>
                    )}
                  </td>
                  <td style={styles.td}>{promo.title}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        ...(promo.is_active ? styles.badgeActive : styles.badgeInactive),
                      }}
                    >
                      {promo.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {promo.start_date ? new Date(promo.start_date).toLocaleDateString() : '—'}
                  </td>
                  <td style={styles.td}>
                    {promo.end_date ? new Date(promo.end_date).toLocaleDateString() : '—'}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        type="button"
                        style={{ ...styles.actionButton, ...styles.actionEdit }}
                        onClick={() => handleOpenModal(promo)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        style={{ ...styles.actionButton, ...styles.actionToggle }}
                        onClick={() => handleToggleActive(promo)}
                      >
                        {promo.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        style={{ ...styles.actionButton, ...styles.actionDelete }}
                        onClick={() => handleDelete(promo.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingPromo ? 'Edit Promo' : 'Create Promo'}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{ border: 'none', background: 'transparent', fontSize: '22px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={styles.modalBody}>
                {error && <div style={styles.error}>{error}</div>}
                <label style={styles.label} htmlFor="title">Title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  style={styles.input}
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Promo title"
                />

                <label style={styles.label} htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  style={styles.textarea}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Promo description"
                />

                <label style={styles.label}>Image</label>
                <div style={{ marginBottom: '12px' }}>
                  <label style={styles.uploadButton}>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleUploadImage}
                    />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </label>
                  {formData.image_url && (
                    <div style={{ marginTop: '10px' }}>
                      <img
                        src={formData.image_url}
                        alt="Promo"
                        style={styles.imageThumb}
                      />
                    </div>
                  )}
                </div>

                <label style={styles.label} htmlFor="start_date">Start Date</label>
                <input
                  id="start_date"
                  name="start_date"
                  type="date"
                  style={styles.input}
                  value={formData.start_date}
                  onChange={handleInputChange}
                />

                <label style={styles.label} htmlFor="end_date">End Date</label>
                <input
                  id="end_date"
                  name="end_date"
                  type="date"
                  style={styles.input}
                  value={formData.end_date}
                  onChange={handleInputChange}
                />

                <div style={styles.checkboxRow}>
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="is_active" style={{ fontSize: '13px', color: '#374151' }}>
                    Active
                  </label>
                </div>
              </div>
              <div style={styles.footer}>
                <button type="button" style={styles.secondaryButton} onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" style={styles.primaryButton} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


