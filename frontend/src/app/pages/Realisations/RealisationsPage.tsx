import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { realisationApi } from '@/services/realisationApi';
import type { Realisation, RealisationFilters } from '@/types/realisation.types';
import { RealisationCard } from './components/RealisationCard';
import { RealisationFormModal } from './components/RealisationFormModal';
import { AddMediasModal } from './components/AddMediasModal';

export const RealisationsPage: React.FC = () => {
  const [realisations, setRealisations]     = useState<Realisation[]>([]);
  const [loading, setLoading]               = useState(true);
  const [currentPage, setCurrentPage]       = useState(1);
  const [totalPages, setTotalPages]         = useState(1);
  const [total, setTotal]                   = useState(0);
  const [showFilters, setShowFilters]       = useState(false);

  // Modals
  const [formModal, setFormModal]           = useState<{ open: boolean; realisation?: Realisation }>({ open: false });
  const [addMediasModal, setAddMediasModal] = useState<Realisation | null>(null);

  const [filters, setFilters] = useState<RealisationFilters>({
    search:    '',
    is_public: undefined,
    per_page:  12,
    page:      1,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await realisationApi.getRealisations({ ...filters, page: currentPage });
      if (res.success) {
        setRealisations(res.data.data);
        setTotalPages(res.data.last_page);
        setTotal(res.data.total);
      }
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    try {
      await realisationApi.deleteRealisation(id);
      toast.success('Réalisation supprimée');
      load();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDeleteMedia = async (realisationId: number, mediaId: number) => {
    try {
      await realisationApi.deleteMedia(realisationId, mediaId);
      toast.success('Média supprimé');
      load();
    } catch {
      toast.error('Erreur lors de la suppression du média');
    }
  };

  const handleTogglePublic = async (id: number) => {
    try {
      const res = await realisationApi.togglePublic(id);
      toast.success(res.data.is_public ? 'Réalisation publiée' : 'Réalisation masquée');
      load();
    } catch {
      toast.error('Erreur');
    }
  };

  const handleFilterChange = (key: keyof RealisationFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    load();
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Galerie & Réalisations</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} réalisation(s)</p>
        </div>
        <button
          onClick={() => setFormModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          <Plus size={18} /> Nouvelle réalisation
        </button>
      </div>

      {/* Barre recherche + filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom de coiffure..."
                value={filters.search}
                onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              Chercher
            </button>
          </form>
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 border transition ${showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'hover:bg-gray-50'}`}
          >
            <Filter size={16} /> Filtres
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-4 pt-2 border-t">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Visibilité</label>
              <select
                value={filters.is_public === undefined ? '' : filters.is_public.toString()}
                onChange={(e) => handleFilterChange('is_public', e.target.value === '' ? undefined : e.target.value === 'true')}
                className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">Toutes</option>
                <option value="true">Publiques</option>
                <option value="false">Privées</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Par page</label>
              <select
                value={filters.per_page}
                onChange={(e) => handleFilterChange('per_page', parseInt(e.target.value))}
                className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Grille */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : realisations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
          <p className="text-lg font-medium mb-2">Aucune réalisation</p>
          <p className="text-sm">Créez votre première réalisation en cliquant sur "Nouvelle réalisation"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {realisations.map((r) => (
            <RealisationCard
              key={r.id}
              realisation={r}
              onEdit={() => setFormModal({ open: true, realisation: r })}
              onDelete={() => handleDelete(r.id)}
              onAddMedias={() => setAddMediasModal(r)}
              onDeleteMedia={(mediaId) => handleDeleteMedia(r.id, mediaId)}
              onTogglePublic={() => handleTogglePublic(r.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm px-4 py-3">
          <p className="text-sm text-gray-600">Page {currentPage} sur {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {formModal.open && (
        <RealisationFormModal
          realisation={formModal.realisation}
          onClose={() => setFormModal({ open: false })}
          onSaved={load}
        />
      )}
      {addMediasModal && (
        <AddMediasModal
          realisation={addMediasModal}
          onClose={() => setAddMediasModal(null)}
          onSaved={load}
        />
      )}
    </div>
  );
};