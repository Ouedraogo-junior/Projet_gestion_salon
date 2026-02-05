// src/app/pages/Produits/components/TransfertsTab.tsx
import { useState } from 'react';
import { Plus, Search, Trash2, CheckCircle, ArrowRightLeft, Filter } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent } from '@/app/components/ui/card';
import { useTransferts, useProduits } from '@/hooks/useProduitsModule';
import { produitsApi } from '@/services/produitsApi';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { Textarea } from './ui/Textarea';

export function TransfertsTab() {
  const { data: transferts, loading, reload } = useTransferts();
  const { data: produits } = useProduits();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<'tous' | 'valide' | 'en_attente'>('tous');
  const [formData, setFormData] = useState({
    produit_id: '',
    type_transfert: 'vente_vers_utilisation',
    quantite: '',
    motif: '',
    seuil_alerte: '',
    seuil_critique: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        produit_id: parseInt(formData.produit_id),
        type_transfert: formData.type_transfert,
        quantite: parseInt(formData.quantite),
        motif: formData.motif
      };

      // Ajouter seuils si transfert depuis réserve
      if (['reserve_vers_vente', 'reserve_vers_utilisation'].includes(formData.type_transfert)) {
        if (formData.seuil_alerte) {
          payload[formData.type_transfert === 'reserve_vers_vente' ? 'seuil_alerte' : 'seuil_alerte_utilisation'] = parseInt(formData.seuil_alerte);
        }
        if (formData.seuil_critique) {
          payload[formData.type_transfert === 'reserve_vers_vente' ? 'seuil_critique' : 'seuil_critique_utilisation'] = parseInt(formData.seuil_critique);
        }
      }

      await produitsApi.transferts.create(payload);
      alert('✅ Transfert créé avec succès');
      setShowModal(false);
      resetForm();
      reload();
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce transfert ?')) return;
    try {
      await produitsApi.transferts.delete(id);
      reload();
      alert('✅ Transfert annulé avec succès');
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  const handleValider = async (id: number) => {
    if (!confirm('Voulez-vous valider ce transfert ?')) return;
    try {
      await produitsApi.transferts.valider(id);
      reload();
      alert('✅ Transfert validé avec succès');
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      produit_id: '',
      type_transfert: 'vente_vers_utilisation',
      quantite: '',
      motif: '',
      seuil_alerte: '',
      seuil_critique: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'vente_vers_utilisation': 'Vente → Salon',
      'utilisation_vers_vente': 'Salon → Vente',
      'reserve_vers_vente': 'Réserve → Vente',
      'reserve_vers_utilisation': 'Réserve → Salon',
      'vente_vers_reserve': 'Vente → Réserve',
      'utilisation_vers_reserve': 'Salon → Réserve',
    };
    return labels[type] || type;
  };

  const filteredTransferts = transferts.filter((t: any) => {
    if (filterStatut === 'valide') return t.valide === true;
    if (filterStatut === 'en_attente') return t.valide === false;
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Transferts de stock</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Gérez les transferts entre stock vente, salon et réserve
          </p>
        </div>
        <Button onClick={openCreateModal} className="w-full sm:w-auto flex-shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden xs:inline">Nouveau transfert</span>
          <span className="xs:hidden">Nouveau</span>
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 sm:top-3 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 flex-shrink-0" size={18} />
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value as any)}
                className="flex-1 sm:flex-none px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="tous">Tous</option>
                <option value="en_attente">En attente</option>
                <option value="valide">Validés</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Chargement...</p>
        </div>
      ) : filteredTransferts.length === 0 ? (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <p className="text-sm text-gray-600 mb-4">Aucun transfert trouvé</p>
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un transfert
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Vue Desktop - Table */}
          <Card className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      N° Transfert
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransferts.map((transfert: any) => (
                    <tr key={transfert.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900">
                          {transfert.numero_transfert}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {transfert.produit?.nom || 'Produit inconnu'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {getTypeLabel(transfert.type_transfert)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">
                          {transfert.quantite}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {transfert.montant_total} FCFA
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={transfert.valide ? 'success' : 'warning'}>
                          {transfert.valide ? 'Validé' : 'En attente'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {new Date(transfert.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          {!transfert.valide && (
                            <>
                              <button
                                onClick={() => handleValider(transfert.id)}
                                className="text-green-600 hover:text-green-800"
                                title="Valider"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(transfert.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Annuler"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                          {transfert.valide && (
                            <span className="text-gray-400 text-xs">
                              Validé par {transfert.valideur?.name || 'Admin'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Vue Mobile - Cards */}
          <div className="lg:hidden space-y-3">
            {filteredTransferts.map((transfert: any) => (
              <Card key={transfert.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-gray-500 mb-1">
                        {transfert.numero_transfert}
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {transfert.produit?.nom || 'Produit inconnu'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <ArrowRightLeft className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-600">
                          {getTypeLabel(transfert.type_transfert)}
                        </span>
                      </div>
                    </div>
                    <Badge variant={transfert.valide ? 'success' : 'warning'} className="ml-2 flex-shrink-0 text-xs">
                      {transfert.valide ? 'Validé' : 'En attente'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <label className="text-xs text-gray-500">Quantité</label>
                      <p className="font-semibold text-gray-900">{transfert.quantite}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Montant</label>
                      <p className="font-semibold text-gray-900">{transfert.montant_total} FCFA</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-3">
                    {new Date(transfert.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>

                  {/* Actions */}
                  {!transfert.valide ? (
                    <div className="flex items-center gap-2 pt-3 border-t">
                      <button
                        onClick={() => handleValider(transfert.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-sm"
                      >
                        <CheckCircle size={16} />
                        <span>Valider</span>
                      </button>
                      <button
                        onClick={() => handleDelete(transfert.id)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                        title="Annuler"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-500">
                        Validé par {transfert.valideur?.name || 'Admin'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nouveau transfert"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produit <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.produit_id}
              onChange={(e) => setFormData({ ...formData, produit_id: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionnez un produit...</option>
              {produits.map((prod: any) => (
                <option key={prod.id} value={prod.id}>
                  {prod.nom} (V: {prod.stock_vente} / S: {prod.stock_utilisation} / R: {prod.stock_reserve || 0})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de transfert <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type_transfert}
              onChange={(e) => setFormData({ ...formData, type_transfert: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <optgroup label="Transferts opérationnels">
                <option value="vente_vers_utilisation">Vente → Salon</option>
                <option value="utilisation_vers_vente">Salon → Vente</option>
              </optgroup>
              
              <optgroup label="Depuis la réserve">
                <option value="reserve_vers_vente">Réserve → Vente</option>
                <option value="reserve_vers_utilisation">Réserve → Salon</option>
              </optgroup>
              
              <optgroup label="Vers la réserve">
                <option value="vente_vers_reserve">Vente → Réserve</option>
                <option value="utilisation_vers_reserve">Salon → Réserve</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantité <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.quantite}
              onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
              required
              min="1"
              placeholder="Quantité à transférer"
              className="text-sm"
            />
          </div>

          {/* Affichage conditionnel des seuils si transfert depuis réserve */}
          {['reserve_vers_vente', 'reserve_vers_utilisation'].includes(formData.type_transfert) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">
                Définir les seuils pour le stock de destination
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Seuil d'alerte
                  </label>
                  <Input
                    type="number"
                    value={formData.seuil_alerte}
                    onChange={(e) => setFormData({ ...formData, seuil_alerte: e.target.value })}
                    min="0"
                    placeholder="Optionnel"
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Seuil critique
                  </label>
                  <Input
                    type="number"
                    value={formData.seuil_critique}
                    onChange={(e) => setFormData({ ...formData, seuil_critique: e.target.value })}
                    min="0"
                    placeholder="Optionnel"
                    className="text-sm"
                  />
                </div>
              </div>
              
              <p className="text-xs text-blue-700">
                Ces seuils seront appliqués au stock {formData.type_transfert === 'reserve_vers_vente' ? 'vente' : 'salon'}
              </p>
            </div>
          )}

          <Textarea
            label="Motif"
            value={formData.motif}
            onChange={(val: string) => setFormData({ ...formData, motif: val })}
            placeholder="Raison du transfert..."
            rows={3}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs sm:text-sm text-blue-800">
              ℹ️ Le transfert sera en attente de validation par un gérant
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Créer le transfert
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}