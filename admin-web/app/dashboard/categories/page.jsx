'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', parent_id: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
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

    fetchCategories();
  }, [user, authLoading]);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await apiGet('/admin/categories');
      if (data) {
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        parent_id: category.parent_id || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', parent_id: '' });
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', parent_id: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!user) {
        router.push('/login');
        return;
      }

      const body = {
        name: formData.name.trim(),
        parent_id: formData.parent_id || null,
      };

      if (editingCategory) {
        const result = await apiPut(`/admin/categories/${editingCategory.id}`, body);
        if (result) {
          await fetchCategories();
          handleCloseModal();
        }
      } else {
        const result = await apiPost('/admin/categories', body);
        if (result) {
          await fetchCategories();
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setError(error.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      if (!user) {
        router.push('/login');
        return;
      }

      const result = await apiDelete(`/admin/categories/${categoryId}`);
      if (result !== null) {
        await fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const getParentName = (parentId) => {
    if (!parentId) return '—';
    const parent = categories.find((cat) => cat.id === parentId);
    return parent ? parent.name : 'Unknown';
  };

  // Filter and sort categories
  const filteredCategories = categories
    .filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getParentName(category.parent_id).toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'parent') return getParentName(a.parent_id).localeCompare(getParentName(b.parent_id));
      return 0;
    });

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
    addButton: {
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
    },
    addButtonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 12px rgba(59, 130, 246, 0.4)'
    },
    controls: {
      display: 'flex',
      gap: '16px',
      marginBottom: '24px',
      flexWrap: 'wrap'
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
    sortSelect: {
      padding: '10px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '10px',
      fontSize: '14px',
      backgroundColor: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none'
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
      transition: 'background-color 0.2s ease'
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
    categoryName: {
      fontWeight: '600',
      color: '#1f2937'
    },
    parentCategory: {
      color: '#6b7280',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    actions: {
      display: 'flex',
      gap: '8px'
    },
    actionButton: {
      padding: '6px 12px',
      borderRadius: '8px',
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
    deleteButton: {
      backgroundColor: '#fee2e2',
      color: '#dc2626'
    },
    deleteButtonHover: {
      backgroundColor: '#fecaca',
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
      marginBottom: '20px'
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
      backdropFilter: 'blur(4px)'
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '20px',
      width: '90%',
      maxWidth: '500px',
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
    form: {
      padding: '28px'
    },
    formGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '12px',
      fontSize: '14px',
      backgroundColor: '#f9fafb',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    inputFocus: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      backgroundColor: 'white'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '12px',
      fontSize: '14px',
      backgroundColor: '#f9fafb',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    formActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '32px',
      paddingTop: '24px',
      borderTop: '1px solid #e5e7eb'
    },
    cancelButton: {
      padding: '10px 20px',
      backgroundColor: 'white',
      color: '#6b7280',
      border: '1px solid #d1d5db',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    cancelButtonHover: {
      backgroundColor: '#f9fafb',
      borderColor: '#9ca3af'
    },
    submitButton: {
      padding: '10px 24px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
    },
    submitButtonHover: {
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 8px rgba(59, 130, 246, 0.4)'
    },
    submitButtonDisabled: {
      opacity: '0.6',
      cursor: 'not-allowed',
      transform: 'none'
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
    stats: {
      display: 'flex',
      gap: '16px',
      marginBottom: '24px',
      flexWrap: 'wrap'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '16px 20px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      minWidth: '160px'
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
          <p style={{ color: '#6b7280' }}>Loading categories...</p>
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
              <span style={{ color: '#3b82f6' }}>Category</span> Management
            </h1>
            <p style={styles.subtitle}>Manage and organize product categories</p>
          </div>
          
          <button
            type="button"
            onClick={() => handleOpenModal()}
            style={styles.addButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = styles.addButtonHover.transform;
              e.currentTarget.style.boxShadow = styles.addButtonHover.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = styles.addButton.boxShadow;
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </button>
        </div>

        {/* Stats Cards */}
        <div style={styles.stats}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{categories.length}</div>
            <div style={styles.statLabel}>Total Categories</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>
              {categories.filter(cat => !cat.parent_id).length}
            </div>
            <div style={styles.statLabel}>Main Categories</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>
              {categories.filter(cat => cat.parent_id).length}
            </div>
            <div style={styles.statLabel}>Sub Categories</div>
          </div>
        </div>

        {error && !isModalOpen && (
          <div style={styles.errorMessage}>{error}</div>
        )}

        {/* Controls */}
        <div style={styles.controls}>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = styles.inputFocus.borderColor;
              e.currentTarget.style.boxShadow = styles.inputFocus.boxShadow;
              e.currentTarget.style.backgroundColor = styles.inputFocus.backgroundColor;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = styles.searchInput.borderColor;
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.backgroundColor = styles.searchInput.backgroundColor;
            }}
          />
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.sortSelect}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = styles.inputFocus.borderColor;
              e.currentTarget.style.boxShadow = styles.inputFocus.boxShadow;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = styles.sortSelect.borderColor;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <option value="name">Sort by Name</option>
            <option value="parent">Sort by Parent</option>
          </select>
        </div>

        {/* Table */}
        <div style={styles.tableContainer}>
          {filteredCategories.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📁</div>
              <p style={styles.emptyText}>
                {searchTerm 
                  ? 'No categories match your search'
                  : 'No categories found'}
              </p>
              {!searchTerm && (
                <button
                  type="button"
                  onClick={() => handleOpenModal()}
                  style={{
                    ...styles.addButton,
                    padding: '10px 20px',
                    fontSize: '13px'
                  }}
                >
                  Create First Category
                </button>
              )}
            </div>
          ) : (
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.tableHeaderCell}>Category Name</th>
                  <th style={styles.tableHeaderCell}>Parent Category</th>
                  <th style={styles.tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr 
                    key={category.id} 
                    style={styles.tableRow}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = styles.tableRowHover.backgroundColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={styles.tableCell}>
                      <div style={styles.categoryName}>
                        {category.name}
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.parentCategory}>
                        {category.parent_id ? (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                            {getParentName(category.parent_id)}
                          </>
                        ) : '—'}
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.actions}>
                        <button
                          type="button"
                          onClick={() => handleOpenModal(category)}
                          style={{
                            ...styles.actionButton,
                            ...styles.editButton
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = styles.editButtonHover.backgroundColor;
                            e.currentTarget.style.transform = styles.editButtonHover.transform;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = styles.editButton.backgroundColor;
                            e.currentTarget.style.transform = 'none';
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category.id)}
                          style={{
                            ...styles.actionButton,
                            ...styles.deleteButton
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = styles.deleteButtonHover.backgroundColor;
                            e.currentTarget.style.transform = styles.deleteButtonHover.transform;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = styles.deleteButton.backgroundColor;
                            e.currentTarget.style.transform = 'none';
                          }}
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

        {/* Modal */}
        {isModalOpen && (
          <div style={styles.modalOverlay} onClick={handleCloseModal}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {editingCategory ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    )}
                  </svg>
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
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

              <form onSubmit={handleSubmit} style={styles.form}>
                {error && <div style={styles.errorMessage}>{error}</div>}

                <div style={styles.formGroup}>
                  <label htmlFor="name" style={styles.label}>
                    Category Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    style={styles.input}
                    placeholder="Enter category name"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = styles.inputFocus.borderColor;
                      e.currentTarget.style.boxShadow = styles.inputFocus.boxShadow;
                      e.currentTarget.style.backgroundColor = styles.inputFocus.backgroundColor;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = styles.input.borderColor;
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.backgroundColor = styles.input.backgroundColor;
                    }}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="parent_id" style={styles.label}>
                    Parent Category (Optional)
                  </label>
                  <select
                    id="parent_id"
                    value={formData.parent_id}
                    onChange={(e) =>
                      setFormData({ ...formData, parent_id: e.target.value })
                    }
                    style={styles.select}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = styles.inputFocus.borderColor;
                      e.currentTarget.style.boxShadow = styles.inputFocus.boxShadow;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = styles.select.borderColor;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">None (Top-level category)</option>
                    {categories
                      .filter(
                        (cat) =>
                          !editingCategory || cat.id !== editingCategory.id
                      )
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div style={styles.formActions}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={styles.cancelButton}
                    disabled={isSubmitting}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.backgroundColor = styles.cancelButtonHover.backgroundColor;
                        e.currentTarget.style.borderColor = styles.cancelButtonHover.borderColor;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.backgroundColor = styles.cancelButton.backgroundColor;
                        e.currentTarget.style.borderColor = styles.cancelButton.borderColor;
                      }
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      ...styles.submitButton,
                      ...(isSubmitting && styles.submitButtonDisabled)
                    }}
                    disabled={isSubmitting}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.transform = styles.submitButtonHover.transform;
                        e.currentTarget.style.boxShadow = styles.submitButtonHover.boxShadow;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = styles.submitButton.boxShadow;
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: 'white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          display: 'inline-block',
                          marginRight: '8px'
                        }}></div>
                        Saving...
                      </>
                    ) : editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}