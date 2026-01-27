// src/app/pages/Produits/components/ProduitsTab.tsx
import { useState } from 'react';
import { Plus, Search, Edit, Trash2, AlertTriangle, Package, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent } from '@/app/components/ui/card';
import { useProduits, useCategories } from '@/hooks/useProduitsModule';
import { produitsApi } from '@/services/produitsApi';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { Textarea } from './ui/Textarea';
import { ProduitDetailsModal } from './ProduitDetailsModal';

type ProductSubTab = 'tous' | 'vente' | 'utilisation';

export function ProduitsTab() {
  const [activeTab, setActiveTab] = useState<ProductSubTab>('tous');
  const { data: produits, loading, reload } = useProduits();
  const { data: categories } = useCategories();
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    reference: '',
    description: '',
    categorie_id: '',
    marque: '',
    fournisseur: '',
    prix_achat: '',
    prix_vente: '',
    stock_vente: '',
    stock_utilisation: '',
    seuil_alerte: '20',
    seuil_critique: '10',
    seuil_alerte_utilisation: '15',
    seuil_critique_utilisation: '5',
    type_stock_principal: 'mixte',
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        categorie_id: parseInt(formData.categorie_id),
        prix_achat: parseFloat(formData.prix_achat),
        prix_vente: parseFloat(formData.prix_vente),
        stock_vente: parseInt(formData.stock_vente) || 0,
        stock_utilisation: parseInt(formData.stock_utilisation) || 0,
        seuil_alerte: parseInt(formData.seuil_alerte),
        seuil_critique: parseInt(formData.seuil_critique),
        seuil_alerte_utilisation: parseInt(formData.seuil_alerte_utilisation),
        seuil_critique_utilisation: parseInt(formData.seuil_critique_utilisation)
      };

      if (editingItem) {
        await produitsApi.produits.update(editingItem.id, payload);
        alert('✅ Produit modifié avec succès');
      } else {
        await produitsApi.produits.create(payload);
        alert('✅ Produit créé avec succès');
      }
      setShowModal(false);
      resetForm();
      reload();
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    try {
      await produitsApi.produits.delete(id);
      reload();
      alert('✅ Produit supprimé avec succès');
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await produitsApi.produits.toggleActive(id);
      reload();
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  const handleViewDetails = (produit: any) => {
    setSelectedProduit(produit);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      reference: '',
      description: '',
      categorie_id: '',
      marque: '',
      fournisseur: '',
      prix_achat: '',
      prix_vente: '',
      stock_vente: '',
      stock_utilisation: '',
      seuil_alerte: '20',
      seuil_critique: '10',
      seuil_alerte_utilisation: '15',
      seuil_critique_utilisation: '5',
      type_stock_principal: 'mixte',
      is_active: true
    });
    setEditingItem(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (prod: any) => {
    setEditingItem(prod);
    setFormData({
      nom: prod.nom || '',
      reference: prod.reference || '',
      description: prod.description || '',
      categorie_id: prod.categorie_id?.toString() || '',
      marque: prod.marque || '',
      fournisseur: prod.fournisseur || '',
      prix_achat: prod.prix_achat?.toString() || '',
      prix_vente: prod.prix_vente?.toString() || '',
      stock_vente: prod.stock_vente?.toString() || '0',
      stock_utilisation: prod.stock_utilisation?.toString() || '0',
      seuil_alerte: prod.seuil_alerte?.toString() || '20',
      seuil_critique: prod.seuil_critique?.toString() || '10',
      seuil_alerte_utilisation: prod.seuil_alerte_utilisation?.toString() || '15',
      seuil_critique_utilisation: prod.seuil_critique_utilisation?.toString() || '5',
      type_stock_principal: prod.type_stock_principal || 'mixte',
      is_active: prod.is_active ?? true
    });
    setShowModal(true);
  };

  const getStockStatus = (stock: number, seuil_alerte: number, seuil_critique: number) => {
    if (stock <= seuil_critique) return { variant: 'danger', label: 'Critique', icon: AlertTriangle };
    if (stock <= seuil_alerte) return { variant: 'warning', label: 'Alerte', icon: AlertTriangle };
    return { variant: 'success', label: 'Normal', icon: CheckCircle };
  };

  // Filtrage intelligent selon l'onglet actif
  const filteredProduits = produits.filter((prod: any) => {
    if (activeTab === 'tous') {
      return true; // Afficher tous les produits
    } else if (activeTab === 'vente') {
      return prod.type_stock_principal === 'vente' || prod.type_stock_principal === 'mixte';
    } else if (activeTab === 'utilisation') {
      return prod.type_stock_principal === 'utilisation' || prod.type_stock_principal === 'mixte';
    }
    return true;
  });

  // Déterminer quelles colonnes afficher selon l'onglet
  const shouldShowStockVente = activeTab === 'tous' || activeTab === 'vente';
  const shouldShowStockSalon = activeTab === 'tous' || activeTab === 'utilisation';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Produits</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gérez vos produits en vente et pour utilisation salon
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau produit
        </Button>
      </div>

      {/* Tabs - 3 onglets maintenant */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('tous')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tous'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Tous les produits
          </button>
          <button
            onClick={() => setActiveTab('vente')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'vente'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Produits en vente
          </button>
          <button
            onClick={() => setActiveTab('utilisation')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'utilisation'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Produits salon
          </button>
        </nav>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && reload(search)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau avec colonnes conditionnelles */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      ) : filteredProduits.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600 mb-4">Aucun produit trouvé</p>
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un produit
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
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  {/* Afficher Stock Vente seulement si nécessaire */}
                  {shouldShowStockVente && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Vente
                    </th>
                  )}
                  {/* Afficher Stock Salon seulement si nécessaire */}
                  {shouldShowStockSalon && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Salon
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProduits.map((prod: any) => {
                  const statusVente = getStockStatus(prod.stock_vente, prod.seuil_alerte, prod.seuil_critique);
                  const statusUtilisation = getStockStatus(prod.stock_utilisation, prod.seuil_alerte_utilisation, prod.seuil_critique_utilisation);
                  const StatusIconVente = statusVente.icon;
                  const StatusIconUtilisation = statusUtilisation.icon;

                  return (
                    <tr key={prod.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{prod.nom}</div>
                          <div className="text-sm text-gray-500">{prod.reference}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600">
                          {prod.categorie?.nom || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{prod.prix_vente} FCFA</div>
                          <div className="text-gray-500">Achat: {prod.prix_achat} FCFA</div>
                        </div>
                      </td>
                      {/* Afficher colonne Stock Vente seulement si nécessaire */}
                      {shouldShowStockVente && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{prod.stock_vente}</span>
                            <StatusIconVente className={`w-4 h-4 ${
                              statusVente.variant === 'danger' ? 'text-red-500' :
                              statusVente.variant === 'warning' ? 'text-yellow-500' :
                              'text-green-500'
                            }`} />
                          </div>
                        </td>
                      )}
                      {/* Afficher colonne Stock Salon seulement si nécessaire */}
                      {shouldShowStockSalon && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{prod.stock_utilisation}</span>
                            <StatusIconUtilisation className={`w-4 h-4 ${
                              statusUtilisation.variant === 'danger' ? 'text-red-500' :
                              statusUtilisation.variant === 'warning' ? 'text-yellow-500' :
                              'text-green-500'
                            }`} />
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={prod.is_active ? 'success' : 'danger'}>
                          {prod.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => handleViewDetails(prod)}
                            className="text-purple-600 hover:text-purple-800"
                            title="Voir détails"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => openEditModal(prod)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleToggleActive(prod.id)}
                            className="text-gray-600 hover:text-gray-800"
                            title={prod.is_active ? 'Désactiver' : 'Activer'}
                          >
                            {prod.is_active ? (
                              <XCircle size={18} />
                            ) : (
                              <CheckCircle size={18} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Création/Modification */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'Modifier le produit' : 'Nouveau produit'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
                placeholder="Nom du produit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Référence
              </label>
              <Input
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Référence unique"
              />
            </div>
          </div>

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(val: string) => setFormData({ ...formData, description: val })}
            placeholder="Description du produit..."
            rows={2}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categorie_id}
                onChange={(e) => setFormData({ ...formData, categorie_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionnez...</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de stock <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type_stock_principal}
                onChange={(e) => setFormData({ ...formData, type_stock_principal: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="vente">Vente uniquement</option>
                <option value="utilisation">Utilisation salon uniquement</option>
                <option value="mixte">Mixte (vente + salon)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marque
              </label>
              <Input
                value={formData.marque}
                onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                placeholder="Marque du produit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fournisseur
              </label>
              <Input
                value={formData.fournisseur}
                onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
                placeholder="Fournisseur"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix d'achat <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={formData.prix_achat}
                onChange={(e) => setFormData({ ...formData, prix_achat: e.target.value })}
                required
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix de vente <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={formData.prix_vente}
                onChange={(e) => setFormData({ ...formData, prix_vente: e.target.value })}
                required
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Stocks et seuils</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="text-xs font-medium text-gray-700">Stock Vente</h4>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Quantité</label>
                  <Input
                    type="number"
                    value={formData.stock_vente}
                    onChange={(e) => setFormData({ ...formData, stock_vente: e.target.value })}
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Seuil alerte</label>
                  <Input
                    type="number"
                    value={formData.seuil_alerte}
                    onChange={(e) => setFormData({ ...formData, seuil_alerte: e.target.value })}
                    min="0"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Seuil critique</label>
                  <Input
                    type="number"
                    value={formData.seuil_critique}
                    onChange={(e) => setFormData({ ...formData, seuil_critique: e.target.value })}
                    min="0"
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-medium text-gray-700">Stock Salon</h4>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Quantité</label>
                  <Input
                    type="number"
                    value={formData.stock_utilisation}
                    onChange={(e) => setFormData({ ...formData, stock_utilisation: e.target.value })}
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Seuil alerte</label>
                  <Input
                    type="number"
                    value={formData.seuil_alerte_utilisation}
                    onChange={(e) => setFormData({ ...formData, seuil_alerte_utilisation: e.target.value })}
                    min="0"
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Seuil critique</label>
                  <Input
                    type="number"
                    value={formData.seuil_critique_utilisation}
                    onChange={(e) => setFormData({ ...formData, seuil_critique_utilisation: e.target.value })}
                    min="0"
                    placeholder="5"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              {editingItem ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Détails */}
      {selectedProduit && (
        <ProduitDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedProduit(null);
          }}
          produitId={selectedProduit.id}
        />
      )}
    </div>
  );
}