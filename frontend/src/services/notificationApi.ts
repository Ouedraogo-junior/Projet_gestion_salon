// src/services/notificationApi.ts
import { tokenStorage } from '@/utils/tokenStorage';

const API_BASE_URL = 'http://localhost:8000/api';

export interface Notification {
  id: number;
  user_id: number | null;
  type: 'stock_critique' | 'stock_alerte' | 'nouveau_rdv' | 'rappel_rdv_veille' | 'rappel_rdv_jour';
  titre: string;
  message: string;
  data: any;
  priorite: 'basse' | 'normale' | 'haute' | 'critique';
  lu: boolean;
  lu_at: string | null;
  lien: string | null;
  created_at: string;
}

interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  meta: {
    non_lues: number;
    total: number;
  };
}

interface CountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

class NotificationApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = tokenStorage.getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: 'Erreur serveur' 
        }));
        throw new Error(error.message || `Erreur ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Récupérer les notifications
  async getNotifications(nonLuesOnly = false, limit = 50): Promise<NotificationsResponse> {
    const params = new URLSearchParams({
      non_lues_only: nonLuesOnly.toString(),
      limit: limit.toString(),
    });
    return this.request(`/notifications?${params}`);
  }

  // Compter les notifications non lues
  async getCount(): Promise<number> {
    const response: CountResponse = await this.request('/notifications/count');
    return response.data.count;
  }

  // Marquer une notification comme lue
  async markAsRead(id: number): Promise<void> {
    await this.request(`/notifications/${id}/read`, { method: 'POST' });
  }

  // Marquer toutes comme lues
  async markAllAsRead(): Promise<void> {
    await this.request('/notifications/read-all', { method: 'POST' });
  }

  // Supprimer une notification
  async deleteNotification(id: number): Promise<void> {
    await this.request(`/notifications/${id}`, { method: 'DELETE' });
  }

  // Supprimer toutes les notifications lues
  async deleteAllRead(): Promise<void> {
    await this.request('/notifications/read/all', { method: 'DELETE' });
  }
}

export const notificationApi = new NotificationApiService();