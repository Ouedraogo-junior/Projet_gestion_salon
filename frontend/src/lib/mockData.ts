// Données mock pour l'application
export interface Client {
  id: string;
  nom: string;
  telephone: string;
  visites: number;
  pointsFidelite: number;
  derniereVisite: string;
}

export interface Produit {
  id: string;
  nom: string;
  reference: string;
  categorie: string;
  prix: number;
  stock: number;
  image?: string;
}

export interface Vente {
  id: string;
  date: string;
  clientId?: string;
  articles: { produitId: string; quantite: number; prix: number }[];
  total: number;
  methodePaiement: 'Espèces' | 'Mobile Money' | 'Crédit';
}

export interface RendezVous {
  id: string;
  clientId: string;
  date: string;
  heure: string;
  service: string;
  duree: number;
  statut: 'Confirmé' | 'En attente' | 'Annulé';
}

export interface CampagneSMS {
  id: string;
  type: 'Anniversaires' | 'Promotions' | 'Rappels RDV';
  date: string;
  destinataires: number;
  message: string;
  statut: 'Programmé' | 'Envoyé' | 'Échoué';
}

// Données mock
export const clientsMock: Client[] = [
  {
    id: '1',
    nom: 'Amara Traoré',
    telephone: '+226 70 12 34 56',
    visites: 8,
    pointsFidelite: 240,
    derniereVisite: '2025-01-15',
  },
  {
    id: '2',
    nom: 'Fatoumata Sawadogo',
    telephone: '+226 71 23 45 67',
    visites: 5,
    pointsFidelite: 150,
    derniereVisite: '2025-01-18',
  },
  {
    id: '3',
    nom: 'Ibrahim Ouédraogo',
    telephone: '+226 72 34 56 78',
    visites: 12,
    pointsFidelite: 360,
    derniereVisite: '2025-01-20',
  },
  {
    id: '4',
    nom: 'Aïcha Compaoré',
    telephone: '+226 73 45 67 89',
    visites: 3,
    pointsFidelite: 90,
    derniereVisite: '2025-01-12',
  },
];

export const produitsMock: Produit[] = [
  {
    id: '1',
    nom: 'Cire de torsade',
    reference: 'CIR-001',
    categorie: 'Produits coiffage',
    prix: 3500,
    stock: 45,
  },
  {
    id: '2',
    nom: 'Huile de coco bio',
    reference: 'HUI-002',
    categorie: 'Soins',
    prix: 5000,
    stock: 8,
  },
  {
    id: '3',
    nom: 'Gel aloe vera',
    reference: 'GEL-003',
    categorie: 'Soins',
    prix: 4500,
    stock: 22,
  },
  {
    id: '4',
    nom: 'Peigne à dents larges',
    reference: 'PEI-004',
    categorie: 'Accessoires',
    prix: 2000,
    stock: 3,
  },
  {
    id: '5',
    nom: 'Baume réparateur',
    reference: 'BAU-005',
    categorie: 'Soins',
    prix: 6000,
    stock: 35,
  },
];

export const ventesMock: Vente[] = [
  {
    id: '1',
    date: '2025-01-22',
    clientId: '1',
    articles: [{ produitId: '1', quantite: 2, prix: 3500 }],
    total: 7000,
    methodePaiement: 'Mobile Money',
  },
  {
    id: '2',
    date: '2025-01-22',
    articles: [
      { produitId: '2', quantite: 1, prix: 5000 },
      { produitId: '3', quantite: 1, prix: 4500 },
    ],
    total: 9500,
    methodePaiement: 'Espèces',
  },
  {
    id: '3',
    date: '2025-01-21',
    clientId: '3',
    articles: [{ produitId: '5', quantite: 1, prix: 6000 }],
    total: 6000,
    methodePaiement: 'Crédit',
  },
];

export const rendezVousMock: RendezVous[] = [
  {
    id: '1',
    clientId: '1',
    date: '2025-01-23',
    heure: '10:00',
    service: 'Entretien dreadlocks',
    duree: 120,
    statut: 'Confirmé',
  },
  {
    id: '2',
    clientId: '2',
    date: '2025-01-23',
    heure: '14:00',
    service: 'Création dreadlocks',
    duree: 180,
    statut: 'En attente',
  },
  {
    id: '3',
    clientId: '4',
    date: '2025-01-24',
    heure: '09:00',
    service: 'Retouche racines',
    duree: 90,
    statut: 'Confirmé',
  },
];

export const campagnesSMSMock: CampagneSMS[] = [
  {
    id: '1',
    type: 'Promotions',
    date: '2025-01-25',
    destinataires: 45,
    message: '🌀 Promo spéciale! -20% sur tous les soins jusqu\'au 31/01. RDV au Salon Afro Style!',
    statut: 'Programmé',
  },
  {
    id: '2',
    type: 'Rappels RDV',
    date: '2025-01-22',
    destinataires: 3,
    message: 'Rappel: Votre RDV au Salon Afro Style demain à 10h. À bientôt! 😊',
    statut: 'Envoyé',
  },
];

// Statistiques pour le dashboard
export const getVentesAujourdhui = () => {
  const today = new Date().toISOString().split('T')[0];
  return ventesMock
    .filter((v) => v.date === today)
    .reduce((sum, v) => sum + v.total, 0);
};

export const getClientsAujourdhui = () => {
  const today = new Date().toISOString().split('T')[0];
  return ventesMock.filter((v) => v.date === today).length;
};

export const getProduitsStockBas = () => {
  return produitsMock.filter((p) => p.stock < 10).length;
};
