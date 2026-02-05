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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Catégories</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Gérez les catégories de vos produits et leurs attributs
          </p>
        </div>
        <Button onClick={openCreateModal} className="w-full sm:w-auto flex-shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden xs:inline">Nouvelle catégorie</span>
          <span className="xs:hidden">Nouvelle</span>
        </Button>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && reload(search)}
              className="pl-10 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Chargement...</p>
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <p className="text-sm text-gray-600 mb-4">Aucune catégorie trouvée</p>
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Créer une catégorie
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Vue Desktop - Table */}
          <Card className="hidden md:block">
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
                            <div className="font-medium text-gray-900">{cat.nom}</div>
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
                              {cat.is_active ? <XCircle size={18} /> : <CheckCircle size={18} />}
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
                      
                      {expandedRows.has(cat.id) && (
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid grid-cols-2 gap-6">
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
                                        <span className="text-xs text-gray-500">({prod.reference})</span>
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

          {/* Vue Mobile - Cards */}
          <div className="md:hidden space-y-3">
            {categories.map((cat: any) => (
              <Card key={cat.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base truncate">{cat.nom}</h3>
                      {cat.couleur && (
                        <div 
                          className="w-12 h-1.5 rounded mt-1" 
                          style={{ backgroundColor: cat.couleur }}
                        />
                      )}
                      {cat.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{cat.description}</p>
                      )}
                    </div>
                    <Badge variant={cat.is_active ? 'success' : 'danger'} className="ml-2 flex-shrink-0">
                      {cat.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      <span>{cat.nombre_attributs || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      <span>{cat.nombre_produits || 0}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm"
                    >
                      <Edit size={16} />
                      <span>Modifier</span>
                    </button>
                    <button
                      onClick={() => handleToggleActive(cat.id)}
                      className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                      title={cat.is_active ? 'Désactiver' : 'Activer'}
                    >
                      {cat.is_active ? <XCircle size={18} /> : <CheckCircle size={18} />}
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Détails expandables */}
                  {((cat.attributs && cat.attributs.length > 0) || (cat.produits && cat.produits.length > 0)) && (
                    <button
                      onClick={() => toggleRow(cat.id)}
                      className="w-full mt-3 py-2 text-xs text-blue-600 hover:text-blue-800 border-t pt-3"
                    >
                      {expandedRows.has(cat.id) ? '▲ Masquer les détails' : '▼ Voir les détails'}
                    </button>
                  )}

                  {expandedRows.has(cat.id) && (
                    <div className="mt-3 pt-3 border-t space-y-3">
                      {cat.attributs && cat.attributs.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            Attributs ({cat.attributs.length})
                          </h4>
                          <div className="space-y-1">
                            {cat.attributs.map((attr: any) => (
                              <div key={attr.id} className="text-xs text-gray-600 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
                                <span className="font-medium">{attr.nom}</span>
                                <span className="text-gray-500">
                                  ({attr.type_valeur})
                                  {attr.pivot?.obligatoire && <span className="text-red-500">*</span>}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {cat.produits && cat.produits.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            Produits ({cat.produits.length})
                          </h4>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {cat.produits.map((prod: any) => (
                              <div key={prod.id} className="text-xs text-gray-600 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></span>
                                <span className="font-medium truncate">{prod.nom}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

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