// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { notificationApi, type Notification } from '@/services/notificationApi';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les notifications
  const fetchNotifications = useCallback(async (nonLuesOnly = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationApi.getNotifications(nonLuesOnly);
      setNotifications(response.data);
      setCount(response.meta.non_lues);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
      console.error('Erreur notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger le compteur uniquement
  const fetchCount = useCallback(async () => {
    try {
      const newCount = await notificationApi.getCount();
      setCount(newCount);
    } catch (err) {
      console.error('Erreur compteur:', err);
    }
  }, []);

  // Marquer comme lu
  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, lu: true, lu_at: new Date().toISOString() } : n)
      );
      setCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erreur marquage lu:', err);
    }
  }, []);

  // Marquer toutes comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, lu: true, lu_at: new Date().toISOString() }))
      );
      setCount(0);
    } catch (err) {
      console.error('Erreur marquage tout lu:', err);
    }
  }, []);

  // Supprimer une notification
  const deleteNotification = useCallback(async (id: number) => {
    try {
      await notificationApi.deleteNotification(id);
      const notification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notification && !notification.lu) {
        setCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  }, [notifications]);

  // Supprimer toutes les lues
  const deleteAllRead = useCallback(async () => {
    try {
      await notificationApi.deleteAllRead();
      setNotifications(prev => prev.filter(n => !n.lu));
    } catch (err) {
      console.error('Erreur suppression lues:', err);
    }
  }, []);

  // Charger immédiatement au montage du composant + Polling toutes les 30 secondes
  useEffect(() => {
    // Charger immédiatement
    fetchCount();
    
    // Puis continuer le polling
    const interval = setInterval(fetchCount, 30000); // 30 secondes
    
    return () => clearInterval(interval);
  }, [fetchCount]);

  return {
    notifications,
    count,
    loading,
    error,
    fetchNotifications,
    fetchCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  };
}