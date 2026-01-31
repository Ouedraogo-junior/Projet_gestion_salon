// src/app/pages/Clients/components/ClientListe.tsx

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Trophy,
  ImageOff,
  MapPin,
  Calendar,
} from 'lucide-react';
import { clientApi } from '../../../../services/clientApi';
import type { Client, ClientFilters } from '../../../../types/client.types';

interface ClientListeProps {
  onVoirDetails: (client: Client) => void;
  onModifier: (client: Client) => void;
  onRefresh: () => void;
}

export const ClientListe: React.FC<ClientListeProps> = ({
  onVoirDetails,
  onModifier,
  onRefresh,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [photoIndexes, setPhotoIndexes] = useState<Record<number, number>>({});
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState<ClientFilters>({
    search: '',
    is_active: undefined,
    min_points: undefined,
    date_debut: '',
    date_fin: '',
    sort_by: 'created_at',
    sort_order: 'desc',
    per_page: 12,
    page: 1,
  });

  useEffect(() => {
    loadClients();
  }, [currentPage, filters.is_active, filters.min_points, filters.date_debut, filters.date_fin, filters.sort_by, filters.sort_order]);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const response = await clientApi.getClients({
        ...filters,
        page: currentPage,
      });

      if (response.success) {
        setClients(response.data.data);
        setTotalPages(response.data.last_page);
        setTotal(response.data.total);
        
        // Initialiser les index de photos à 0 pour chaque client
        const initialIndexes: Record<number, number> = {};
        response.data.data.forEach((client: Client) => {
          initialIndexes[client.id] = 0;
        });
        setPhotoIndexes(initialIndexes);
      }
    } catch (error: any) {
      console.error('Erreur chargement clients:', error);
      alert('Erreur lors du chargement des clients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadClients();
  };

  const handleFilterChange = (key: keyof ClientFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  const handleSupprimer = async (client: Client) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${client.prenom} ${client.nom} ?`)) {
      return;
    }

    try {
      const response = await clientApi.deleteClient(client.id);
      if (response.success) {
        alert('Client supprimé avec succès');
        onRefresh();
      }
    } catch (error: any) {
      console.error('Erreur suppression client:', error);
      alert('Erreur lors de la suppression du client');
    }
  };

  const nextPhoto = (clientId: number, photosCount: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndexes(prev => ({
      ...prev,
      [clientId]: (prev[clientId] + 1) % photosCount
    }));
  };

  const prevPhoto = (clientId: number, photosCount: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndexes(prev => ({
      ...prev,
      [clientId]: prev[clientId] === 0 ? photosCount - 1 : prev[clientId] - 1
    }));
  };

  const getImageUrl = (photoUrl: string) => {
    let cleanUrl = photoUrl.replace(/^(storage\/)+/, '');
    return `${import.meta.env.VITE_API_URL}/storage/${cleanUrl}`;
  };

  const handleImageError = (photoUrl: string) => {
    setImageErrors(prev => new Set([...prev, photoUrl]));
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            {total} client{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              showFilters ? 'bg-blue-500 text-white' : 'border hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
            Filtres
          </button>
        </div>

        {/* Barre de recherche */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou téléphone..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Rechercher
          </button>
        </form>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium mb-1">Statut</label>
              <select
                value={filters.is_active === undefined ? '' : filters.is_active.toString()}
                onChange={(e) =>
                  handleFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')
                }
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Tous</option>
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Points min.</label>
              <input
                type="number"
                placeholder="Ex: 100"
                value={filters.min_points || ''}
                onChange={(e) => handleFilterChange('min_points', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Trier par</label>
              <select
                value={filters.sort_by}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="created_at">Date d'inscription</option>
                <option value="nom">Nom</option>
                <option value="date_derniere_visite">Dernière visite</option>
                <option value="points_fidelite">Points fidélité</option>
                <option value="montant_total_depense">Montant dépensé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ordre</label>
              <select
                value={filters.sort_order}
                onChange={(e) => handleFilterChange('sort_order', e.target.value as 'asc' | 'desc')}
                className="w-full border rounded px-3 py-2"
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Grille de cards */}
      <div>
        {isLoading ? (
          <div className="p-8 text-center bg-white rounded-lg shadow">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg shadow">
            <p className="text-gray-500">Aucun client trouvé</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {clients.map((client) => {
                const currentPhotoIndex = photoIndexes[client.id] || 0;
                const hasPhotos = client.photos && client.photos.length > 0;
                const currentPhoto = hasPhotos ? client.photos[currentPhotoIndex] : null;

                // LOG DE DÉBOGAGE
                // console.log('=== CLIENT DEBUG ===');
                // console.log('Client:', client.prenom, client.nom);
                // console.log('client.photos:', client.photos);
                // console.log('hasPhotos:', hasPhotos);
                // console.log('currentPhotoIndex:', currentPhotoIndex);
                // console.log('currentPhoto:', currentPhoto);
                // if (currentPhoto) {
                //   const imageUrl = getImageUrl(currentPhoto.photo_url);
                //   console.log('Image URL:', imageUrl);
                // }
                // console.log('===================');

                return (
                  <div
                    key={client.id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden cursor-pointer group"
                    onClick={() => onVoirDetails(client)}
                  >
                    {/* Carrousel de photos */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100">
                      {hasPhotos && currentPhoto ? (
                        <>
                          {imageErrors.has(currentPhoto.photo_url) ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200">
                              <ImageOff size={32} className="text-gray-400 mb-2" />
                              <p className="text-xs text-gray-500">Image non disponible</p>
                            </div>
                          ) : (
                            <img
                              src={getImageUrl(currentPhoto.photo_url)}
                              alt={currentPhoto.description || `Photo ${currentPhoto.type_photo}`}
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(currentPhoto.photo_url)}
                            />
                          )}

                          {/* Badge type photo */}
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded">
                              {currentPhoto.type_photo === 'avant' ? 'Avant' : 'Après'}
                            </span>
                          </div>

                          {/* Indicateurs de photos multiples */}
                          {client.photos.length > 1 && (
                            <>
                              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                                {client.photos.map((_, index) => (
                                  <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full ${
                                      index === currentPhotoIndex
                                        ? 'bg-white'
                                        : 'bg-white bg-opacity-50'
                                    }`}
                                  />
                                ))}
                              </div>

                              {/* Boutons navigation */}
                              <button
                                onClick={(e) => prevPhoto(client.id, client.photos.length, e)}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <ChevronLeft size={20} />
                              </button>
                              <button
                                onClick={(e) => nextPhoto(client.id, client.photos.length, e)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <ChevronRight size={20} />
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <ImageOff size={48} className="text-gray-300 mb-2" />
                          <p className="text-sm text-gray-400">Aucune photo</p>
                        </div>
                      )}
                    </div>

                    {/* Informations du client */}
                    <div className="p-4 space-y-3">
                      {/* Nom et statut */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg truncate">
                            {client.prenom} {client.nom}
                          </h3>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                            client.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {client.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>

                      {/* Contact */}
                      <div className="space-y-1.5">
                        <a
                          href={`https://wa.me/${client.telephone.replace(/\s+/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 hover:underline"
                          title="Envoyer un message WhatsApp"
                        >
                          <Phone size={14} />
                          <span className="truncate">{client.telephone}</span>
                        </a>
                        {client.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={14} />
                            <span className="truncate">{client.email}</span>
                          </div>
                        )}
                        {client.adresse && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin size={14} />
                            <span className="truncate">{client.adresse}</span>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                        <div className="bg-yellow-50 p-2 rounded">
                          <div className="flex items-center gap-1 mb-0.5">
                            <Trophy size={14} className="text-yellow-600" />
                            <span className="text-xs text-gray-600">Points</span>
                          </div>
                          <p className="text-lg font-bold text-yellow-600">
                            {client.points_fidelite}
                          </p>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <div className="flex items-center gap-1 mb-0.5">
                            <Calendar size={14} className="text-green-600" />
                            <span className="text-xs text-gray-600">Visites</span>
                          </div>
                          <p className="text-sm font-medium text-green-600 truncate">
                            {formatDate(client.date_derniere_visite)}
                          </p>
                        </div>
                      </div>

                      {/* Total dépensé */}
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-500">Total dépensé</p>
                        <p className="text-sm font-bold text-gray-900">
                          {formatMontant(client.montant_total_depense)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onVoirDetails(client);
                          }}
                          className="flex-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded text-sm flex items-center justify-center gap-2"
                          title="Voir détails"
                        >
                          <Eye size={16} />
                          Détails
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onModifier(client);
                          }}
                          className="flex-1 px-3 py-1.5 text-orange-600 hover:bg-orange-50 rounded text-sm flex items-center justify-center gap-2"
                          title="Modifier"
                        >
                          <Edit size={16} />
                          Modifier
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSupprimer(client);
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-6 bg-white rounded-lg shadow px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm text-gray-600">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};