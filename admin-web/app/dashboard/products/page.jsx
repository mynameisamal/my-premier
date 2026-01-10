'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Helper function to convert file path to full URL
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    series: '',
    category_id: '',
    technical_overview: '',
    typical_application: '',
    images: [],
    datasheet_url: '',
    is_active: true,
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
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

    fetchProducts();
    fetchCategories();
  }, [user, authLoading]);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await apiGet('/admin/products');
      if (data) {
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiGet('/categories', router.push);
      if (data) {
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        series: product.series || '',
        category_id: product.category_id || '',
        technical_overview: product.technical_overview || '',
        typical_application: product.typical_application || '',
        images: Array.isArray(product.images) 
          ? product.images.map(img => typeof img === 'string' ? img : (img?.image_url || ''))
          : [],
        datasheet_url: product.datasheet_url || '',
        is_active: product.is_active !== undefined ? product.is_active : true,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        brand: '',
        series: '',
        category_id: '',
        technical_overview: '',
        typical_application: '',
        images: [],
        datasheet_url: '',
        is_active: true,
      });
    }
    setNewImageUrl('');
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      series: '',
      category_id: '',
      technical_overview: '',
      typical_application: '',
      images: [],
      datasheet_url: '',
      is_active: true,
    });
    setNewImageUrl('');
    setError('');
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, newImageUrl.trim()],
      });
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
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

      if (!formData.typical_application.trim()) {
        throw new Error('Typical application is required');
      }

      const payload = {
        name: formData.name.trim() || '',
        brand: formData.brand.trim() || '',
        series: formData.series.trim() || '',
        category_id: formData.category_id || '',
        technical_overview: formData.technical_overview.trim() || '',
        typical_application: formData.typical_application.trim(),
        datasheet_url: formData.datasheet_url.trim() || '',
        is_active: formData.is_active,
        images: formData.images.filter(url => url && url.trim()).map(url => url.trim()),
      };

      let result;
      if (editingProduct) {
        result = await apiPut(`/admin/products/${editingProduct.id}`, payload);
      } else {
        result = await apiPost('/admin/products', payload);
      }

      if (result) {
        await fetchProducts();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      if (!user) {
        router.push('/login');
        return;
      }

      const result = await apiDelete(`/admin/products/${productId}`);
      if (result !== null) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleToggleActive = async (product) => {
    try {
      if (!user) {
        router.push('/login');
        return;
      }

      const payload = {
        name: product.name || '',
        brand: product.brand || '',
        series: product.series || '',
        category_id: product.category_id || '',
        technical_overview: product.technical_overview || '',
        typical_application: product.typical_application || '',
        datasheet_url: product.datasheet_url || '',
        is_active: !product.is_active,
        images: Array.isArray(product.images) 
          ? product.images.map(img => typeof img === 'string' ? img : (img?.image_url || ''))
          : [],
      };

      const result = await apiPut(`/admin/products/${product.id}`, payload);
      if (result) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert('Failed to toggle product status');
    }
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return '—';
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.series?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || product.category_id === filterCategory;
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && product.is_active) ||
      (filterStatus === 'inactive' && !product.is_active);
    
    return matchesSearch && matchesCategory && matchesStatus;
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
    stats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '16px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    },
    statValue: {
      fontSize: '28px',
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
    statIcon: {
      width: '24px',
      height: '24px',
      backgroundColor: '#dbeafe',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '12px',
      color: '#3b82f6'
    },
    controls: {
      display: 'flex',
      gap: '16px',
      marginBottom: '24px',
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
    productsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '24px'
    },
    productCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    productCardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    productImage: {
      width: '100%',
      height: '180px',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative'
    },
    productImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.3s ease'
    },
    productImgHover: {
      transform: 'scale(1.05)'
    },
    noImage: {
      color: '#9ca3af',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    productContent: {
      padding: '20px'
    },
    productHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px'
    },
    productName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1f2937',
      margin: '0',
      lineHeight: '1.4'
    },
    statusBadge: {
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    statusActive: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    },
    statusInactive: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    productDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginBottom: '20px'
    },
    productDetail: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '13px',
      color: '#6b7280'
    },
    productActions: {
      display: 'flex',
      gap: '8px'
    },
    actionButton: {
      flex: 1,
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px'
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
    toggleButton: {
      backgroundColor: '#f3f4f6',
      color: '#4b5563'
    },
    toggleButtonHover: {
      backgroundColor: '#e5e7eb',
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
      backdropFilter: 'blur(4px)'
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '20px',
      width: '90%',
      maxWidth: '800px',
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
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '24px',
      marginBottom: '24px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    formGroupFull: {
      gridColumn: '1 / -1'
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
    textarea: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '12px',
      fontSize: '14px',
      backgroundColor: '#f9fafb',
      transition: 'all 0.2s ease',
      outline: 'none',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: '100px'
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
    imagePreviewGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
      gap: '12px',
      marginBottom: '16px'
    },
    imagePreviewItem: {
      position: 'relative',
      borderRadius: '8px',
      overflow: 'hidden',
      height: '100px',
      backgroundColor: '#f3f4f6'
    },
    imagePreview: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    removePreviewButton: {
      position: 'absolute',
      top: '4px',
      right: '4px',
      backgroundColor: 'rgba(239, 68, 68, 0.9)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s ease'
    },
    imageInputContainer: {
      display: 'flex',
      gap: '8px'
    },
    addImageButton: {
      padding: '10px 20px',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap'
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#374151'
    },
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer'
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
          <p style={{ color: '#6b7280' }}>Loading products...</p>
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
              <span style={{ color: '#3b82f6' }}>Product</span> Management
            </h1>
            <p style={styles.subtitle}>Manage and organize engineering products</p>
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
            Add Product
          </button>
        </div>

        {/* Stats */}
        <div style={styles.stats}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div style={styles.statValue}>{products.length}</div>
            <div style={styles.statLabel}>Total Products</div>
          </div>
          
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: '#d1fae5', color: '#10b981' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div style={styles.statValue}>
              {products.filter(p => p.is_active).length}
            </div>
            <div style={styles.statLabel}>Active Products</div>
          </div>
          
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: '#fef3c7', color: '#f59e0b' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div style={styles.statValue}>
              {products.filter(p => !p.is_active).length}
            </div>
            <div style={styles.statLabel}>Inactive Products</div>
          </div>
          
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: '#ede9fe', color: '#8b5cf6' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div style={styles.statValue}>{categories.length}</div>
            <div style={styles.statLabel}>Categories</div>
          </div>
        </div>

        {error && !isModalOpen && (
          <div style={styles.errorMessage}>{error}</div>
        )}

        {/* Controls */}
        <div style={styles.controls}>
          <input
            type="text"
            placeholder="Search products..."
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
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={styles.filterSelect}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = styles.inputFocus.borderColor;
              e.currentTarget.style.boxShadow = styles.inputFocus.boxShadow;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = styles.filterSelect.borderColor;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = styles.inputFocus.borderColor;
              e.currentTarget.style.boxShadow = styles.inputFocus.boxShadow;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = styles.filterSelect.borderColor;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📦</div>
            <p style={styles.emptyText}>
              {searchTerm || filterCategory || filterStatus !== 'all'
                ? 'No products match your filters'
                : 'No products found'}
            </p>
            {!(searchTerm || filterCategory || filterStatus !== 'all') && (
              <button
                type="button"
                onClick={() => handleOpenModal()}
                style={{
                  ...styles.addButton,
                  padding: '10px 20px',
                  fontSize: '13px'
                }}
              >
                Create First Product
              </button>
            )}
          </div>
        ) : (
          <div style={styles.productsGrid}>
            {filteredProducts.map((product) => {
              const firstImage = Array.isArray(product.images) && product.images.length > 0 
                ? product.images[0] 
                : null;
              const firstImageUrl = firstImage ? getImageUrl(typeof firstImage === 'string' ? firstImage : firstImage.image_url) : null;
              
              return (
                <div 
                  key={product.id} 
                  style={styles.productCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = styles.productCardHover.transform;
                    e.currentTarget.style.boxShadow = styles.productCardHover.boxShadow;
                    const img = e.currentTarget.querySelector('img');
                    if (img) {
                      img.style.transform = styles.productImgHover.transform;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = styles.productCard.boxShadow;
                    const img = e.currentTarget.querySelector('img');
                    if (img) {
                      img.style.transform = 'none';
                    }
                  }}
                >
                  <div style={styles.productImage}>
                    {firstImageUrl ? (
                      <img 
                        src={firstImageUrl} 
                        alt={product.name || 'Product'} 
                        style={styles.productImg}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = `
                            <div style="color: #9ca3af; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              No Image
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div style={styles.noImage}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        No Image
                      </div>
                    )}
                  </div>
                  
                  <div style={styles.productContent}>
                    <div style={styles.productHeader}>
                      <h3 style={styles.productName} title={product.name || '—'}>
                        {product.name || 'Unnamed Product'}
                      </h3>
                      <span style={{
                        ...styles.statusBadge,
                        ...(product.is_active ? styles.statusActive : styles.statusInactive)
                      }}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div style={styles.productDetails}>
                      <div style={styles.productDetail}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        {product.brand || 'No brand'}
                      </div>
                      
                      <div style={styles.productDetail}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        {product.series || 'No series'}
                      </div>
                      
                      <div style={styles.productDetail}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {getCategoryName(product.category_id)}
                      </div>
                    </div>
                    
                    <div style={styles.productActions}>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(product)}
                        style={{
                          ...styles.actionButton,
                          ...styles.toggleButton
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = styles.toggleButtonHover.backgroundColor;
                          e.currentTarget.style.transform = styles.toggleButtonHover.transform;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = styles.toggleButton.backgroundColor;
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        {product.is_active ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                            Deactivate
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Activate
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleOpenModal(product)}
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
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
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
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div style={styles.modalOverlay} onClick={handleCloseModal}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {editingProduct ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    )}
                  </svg>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
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

                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label htmlFor="name" style={styles.label}>
                      Product Name *
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
                      placeholder="Enter product name"
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
                    <label htmlFor="brand" style={styles.label}>
                      Brand
                    </label>
                    <input
                      id="brand"
                      type="text"
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      style={styles.input}
                      placeholder="Enter brand name"
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
                    <label htmlFor="series" style={styles.label}>
                      Series
                    </label>
                    <input
                      id="series"
                      type="text"
                      value={formData.series}
                      onChange={(e) =>
                        setFormData({ ...formData, series: e.target.value })
                      }
                      style={styles.input}
                      placeholder="Enter series name"
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
                    <label htmlFor="category_id" style={styles.label}>
                      Category
                    </label>
                    <select
                      id="category_id"
                      value={formData.category_id}
                      onChange={(e) =>
                        setFormData({ ...formData, category_id: e.target.value })
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
                      <option value="">None</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="technical_overview" style={styles.label}>
                    Technical Overview
                  </label>
                  <textarea
                    id="technical_overview"
                    value={formData.technical_overview}
                    onChange={(e) =>
                      setFormData({ ...formData, technical_overview: e.target.value })
                    }
                    style={styles.textarea}
                    placeholder="Enter technical overview"
                    rows={3}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="typical_application" style={styles.label}>
                    Typical Application *
                  </label>
                  <textarea
                    id="typical_application"
                    value={formData.typical_application}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        typical_application: e.target.value,
                      })
                    }
                    style={styles.textarea}
                    placeholder="Enter typical application (required)"
                    rows={3}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="datasheet_url" style={styles.label}>
                    Datasheet URL
                  </label>
                  <input
                    id="datasheet_url"
                    type="url"
                    value={formData.datasheet_url}
                    onChange={(e) =>
                      setFormData({ ...formData, datasheet_url: e.target.value })
                    }
                    style={styles.input}
                    placeholder="https://example.com/datasheet.pdf"
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
                  <label style={styles.label}>Product Images</label>
                  {formData.images.length > 0 && (
                    <div style={styles.imagePreviewGrid}>
                      {formData.images.map((imageUrl, index) => {
                        const fullImageUrl = getImageUrl(imageUrl);
                        return (
                          <div key={`url-${index}`} style={styles.imagePreviewItem}>
                            <img 
                              src={fullImageUrl} 
                              alt={`Image ${index + 1}`}
                              style={styles.imagePreview}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              style={styles.removePreviewButton}
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <div style={styles.imageInputContainer}>
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      style={styles.input}
                      placeholder="Enter image URL (http:// or https://)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImage();
                        }
                      }}
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
                    <button
                      type="button"
                      onClick={handleAddImage}
                      style={styles.addImageButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      Add Image
                    </button>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                      }
                      style={styles.checkbox}
                    />
                    <span>Product is active</span>
                  </label>
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
                    ) : editingProduct ? 'Update Product' : 'Create Product'}
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