// src/config/rapportPermissions.ts

export type UserRole = 'gestionnaire' | 'gerant' | 'coiffeur';

export const RAPPORT_PERMISSIONS = {
  gestionnaire: {
    tabs: ['global', 'ventes', 'tresorerie', 'comparaison'],
    visibleSections: {
      ca_total: true,
      ca_details: true,
      benefices: true,
      depenses: true,
      salaires: true,
      tresorerie: true,
      top_prestations: true,
      top_produits: true,
      nb_ventes_jour: true,
    },
  },
  gerant: {
    tabs: ['global', 'ventes'], // Pas de trésorerie ni comparaison
    visibleSections: {
      ca_total: false, // Masqué
      ca_details: true,
      benefices: false,
      depenses: false,
      salaires: false,
      tresorerie: false,
      top_prestations: true,
      top_produits: true,
      nb_ventes_jour: true, // Remplace le CA
    },
  },
  coiffeur: {
    tabs: ['global', 'ventes'],
    visibleSections: {
      ca_total: false, // Masqué
      ca_details: true,
      benefices: false,
      depenses: false,
      salaires: false,
      tresorerie: false,
      top_prestations: true,
      top_produits: true,
      nb_ventes_jour: true, // Remplace le CA
    },
  },
} as const;

export const canViewTab = (role: UserRole, tab: string): boolean => {
  return RAPPORT_PERMISSIONS[role].tabs.includes(tab);
};

export const canViewSection = (role: UserRole, section: keyof typeof RAPPORT_PERMISSIONS.gestionnaire.visibleSections): boolean => {
  return RAPPORT_PERMISSIONS[role].visibleSections[section];
};