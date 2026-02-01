// src/app/pages/Produits/components/ProduitDetailsModal.tsx
import { useEffect, useState } from 'react';
import { X, Package, Tag, DollarSign, Calendar, Info, ImageOff } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';
import { produitsApi } from '@/services/produitsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

interface ProduitDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  produitId: number;
}

export function ProduitDetailsModal({ isOpen, onClose, produitId }: ProduitDetailsModalProps) {
  const [produit, setProduit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isOpen && produitId) {
      loadProduitDetails();
    }
  }, [isOpen, produitId]);

  const loadProduitDetails = async () => {
    try {
      setLoading(true);
      const response = await produitsApi.produits.show(produitId);
      setProduit(response.data);
      setImageError(false);
    } catch (error: any) {
      console.error('❌ Erreur:', error);
      alert('❌ Erreur lors du chargement des détails: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (photoUrl?: string) => {
    if (!photoUrl) return null;
    const cleanUrl = photoUrl.replace(/^(storage\/)+/, '');
    return `${import.meta.env.VITE_API_URL}/storage/${cleanUrl}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!isOpen) return null;

  const imageUrl = produit?.photo_url ? getImageUrl(produit.photo_url) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Détails du produit"
      size="large"
    >
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Chargement des détails...</p>
        </div>
      ) : produit ? (
        <div className="space-y-6">
          {/* En-tête avec photo */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden border-2 border-gray-200">
                {imageUrl && !imageError ? (
                  <img
                    src={imageUrl}
                    alt={produit.nom}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <ImageOff size={64} className="text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">Aucune photo</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{produit.nom}</h2>
                  <p className="text-sm text-gray-500 mt-1">Réf: {produit.reference || 'N/A'}</p>
                  {produit.marque && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Marque:</span> {produit.marque}
                    </p>
                  )}
                  {produit.fournisseur && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Fournisseur:</span> {produit.fournisseur}
                    </p>
                  )}
                </div>
                <Badge variant={produit.is_active ? 'success' : 'danger'}>
                  {produit.is_active ? 'Actif' : 'Inactif'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs text-gray-600">Prix d'achat</label>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(produit.prix_achat)} FCFA
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <label className="text-xs text-gray-600">Prix de vente</label>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(produit.prix_vente)} FCFA
                  </p>
                </div>
              </div>

              {produit.prix_promo && (
                <div className="mt-3 bg-red-50 border border-red-200 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-red-600 font-medium">PROMOTION</span>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(produit.prix_promo)} FCFA
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-red-600">
                        -{Math.round(((produit.prix_vente - produit.prix_promo) / produit.prix_vente) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {produit.description && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">{produit.description}</p>
            </div>
          )}

          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Catégorie</label>
                  <p className="text-gray-900 mt-1 font-semibold">
                    {produit.categorie?.nom || 'Non définie'}
                  </p>
                  {produit.categorie?.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {produit.categorie.description}
                    </p>
                  )}
                  {produit.categorie?.couleur && (
                    <div 
                      className="w-24 h-2 rounded mt-2" 
                      style={{ backgroundColor: produit.categorie.couleur }}
                    />
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Type de stock</label>
                  <p className="text-gray-900 mt-1 capitalize">
                    {produit.type_stock_principal === 'vente' && 'Vente uniquement'}
                    {produit.type_stock_principal === 'utilisation' && 'Utilisation salon'}
                    {produit.type_stock_principal === 'mixte' && 'Mixte (vente + salon)'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Caractéristiques */}
          {(() => {
            const valeursAttributs = produit.valeursAttributs || produit.attributs || [];
            
            if (!Array.isArray(valeursAttributs) || valeursAttributs.length === 0) {
              return null;
            }

            return (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Caractéristiques du produit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {valeursAttributs.map((va: any) => {
                      const attribut = va.attribut || { 
                        id: va.attribut_id,
                        nom: va.nom, 
                        type_valeur: va.type_valeur, 
                        unite: va.unite 
                      };
                      const valeur = va.valeur;
                      const id = va.id || va.attribut_id;

                      return (
                        <div 
                          key={id}
                          className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <label className="text-sm font-medium text-gray-600 mb-1 block">
                                {attribut.nom}
                              </label>
                              <p className="text-lg font-bold text-gray-900">
                                {valeur}
                                {attribut.unite && (
                                  <span className="text-sm font-normal text-gray-500 ml-1">
                                    {attribut.unite}
                                  </span>
                                )}
                              </p>
                            </div>
                            <Badge variant="success">
                              {attribut.type_valeur}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {produit.categorie?.attributs && produit.categorie.attributs.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">
                        <strong>Attributs de la catégorie "{produit.categorie.nom}" :</strong>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {produit.categorie.attributs.map((attr: any) => {
                          const hasValue = valeursAttributs.some((va: any) => 
                            (va.attribut_id === attr.id) || (va.attribut?.id === attr.id)
                          );
                          return (
                            <span 
                              key={attr.id}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                hasValue 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : attr.pivot?.obligatoire
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}
                            >
                              {attr.nom}
                              {attr.pivot?.obligatoire && <span className="ml-1">*</span>}
                              {hasValue ? ' ✓' : ' —'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })()}

          {/* Prix et marges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Prix et marges
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Prix d'achat</label>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(produit.prix_achat)} FCFA
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Prix de vente</label>
                <p className="text-xl font-bold text-blue-600 mt-1">
                  {formatCurrency(produit.prix_vente)} FCFA
                </p>
              </div>
              {produit.prix_promo && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Prix promo</label>
                    <p className="text-xl font-bold text-red-600 mt-1">
                      {formatCurrency(produit.prix_promo)} FCFA
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Réduction</label>
                    <p className="text-lg font-semibold text-red-600 mt-1">
                      -{Math.round(((produit.prix_vente - produit.prix_promo) / produit.prix_vente) * 100)}%
                    </p>
                  </div>
                </>
              )}
              {produit.marge_montant !== undefined && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Marge unitaire</label>
                  <p className="text-lg font-semibold text-green-600 mt-1">
                    {formatCurrency(produit.marge_montant)} FCFA ({produit.marge_pourcentage?.toFixed(1)}%)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stocks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Gestion des stocks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">Stock Vente</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Quantité actuelle</label>
                    <p className="text-2xl font-bold text-blue-600">{produit.stock_vente}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Seuil d'alerte</label>
                    <p className="text-lg font-semibold text-orange-600">{produit.seuil_alerte}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Seuil critique</label>
                    <p className="text-lg font-semibold text-red-600">{produit.seuil_critique}</p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">Stock Salon (Utilisation)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Quantité actuelle</label>
                    <p className="text-2xl font-bold text-purple-600">{produit.stock_utilisation}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Seuil d'alerte</label>
                    <p className="text-lg font-semibold text-orange-600">{produit.seuil_alerte_utilisation}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Seuil critique</label>
                    <p className="text-lg font-semibold text-red-600">{produit.seuil_critique_utilisation}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Informations temporelles
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Date de création</label>
                <p className="text-gray-900 mt-1">{formatDate(produit.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Dernière modification</label>
                <p className="text-gray-900 mt-1">{formatDate(produit.updated_at)}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">Aucune donnée disponible</p>
        </div>
      )}
    </Modal>
  );
}