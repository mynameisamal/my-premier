'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import styles from './categories.module.css';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', parent_id: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      fetchCategories(user);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchCategories = async (user) => {
    setIsLoading(true);
    setError('');
    try {
      const token = await user.getIdToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const res = await fetch('http://localhost:8080/admin/categories', {
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
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      const token = await user.getIdToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const url = editingCategory
        ? `http://localhost:8080/admin/categories/${editingCategory.id}`
        : 'http://localhost:8080/admin/categories';

      const method = editingCategory ? 'PUT' : 'POST';

      const body = {
        name: formData.name.trim(),
        parent_id: formData.parent_id || null,
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
        throw new Error(errorData.message || 'Failed to save category');
      }

      // Refresh categories list
      await fetchCategories(user);
      handleCloseModal();
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
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      const token = await user.getIdToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const res = await fetch(`http://localhost:8080/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete category');
      }

      // Refresh categories list
      await fetchCategories(user);
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
        <h1>Category Management</h1>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className={styles.addButton}
        >
          + Add Category
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
              <th>Parent Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="3" className={styles.emptyCell}>
                  No categories found. Click "Add Category" to create one.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{getParentName(category.parent_id)}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        onClick={() => handleOpenModal(category)}
                        className={styles.editButton}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category.id)}
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
              <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
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
                <label htmlFor="name">Category Name *</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className={styles.input}
                  placeholder="Enter category name"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="parent_id">Parent Category (Optional)</label>
                <select
                  id="parent_id"
                  value={formData.parent_id}
                  onChange={(e) =>
                    setFormData({ ...formData, parent_id: e.target.value })
                  }
                  className={styles.select}
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
                    : editingCategory
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
