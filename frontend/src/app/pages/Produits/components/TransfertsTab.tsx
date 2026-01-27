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
    motif: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        produit_id: parseInt(formData.produit_id),
        type_transfert: formData.type_transfert,
        quantite: parseInt(formData.quantite),
        motif: formData.motif
      };

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
      motif: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const getTypeLabel = (type: string) => {
    return type === 'vente_vers_utilisation' 
      ? 'Vente → Salon' 
      : 'Salon → Vente';
  };

  const filteredTransferts = transferts.filter((t: any) => {
    if (filterStatut === 'valide') return t.valide === true;
    if (filterStatut === 'en_attente') return t.valide === false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transferts de stock</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gérez les transferts entre stock vente et stock salon
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau transfert
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Rechercher un transfert..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="tous">Tous les statuts</option>
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
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      ) : filteredTransferts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600 mb-4">Aucun transfert trouvé</p>
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un transfert
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionnez un produit...</option>
              {produits.map((prod: any) => (
                <option key={prod.id} value={prod.id}>
                  {prod.nom} (Vente: {prod.stock_vente} / Salon: {prod.stock_utilisation})
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="vente_vers_utilisation">Stock Vente → Stock Salon</option>
              <option value="utilisation_vers_vente">Stock Salon → Stock Vente</option>
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
            />
          </div>

          <Textarea
            label="Motif"
            value={formData.motif}
            onChange={(val: string) => setFormData({ ...formData, motif: val })}
            placeholder="Raison du transfert..."
            rows={3}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              ℹ️ Le transfert sera en attente de validation par un gérant
            </p>
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
              Créer le transfert
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}