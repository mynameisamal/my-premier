'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../../../lib/firebase';
import styles from './products.module.css';

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
  const [imageFiles, setImageFiles] = useState([]);
  const [datasheetFile, setDatasheetFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({
    images: [],
    datasheet: 0,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      Promise.all([fetchProducts(user), fetchCategories(user)]);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchProducts = async (user) => {
    setIsLoading(true);
    setError('');
    try {
      const token = await user.getIdToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const res = await fetch('http://localhost:8080/admin/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async (user) => {
    try {
      const token = await user.getIdToken();
      if (!token) {
        return;
      }

      const res = await fetch('http://localhost:8080/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
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
        images: Array.isArray(product.images) ? [...product.images] : [],
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
    setImageFiles([]);
    setDatasheetFile(null);
    setUploadProgress({
      images: [],
      datasheet: 0,
    });
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
    setImageFiles([]);
    setDatasheetFile(null);
    setUploadProgress({
      images: [],
      datasheet: 0,
    });
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

  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const handleRemoveImageFile = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDatasheetFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setError('Datasheet must be a PDF file');
        e.target.value = '';
        return;
      }
      setDatasheetFile(file);
      setError('');
    }
  };

  const handleRemoveDatasheetFile = () => {
    setDatasheetFile(null);
  };

  const uploadImageFile = async (file, index, productId = null) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const path = productId
      ? `products/${productId}/images/${filename}`
      : `products/temp/images/${filename}`;
    const storageRef = ref(storage, path);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress((prev) => ({
            ...prev,
            images: prev.images.map((p, i) => (i === index ? progress : p)),
          }));
        },
        (error) => {
          console.error('Error uploading image:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };

  const uploadDatasheetFile = async (file, productId = null) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const path = productId
      ? `products/${productId}/datasheet/${filename}`
      : `products/temp/datasheet/${filename}`;
    const storageRef = ref(storage, path);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress((prev) => ({
            ...prev,
            datasheet: progress,
          }));
        },
        (error) => {
          console.error('Error uploading datasheet:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      const token = await user.getIdToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      if (!formData.typical_application.trim()) {
        throw new Error('Typical application is required');
      }

      let imageUrls = [...formData.images];
      let datasheetUrl = formData.datasheet_url.trim();

      // Upload image files if any
      if (imageFiles.length > 0) {
        setUploadProgress((prev) => ({
          ...prev,
          images: new Array(imageFiles.length).fill(0),
        }));

        const uploadPromises = imageFiles.map((file, index) =>
          uploadImageFile(file, index)
        );
        const uploadedUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      // Upload datasheet file if any
      if (datasheetFile) {
        setUploadProgress((prev) => ({ ...prev, datasheet: 0 }));
        datasheetUrl = await uploadDatasheetFile(datasheetFile);
      }

      const url = editingProduct
        ? `http://localhost:8080/admin/products/${editingProduct.id}`
        : 'http://localhost:8080/admin/products';

      const method = editingProduct ? 'PUT' : 'POST';

      const body = {
        name: formData.name.trim() || '',
        brand: formData.brand.trim() || '',
        series: formData.series.trim() || '',
        category_id: formData.category_id || null,
        technical_overview: formData.technical_overview.trim() || '',
        typical_application: formData.typical_application.trim(),
        images: imageUrls,
        datasheet_url: datasheetUrl,
        is_active: formData.is_active,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save product');
      }

      // Refresh products list
      await fetchProducts(user);
      handleCloseModal();
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
      setUploadProgress({
        images: [],
        datasheet: 0,
      });
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      const token = await user.getIdToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const res = await fetch(`http://localhost:8080/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete product');
      }

      // Refresh products list
      await fetchProducts(user);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleToggleActive = async (product) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      const token = await user.getIdToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const res = await fetch(`http://localhost:8080/admin/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...product,
          is_active: !product.is_active,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to toggle product status');
      }

      // Refresh products list
      await fetchProducts(user);
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

  if (isLoading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Product Management</h1>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className={styles.addButton}
        >
          + Add Product
        </button>
      </div>

      {error && !isModalOpen && (
        <div className={styles.errorMessage}>{error}</div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Brand</th>
              <th>Series</th>
              <th>Category</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.emptyCell}>
                  No products found. Click "Add Product" to create one.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name || '—'}</td>
                  <td>{product.brand || '—'}</td>
                  <td>{product.series || '—'}</td>
                  <td>{getCategoryName(product.category_id)}</td>
                  <td>
                    <label className={styles.toggleSwitch}>
                      <input
                        type="checkbox"
                        checked={product.is_active !== undefined ? product.is_active : true}
                        onChange={() => handleToggleActive(product)}
                      />
                      <span className={styles.toggleSlider}></span>
                    </label>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        onClick={() => handleOpenModal(product)}
                        className={styles.editButton}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {error && <div className={styles.errorMessage}>{error}</div>}

              <div className={styles.formGroup}>
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={styles.input}
                  placeholder="Enter product name"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="brand">Brand</label>
                <input
                  id="brand"
                  type="text"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  className={styles.input}
                  placeholder="Enter brand name"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="series">Series</label>
                <input
                  id="series"
                  type="text"
                  value={formData.series}
                  onChange={(e) =>
                    setFormData({ ...formData, series: e.target.value })
                  }
                  className={styles.input}
                  placeholder="Enter series name"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="category_id">Category</label>
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className={styles.select}
                >
                  <option value="">None</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="technical_overview">Technical Overview</label>
                <textarea
                  id="technical_overview"
                  value={formData.technical_overview}
                  onChange={(e) =>
                    setFormData({ ...formData, technical_overview: e.target.value })
                  }
                  className={styles.textarea}
                  placeholder="Enter technical overview"
                  rows={4}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="typical_application">
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
                  className={styles.textarea}
                  placeholder="Enter typical application (required)"
                  rows={4}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="datasheet">Datasheet (PDF)</label>
                <input
                  id="datasheet"
                  type="file"
                  accept=".pdf"
                  onChange={handleDatasheetFileChange}
                  className={styles.input}
                />
                {datasheetFile && (
                  <div className={styles.fileInfo}>
                    <span>{datasheetFile.name}</span>
                    {uploadProgress.datasheet > 0 && uploadProgress.datasheet < 100 && (
                      <span>Uploading: {Math.round(uploadProgress.datasheet)}%</span>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveDatasheetFile}
                      className={styles.removeFileButton}
                    >
                      Remove
                    </button>
                  </div>
                )}
                {formData.datasheet_url && !datasheetFile && (
                  <div className={styles.fileInfo}>
                    <span>Current: {formData.datasheet_url}</span>
                  </div>
                )}
                <p className={styles.helpText}>Or enter URL below</p>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="datasheet_url">Datasheet URL</label>
                <input
                  id="datasheet_url"
                  type="url"
                  value={formData.datasheet_url}
                  onChange={(e) =>
                    setFormData({ ...formData, datasheet_url: e.target.value })
                  }
                  className={styles.input}
                  placeholder="https://example.com/datasheet.pdf"
                  disabled={!!datasheetFile}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Product Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFileChange}
                  className={styles.input}
                />
                {imageFiles.length > 0 && (
                  <div className={styles.imageFilesList}>
                    {imageFiles.map((file, index) => (
                      <div key={index} className={styles.fileInfo}>
                        <span>{file.name}</span>
                        {uploadProgress.images[index] > 0 &&
                          uploadProgress.images[index] < 100 && (
                            <span>
                              Uploading: {Math.round(uploadProgress.images[index])}%
                            </span>
                          )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImageFile(index)}
                          className={styles.removeFileButton}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className={styles.helpText}>Or add URLs below</p>
              </div>

              <div className={styles.formGroup}>
                <label>Image URLs</label>
                <div className={styles.imageInputContainer}>
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className={styles.input}
                    placeholder="Enter image URL"
                    disabled={imageFiles.length > 0 && uploadProgress.images.some(p => p > 0 && p < 100)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImage();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className={styles.addImageButton}
                    disabled={imageFiles.length > 0 && uploadProgress.images.some(p => p > 0 && p < 100)}
                  >
                    Add
                  </button>
                </div>
                {formData.images.length > 0 && (
                  <div className={styles.imageList}>
                    {formData.images.map((imageUrl, index) => (
                      <div key={index} className={styles.imageItem}>
                        <span className={styles.imageUrl}>{imageUrl}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className={styles.removeImageButton}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className={styles.checkbox}
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={styles.cancelButton}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Saving...'
                    : editingProduct
                    ? 'Update'
                    : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
