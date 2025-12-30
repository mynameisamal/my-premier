'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  // Always initialize with empty array
  const [requests, setRequests] = useState([]);
  const [supports, setSupports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      // Move isLoading TRUE until data actually fetched
      const fetchData = async () => {
        setIsLoading(true);
        const token = await user.getIdToken();
        if (!token) {
          setIsLoading(false);
          return;
        }

        try {
          // Fetch requests
          const requestsRes = await fetch('http://localhost:8080/admin/requests', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const requestsData = await requestsRes.json();
          setRequests(Array.isArray(requestsData) ? requestsData : []);

          // Fetch supports
          const supportsRes = await fetch('http://localhost:8080/admin/supports', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const supportsData = await supportsRes.json();
          setSupports(Array.isArray(supportsData) ? supportsData : []);
        } catch (error) {
          setRequests([]);
          setSupports([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      // Simple error alert, keep it readable
      alert('Failed to logout');
    }
  };

  const handleStatusUpdate = async (supportId, newStatus) => {
    setUpdatingStatus({ ...updatingStatus, [supportId]: true });

    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      if (!token) return;

      const res = await fetch(`http://localhost:8080/admin/support/${supportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      // Update local state
      setSupports(prevSupports =>
        Array.isArray(prevSupports)
          ? prevSupports.map(support =>
              support.id === supportId ? { ...support, status: newStatus } : support
            )
          : []
      );
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
      return date.toLocaleString();
    } catch {
      return 'N/A';
    }
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1>Admin Dashboard</h1>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            background: '#e53e3e',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: 'auto'
          }}
        >
          Logout
        </button>
      </div>

      <section className={styles.section}>
        <h2>Request Info</h2>
        <ul>
          {Array.isArray(requests) && requests.length > 0
            ? requests.map(r => (
                <li key={r.id}>{r.name} - {r.email}</li>
              ))
            : <li>No requests found.</li>}
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Support Requests</h2>
        {Array.isArray(supports) && supports.length === 0 ? (
          <p>No support requests found.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Data</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(supports) && supports.map(support => (
                <tr key={support.id}>
                  <td>{support.id}</td>
                  <td>
                    <span className={`${styles.status} ${styles[`status${support.status.charAt(0).toUpperCase() + support.status.slice(1)}`]}`}>
                      {support.status}
                    </span>
                  </td>
                  <td>{formatDate(support.created_at)}</td>
                  <td>
                    <div className={styles.dataCell}>
                      {support.data ? JSON.stringify(support.data, null, 2) : 'N/A'}
                    </div>
                  </td>
                  <td>
                    <select
                      value={support.status}
                      onChange={(e) => handleStatusUpdate(support.id, e.target.value)}
                      disabled={updatingStatus[support.id]}
                      className={styles.select}
                    >
                      <option value="open">Open</option>
                      <option value="responded">Responded</option>
                      <option value="closed">Closed</option>
                    </select>
                    {updatingStatus[support.id] && (
                      <span className={styles.updating}>Updating...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
