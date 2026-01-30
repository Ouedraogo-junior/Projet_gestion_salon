// src/app/components/NotificationPanel.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Package, 
  Calendar, 
  Clock, 
  X, 
  Check, 
  Trash2,
  CheckCheck 
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification } from '@/services/notificationApi';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  } = useNotifications();

  // Charger les notifications quand le panel s'ouvre
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(false); // Charger toutes les notifications
    }
  }, [isOpen, fetchNotifications]);

  // Gérer le clic sur une notification
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.lu) {
      await markAsRead(notification.id);
    }
    if (notification.lien) {
      navigate(notification.lien);
      onClose();
    }
  };

  // Icône selon le type
  const getIcon = (type: string, priorite: string) => {
    const iconClass = priorite === 'critique' 
      ? 'text-red-500' 
      : priorite === 'haute' 
      ? 'text-orange-500' 
      : 'text-blue-500';

    switch (type) {
      case 'stock_critique':
      case 'stock_alerte':
        return <Package className={`w-5 h-5 ${iconClass}`} />;
      case 'nouveau_rdv':
        return <Calendar className={`w-5 h-5 ${iconClass}`} />;
      case 'rappel_rdv_veille':
      case 'rappel_rdv_jour':
        return <Clock className={`w-5 h-5 ${iconClass}`} />;
      default:
        return <Bell className={`w-5 h-5 ${iconClass}`} />;
    }
  };

  // Formater la date
  const formatDate = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return notifDate.toLocaleDateString('fr-FR');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-6 top-20 w-96 max-h-[600px] bg-white shadow-2xl rounded-lg z-50 flex flex-col border border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={markAllAsRead}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Tout marquer comme lu"
                >
                  <CheckCheck className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={deleteAllRead}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Supprimer les lues"
                >
                  <Trash2 className="w-5 h-5 text-gray-600" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Liste des notifications */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-400">Chargement...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <Bell className="w-12 h-12 mb-2 opacity-50" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative group ${
                    !notification.lu ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type, notification.priorite)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        {notification.titre}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          {formatDate(notification.created_at)}
                        </p>
                        {!notification.lu && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions au survol */}
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {!notification.lu && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="p-1 bg-white hover:bg-gray-100 rounded border border-gray-200"
                        title="Marquer comme lu"
                      >
                        <Check className="w-3 h-3 text-green-600" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="p-1 bg-white hover:bg-gray-100 rounded border border-gray-200"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}