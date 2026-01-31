// src/contexts/NotificationContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { notificationApi, type Notification } from '@/services/notificationApi';

interface NotificationContextType {
  notifications: Notification[];
  count: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: (nonLuesOnly?: boolean) => Promise<void>;
  fetchCount: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  deleteAllRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
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

  // Rafraîchir tout
  const refresh = useCallback(async () => {
    await fetchCount();
  }, [fetchCount]);

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

  // Charger immédiatement au montage + Polling toutes les 30 secondes
  useEffect(() => {
    //console.log('🔔 NotificationProvider: Initialisation');
    
    // Charger immédiatement
    fetchCount();
    
    // Puis continuer le polling
    const interval = setInterval(() => {
      //console.log('🔄 NotificationProvider: Polling...');
      fetchCount();
    }, 30000); // 30 secondes
    
    return () => {
      //console.log('🔔 NotificationProvider: Nettoyage');
      clearInterval(interval);
    };
  }, [fetchCount]);

  const value = {
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
    refresh,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications doit être utilisé dans un NotificationProvider');
  }
  return context;
}