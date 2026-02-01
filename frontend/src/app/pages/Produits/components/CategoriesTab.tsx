// src/app/pages/Produits/components/CategoriesTab.tsx
import { useState } from 'react';
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle, Tag, Package } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent } from '@/app/components/ui/card';
import { useCategories } from '@/hooks/useProduitsModule';
import { produitsApi } from '@/services/produitsApi';
import { Badge } from './ui/Badge';
import { CategorieFormModal } from './CategorieFormModal';

export function CategoriesTab() {
  const { data: categories, loading, reload } = useCategories();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;
    try {
      await produitsApi.categories.delete(id);
      reload();
      alert('✅ Catégorie supprimée avec succès');
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await produitsApi.categories.toggleActive(id);
      reload();
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  const toggleRow = (id: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const openEditModal = (cat: any) => {
    setEditingItem(cat);
    setShowModal(true);
  };

  const handleSuccess = () => {
    reload();
    setShowModal(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Catégories</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gérez les catégories de vos produits et leurs attributs
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle catégorie
        </Button>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Rechercher une catégorie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && reload(search)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600 mb-4">Aucune catégorie trouvée</p>
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Créer une catégorie
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attributs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((cat: any) => (
                  <>
                    <tr key={cat.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {cat.nom}
                          </div>
                          {cat.couleur && (
                            <div 
                              className="w-16 h-2 rounded mt-1" 
                              style={{ backgroundColor: cat.couleur }}
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 text-sm">
                          {cat.description || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleRow(cat.id)}
                          className="flex items-center gap-2 hover:text-blue-600 transition"
                        >
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {cat.nombre_attributs || 0}
                          </span>
                          {cat.nombre_attributs > 0 && cat.attributs && (
                            <span className="text-xs text-gray-500">
                              ({expandedRows.has(cat.id) ? '▼' : '▶'})
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleRow(cat.id)}
                          className="flex items-center gap-2 hover:text-blue-600 transition"
                        >
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {cat.nombre_produits || 0}
                          </span>
                          {cat.nombre_produits > 0 && cat.produits && (
                            <span className="text-xs text-gray-500">
                              ({expandedRows.has(cat.id) ? '▼' : '▶'})
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={cat.is_active ? 'success' : 'danger'}>
                          {cat.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleToggleActive(cat.id)}
                            className="text-gray-600 hover:text-gray-800"
                            title={cat.is_active ? 'Désactiver' : 'Activer'}
                          >
                            {cat.is_active ? (
                              <XCircle size={18} />
                            ) : (
                              <CheckCircle size={18} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Ligne étendue avec détails */}
                    {expandedRows.has(cat.id) && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-2 gap-6">
                            {/* Attributs */}
                            {cat.attributs && cat.attributs.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                  <Tag className="w-4 h-4" />
                                  Attributs ({cat.attributs.length})
                                </h4>
                                <div className="space-y-1">
                                  {cat.attributs.map((attr: any) => (
                                    <div key={attr.id} className="text-sm text-gray-600 flex items-center gap-2">
                                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                      <span className="font-medium">{attr.nom}</span>
                                      <span className="text-xs text-gray-500">
                                        ({attr.type_valeur})
                                        {attr.pivot?.obligatoire && <span className="text-red-500 ml-1">*</span>}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Produits */}
                            {cat.produits && cat.produits.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                  <Package className="w-4 h-4" />
                                  Produits ({cat.produits.length})
                                </h4>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                  {cat.produits.map((prod: any) => (
                                    <div key={prod.id} className="text-sm text-gray-600 flex items-center gap-2">
                                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                      <span className="font-medium">{prod.nom}</span>
                                      <span className="text-xs text-gray-500">
                                        ({prod.reference})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal avec le nouveau formulaire incluant les attributs */}
      <CategorieFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
        }}
        onSuccess={handleSuccess}
        categorie={editingItem}
      />
    </div>
  );
}