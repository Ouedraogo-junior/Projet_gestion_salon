// src/services/rapportApi.ts

import axios from '../lib/axios';
import type {
  PeriodeFilters,
  RapportGlobal,
  VentesDetail,
  Tresorerie,
  ComparaisonPeriodes,
  ApiResponse,
} from '../types/rapport.types';

/**
 * Service API pour les rapports comptables
 * Endpoints: /api/rapports/*
 */
export const rapportApi = {
  /**
   * Rapport global : CA, dépenses, bénéfices
   * 
   * @param filters - Filtres de période
   * @returns Rapport financier complet
   * 
   * @example
   * const rapport = await rapportApi.getGlobal({
   *   type: 'mois',
   *   date_debut: '2026-01-01',
   *   date_fin: '2026-01-31',
   * });
   */
  async getGlobal(filters: PeriodeFilters): Promise<ApiResponse<RapportGlobal>> {
    const { data } = await axios.get('/rapports/global', { params: filters });
    return data;
  },

  /**
   * Détail des ventes par période
   * Inclut : ventes par jour, par mode paiement, top prestations/produits
   * 
   * @param filters - Filtres de période
   * @returns Statistiques détaillées des ventes
   */
  async getVentesDetail(filters: PeriodeFilters): Promise<ApiResponse<VentesDetail>> {
    const { data } = await axios.get('/rapports/ventes-detail', { params: filters });
    return data;
  },

  /**
   * Trésorerie : encaissements et décaissements
   * Utilisé pour le suivi du cash flow réel
   * 
   * @param filters - Filtres de période
   * @returns État de la trésorerie
   */
  async getTresorerie(filters: PeriodeFilters): Promise<ApiResponse<Tresorerie>> {
    const { data } = await axios.get('/rapports/tresorerie', { params: filters });
    return data;
  },

  /**
   * Comparaison avec la période précédente
   * Calcule automatiquement l'évolution en %
   * 
   * @param filters - Filtres de période actuelle
   * @returns Comparaison avec période N-1
   */
  async getComparaison(filters: PeriodeFilters): Promise<ApiResponse<ComparaisonPeriodes>> {
    const { data } = await axios.get('/rapports/comparaison-periodes', { params: filters });
    return data;
  },

  /**
   * Helper : Générer les filtres pour une période prédéfinie
   * 
   * @example
   * const filtresMois = rapportApi.getPeriodePreset('mois');
   * const rapport = await rapportApi.getGlobal(filtresMois);
   */
  getPeriodePreset(type: 'jour' | 'semaine' | 'mois' | 'annee'): PeriodeFilters {
    const today = new Date();
    let date_debut: string;
    let date_fin: string;

    switch (type) {
      case 'jour':
        date_debut = today.toISOString().split('T')[0];
        date_fin = date_debut;
        break;

      case 'semaine': {
        const first = today.getDate() - today.getDay() + 1; // Lundi
        const monday = new Date(today.setDate(first));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        date_debut = monday.toISOString().split('T')[0];
        date_fin = sunday.toISOString().split('T')[0];
        break;
      }

      case 'mois': {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        date_debut = firstDay.toISOString().split('T')[0];
        date_fin = lastDay.toISOString().split('T')[0];
        break;
      }

      case 'annee':
        date_debut = `${today.getFullYear()}-01-01`;
        date_fin = `${today.getFullYear()}-12-31`;
        break;

      default:
        date_debut = today.toISOString().split('T')[0];
        date_fin = date_debut;
    }

    return {
      type,
      date_debut,
      date_fin,
    };
  },

  /**
   * Helper : Générer les filtres pour le mois spécifique
   */
  getMoisFilters(mois: number, annee: number): PeriodeFilters {
    const firstDay = new Date(annee, mois - 1, 1);
    const lastDay = new Date(annee, mois, 0);

    return {
      type: 'mois',
      date_debut: firstDay.toISOString().split('T')[0],
      date_fin: lastDay.toISOString().split('T')[0],
      mois,
      annee,
    };
  },

  /**
   * Helper : Générer les filtres pour une semaine spécifique
   */
  getSemaineFilters(semaine: number, annee: number): PeriodeFilters {
    // Calculer le premier jour de la semaine
    const firstDayOfYear = new Date(annee, 0, 1);
    const daysOffset = (semaine - 1) * 7;
    const monday = new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + daysOffset));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      type: 'semaine',
      date_debut: monday.toISOString().split('T')[0],
      date_fin: sunday.toISOString().split('T')[0],
      semaine,
      annee,
    };
  },

  /**
   * Helper : Générer les filtres pour une année complète
   */
  getAnneeFilters(annee: number): PeriodeFilters {
    return {
      type: 'annee',
      date_debut: `${annee}-01-01`,
      date_fin: `${annee}-12-31`,
      annee,
    };
  },

  /**
   * Helper : Générer les filtres pour une période personnalisée
   */
  getCustomFilters(date_debut: string, date_fin: string): PeriodeFilters {
    return {
      type: 'personnalisee',
      date_debut,
      date_fin,
    };
  },
};

export default rapportApi;