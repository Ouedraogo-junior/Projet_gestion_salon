// src/app/pages/Produits/components/AttributsTab.tsx
import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Tag, FolderOpen } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent } from '@/app/components/ui/card';
import { useAttributs } from '@/hooks/useProduitsModule';
import { produitsApi } from '@/services/produitsApi';
import { Badge } from './ui/Badge';
import { AttributFormModal } from './AttributFormModal';

export function AttributsTab() {
  const { data: attributs, loading, reload } = useAttributs();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet attribut ?')) return;
    try {
      await produitsApi.attributs.delete(id);
      reload();
      alert('✅ Attribut supprimé avec succès');
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

  const openEditModal = (attr: any) => {
    setEditingItem(attr);
    setShowModal(true);
  };

  const handleSuccess = () => {
    reload();
    setShowModal(false);
    setEditingItem(null);
  };

  const getTypeLabel = (type: string) => {
    const types: any = {
      'texte': 'Texte',
      'nombre': 'Nombre',
      'liste': 'Liste'
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attributs</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gérez les attributs des produits et associez-les aux catégories
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel attribut
        </Button>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Rechercher un attribut..."
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
      ) : attributs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600 mb-4">Aucun attribut trouvé</p>
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un attribut
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
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valeurs possibles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégories
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Obligatoire
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attributs.map((attr: any) => {
                  let valeursPossibles: string[] = [];
                  if (attr.valeurs_possibles) {
                    try {
                      valeursPossibles = typeof attr.valeurs_possibles === 'string' 
                        ? JSON.parse(attr.valeurs_possibles) 
                        : attr.valeurs_possibles;
                    } catch (e) {
                      valeursPossibles = [];
                    }
                  }

                  const categoriesCount = attr.categories_count || attr.categories?.length || 0;

                  return (
                    <React.Fragment key={attr.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Tag className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {attr.nom}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="info">
                            {getTypeLabel(attr.type_valeur)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {valeursPossibles.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {valeursPossibles.slice(0, 3).map((val: string, idx: number) => (
                                <span 
                                  key={idx} 
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                    attr.type_valeur === 'liste' 
                                      ? 'bg-blue-100 text-blue-700' 
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {val}
                                </span>
                              ))}
                              {valeursPossibles.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                  +{valeursPossibles.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm italic">Aucune valeur</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-600 text-sm">
                            {attr.unite || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleRow(attr.id)}
                            className="flex items-center gap-2 hover:text-blue-600 transition"
                          >
                            <FolderOpen className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {categoriesCount}
                            </span>
                            {categoriesCount > 0 && attr.categories && (
                              <span className="text-xs text-gray-500">
                                ({expandedRows.has(attr.id) ? '▼' : '▶'})
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={attr.obligatoire ? 'warning' : 'default'}>
                            {attr.obligatoire ? 'Oui' : 'Non'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-3">
                            <button
                              onClick={() => openEditModal(attr)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Modifier"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(attr.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Supprimer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Ligne étendue avec détails des catégories */}
                      {expandedRows.has(attr.id) && attr.categories && attr.categories.length > 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan={7} className="px-6 py-4">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <FolderOpen className="w-4 h-4" />
                                Catégories associées ({attr.categories.length})
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                {attr.categories.map((cat: any) => (
                                  <div 
                                    key={cat.id} 
                                    className="flex items-center gap-2 text-sm text-gray-600 p-2 bg-white rounded border border-gray-200"
                                  >
                                    {cat.couleur && (
                                      <div 
                                        className="w-3 h-3 rounded-full flex-shrink-0" 
                                        style={{ backgroundColor: cat.couleur }}
                                      />
                                    )}
                                    <span className="font-medium">{cat.nom}</span>
                                    {cat.pivot?.obligatoire && (
                                      <span className="text-xs text-red-500 font-semibold">*</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal avec le nouveau formulaire incluant les catégories */}
      <AttributFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
        }}
        onSuccess={handleSuccess}
        attribut={editingItem}
      />
    </div>
  );
}