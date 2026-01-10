'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { apiGet, apiPost } from '../../../../lib/api';
import Link from 'next/link';
import styles from '../supports.module.css';

export default function SupportDetailPage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [supportInfo, setSupportInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const router = useRouter();
  const params = useParams();
  const supportId = params?.id;
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to be ready
    if (authLoading) {
      return;
    }

    // If no user, redirect will be handled by layout
    if (!user) {
      return;
    }

    if (supportId) {
      fetchSupportInfo();
      fetchMessages();
    }
  }, [user, authLoading, supportId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSupportInfo = async () => {
    try {
      const supports = await apiGet('/admin/supports');
      if (supports) {
        const support = Array.isArray(supports)
          ? supports.find((s) => s.id === supportId)
          : null;
        setSupportInfo(support);
      }
    } catch (error) {
      console.error('Error fetching support info:', error);
    }
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet(`/supports/${supportId}/messages`);
      if (data) {
        const sortedMessages = Array.isArray(data)
          ? [...data].sort((a, b) => {
              const dateA = new Date(a.created_at);
              const dateB = new Date(b.created_at);
              return dateA - dateB;
            })
          : [];
        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || isSending) return;

    if (!user) {
      router.push('/login');
      return;
    }

    setIsSending(true);
    try {
      const result = await apiPost(
        `/supports/${supportId}/messages`,
        {
          message: messageText.trim(),
          sender_type: 'admin',
        }
      );

      if (result) {
        // Clear input
        setMessageText('');

        // Refresh messages
        await fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return '';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.chatHeader}>
          <Link href="/dashboard/supports" className={styles.backLink}>
            ← Back to Support Tickets
          </Link>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.chatHeader}>
        <Link href="/dashboard/supports" className={styles.backLink}>
          ← Back to Support Tickets
        </Link>
        {supportInfo && (
          <div className={styles.supportInfo}>
            <span className={styles.supportId}>Ticket #{supportInfo.id}</span>
            <span
              className={`${styles.status} ${styles[`status${supportInfo.status.charAt(0).toUpperCase() + supportInfo.status.slice(1)}`]}`}
            >
              {supportInfo.status}
            </span>
          </div>
        )}
      </div>

      {supportInfo && (
        <div className={styles.supportDetail}>
          <div className={styles.detailSection}>
            <h3 className={styles.detailTitle}>Support Details</h3>
            <div className={styles.detailContent}>
              {supportInfo.data?.issue_type && (
                <div className={styles.detailField}>
                  <span className={styles.detailLabel}>Issue Type:</span>
                  <span className={styles.detailValue}>
                    {supportInfo.data.issue_type}
                  </span>
                </div>
              )}
              {supportInfo.data?.description && (
                <div className={styles.detailField}>
                  <span className={styles.detailLabel}>Description:</span>
                  <span className={styles.detailValue}>
                    {supportInfo.data.description}
                  </span>
                </div>
              )}
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>Status:</span>
                <span
                  className={`${styles.status} ${styles[`status${supportInfo.status.charAt(0).toUpperCase() + supportInfo.status.slice(1)}`]}`}
                >
                  {supportInfo.status}
                </span>
              </div>
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>Created At:</span>
                <span className={styles.detailValue}>
                  {formatDate(supportInfo.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.chatContainer}>
        <div className={styles.messagesList}>
          {messages.length === 0 ? (
            <div className={styles.emptyMessages}>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${
                  message.sender_type === 'admin'
                    ? styles.messageAdmin
                    : styles.messageClient
                }`}
              >
                <div className={styles.messageContent}>
                  <div className={styles.messageText}>{message.message}</div>
                  <div className={styles.messageTime}>
                    {formatDate(message.created_at)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className={styles.messageForm}>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            className={styles.messageInput}
            disabled={isSending}
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={isSending || !messageText.trim()}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
