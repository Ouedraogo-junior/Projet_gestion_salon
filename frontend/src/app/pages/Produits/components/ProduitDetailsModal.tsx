// src/app/pages/Produits/components/ProduitDetailsModal.tsx
import { useEffect, useState } from 'react';
import { X, Package, Tag, DollarSign, Calendar, Info, ImageOff } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';
import { produitsApi } from '@/services/produitsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { DEVISES, MOYENS_PAIEMENT } from '@/constants/devises';

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
        <div className="space-y-4 sm:space-y-6">
          {/* En-tête avec photo - Responsive */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden border-2 border-gray-200">
                {imageUrl && !imageError ? (
                  <img
                    src={imageUrl}
                    alt={produit.nom}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <ImageOff size={48} className="sm:w-16 sm:h-16 text-gray-300 mb-2" />
                    <p className="text-xs sm:text-sm text-gray-400">Aucune photo</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{produit.nom}</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Réf: {produit.reference || 'N/A'}</p>
                  {produit.marque && (
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      <span className="font-medium">Marque:</span> {produit.marque}
                    </p>
                  )}
                  {produit.fournisseur && (
                    <p className="text-xs sm:text-sm text-gray-600">
                      <span className="font-medium">Fournisseur:</span> {produit.fournisseur}
                    </p>
                  )}
                </div>
                <Badge variant={produit.is_active ? 'success' : 'danger'} className="self-start">
                  {produit.is_active ? 'Actif' : 'Inactif'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4">
                <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                  <label className="text-xs text-gray-600">Prix d'achat</label>
                  <p className="text-base sm:text-lg font-bold text-gray-900">
                    {formatCurrency(produit.prix_achat)} FCFA
                  </p>
                </div>
                <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                  <label className="text-xs text-gray-600">Prix de vente</label>
                  <p className="text-base sm:text-lg font-bold text-blue-600">
                    {formatCurrency(produit.prix_vente)} FCFA
                  </p>
                </div>
              </div>

              {produit.prix_promo && (
                <div className="mt-3 bg-red-50 border border-red-200 p-2 sm:p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-red-600 font-medium">PROMOTION</span>
                      <p className="text-base sm:text-lg font-bold text-red-600">
                        {formatCurrency(produit.prix_promo)} FCFA
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-bold text-red-600">
                        -{Math.round(((produit.prix_vente - produit.prix_promo) / produit.prix_vente) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {produit.description && (
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-700">{produit.description}</p>
            </div>
          )}

          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">Catégorie</label>
                  <p className="text-sm sm:text-base text-gray-900 mt-1 font-semibold">
                    {produit.categorie?.nom || 'Non définie'}
                  </p>
                  {produit.categorie?.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {produit.categorie.description}
                    </p>
                  )}
                  {produit.categorie?.couleur && (
                    <div 
                      className="w-20 sm:w-24 h-2 rounded mt-2" 
                      style={{ backgroundColor: produit.categorie.couleur }}
                    />
                  )}
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">Type de stock</label>
                  <p className="text-sm sm:text-base text-gray-900 mt-1 capitalize">
                    {produit.type_stock_principal === 'vente' && 'Vente uniquement'}
                    {produit.type_stock_principal === 'utilisation' && 'Utilisation salon'}
                    {produit.type_stock_principal === 'mixte' && 'Mixte (vente + salon)'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations d'achat */}
{(produit.date_commande || produit.frais_cmb || produit.frais_transit || produit.moyen_paiement || produit.date_reception) && (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
        Informations d'achat
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {produit.date_commande && (
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-600">Date de commande</label>
            <p className="text-sm sm:text-base text-gray-900 mt-1">{formatDate(produit.date_commande)}</p>
          </div>
        )}
        
        {produit.date_reception && (
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-600">Date de réception</label>
            <p className="text-sm sm:text-base text-gray-900 mt-1">{formatDate(produit.date_reception)}</p>
          </div>
        )}

        {produit.moyen_paiement && (
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-600">Moyen de paiement</label>
            <p className="text-sm sm:text-base text-gray-900 mt-1 capitalize">
              {MOYENS_PAIEMENT.find(mp => mp.value === produit.moyen_paiement)?.label || produit.moyen_paiement}
            </p>
          </div>
        )}

        {produit.devise_achat && produit.devise_achat !== 'FCFA' && (
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-600">Devise d'achat</label>
            <p className="text-sm sm:text-base text-gray-900 mt-1">
              {DEVISES.find(d => d.value === produit.devise_achat)?.label || produit.devise_achat}
              {' '}
              ({DEVISES.find(d => d.value === produit.devise_achat)?.symbole})
            </p>
          </div>
        )}
      </div>

      {/* Détails des frais */}
      {(produit.frais_cmb || produit.frais_transit || produit.montant_total_achat) && (
        <div className="mt-4 p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Détails des coûts</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Prix d'achat</span>
              <span className="text-sm sm:text-base font-medium text-gray-900">
                {formatCurrency(produit.prix_achat)}{' '}
                {DEVISES.find(d => d.value === produit.devise_achat)?.symbole || 'FCFA'}
              </span>
            </div>
            
            {produit.frais_cmb && (
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Frais CMB</span>
                <span className="text-sm sm:text-base font-medium text-gray-900">
                  +{formatCurrency(produit.frais_cmb)}{' '}
                  {DEVISES.find(d => d.value === produit.devise_achat)?.symbole || 'FCFA'}
                </span>
              </div>
            )}
            
            {produit.frais_transit && (
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Frais transit/douane</span>
                <span className="text-sm sm:text-base font-medium text-gray-900">
                  +{formatCurrency(produit.frais_transit)}{' '}
                  {DEVISES.find(d => d.value === produit.devise_achat)?.symbole || 'FCFA'}
                </span>
              </div>
            )}
            
            {produit.montant_total_achat && (
              <>
                <div className="border-t border-blue-300 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base font-semibold text-gray-900">Total</span>
                  <span className="text-lg sm:text-xl font-bold text-blue-600">
                    {formatCurrency(produit.montant_total_achat)}{' '}
                    {DEVISES.find(d => d.value === produit.devise_achat)?.symbole || 'FCFA'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
)}

          {/* Caractéristiques */}
          {(() => {
            const valeursAttributs = produit.valeursAttributs || produit.attributs || [];
            
            if (!Array.isArray(valeursAttributs) || valeursAttributs.length === 0) {
              return null;
            }

            return (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
                    Caractéristiques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                          className="bg-gradient-to-br from-blue-50 to-purple-50 p-3 sm:p-4 rounded-lg border border-blue-100"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <label className="text-xs sm:text-sm font-medium text-gray-600 mb-1 block">
                                {attribut.nom}
                              </label>
                              <p className="text-base sm:text-lg font-bold text-gray-900 break-words">
                                {valeur}
                                {attribut.unite && (
                                  <span className="text-xs sm:text-sm font-normal text-gray-500 ml-1">
                                    {attribut.unite}
                                  </span>
                                )}
                              </p>
                            </div>
                            <Badge variant="success" className="text-xs ml-2 flex-shrink-0">
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
                              className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
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
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                Prix et marges
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600">Prix d'achat</label>
                <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(produit.prix_achat)} FCFA
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600">Prix de vente</label>
                <p className="text-lg sm:text-xl font-bold text-blue-600 mt-1">
                  {formatCurrency(produit.prix_vente)} FCFA
                </p>
              </div>
              {produit.prix_promo && (
                <>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600">Prix promo</label>
                    <p className="text-lg sm:text-xl font-bold text-red-600 mt-1">
                      {formatCurrency(produit.prix_promo)} FCFA
                    </p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600">Réduction</label>
                    <p className="text-base sm:text-lg font-semibold text-red-600 mt-1">
                      -{Math.round(((produit.prix_vente - produit.prix_promo) / produit.prix_vente) * 100)}%
                    </p>
                  </div>
                </>
              )}
              {produit.marge_montant !== undefined && (
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">Marge unitaire</label>
                  <p className="text-base sm:text-lg font-semibold text-green-600 mt-1">
                    {formatCurrency(produit.marge_montant)} FCFA ({produit.marge_pourcentage?.toFixed(1)}%)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stocks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                Gestion des stocks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-3 sm:pl-4">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Stock Vente</h4>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Actuelle</label>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">{produit.stock_vente}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Alerte</label>
                    <p className="text-base sm:text-lg font-semibold text-orange-600">{produit.seuil_alerte}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Critique</label>
                    <p className="text-base sm:text-lg font-semibold text-red-600">{produit.seuil_critique}</p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-purple-500 pl-3 sm:pl-4">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Stock Salon</h4>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Actuelle</label>
                    <p className="text-xl sm:text-2xl font-bold text-purple-600">{produit.stock_utilisation}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Alerte</label>
                    <p className="text-base sm:text-lg font-semibold text-orange-600">{produit.seuil_alerte_utilisation}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Critique</label>
                    <p className="text-base sm:text-lg font-semibold text-red-600">{produit.seuil_critique_utilisation}</p>
                  </div>
                </div>
              </div>

              {/* Stock Réserve - SI EXISTE */}
              {produit.type_stock_principal === 'reserve' && (
                <div className="border-l-4 border-amber-500 pl-3 sm:pl-4">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Stock Réserve</h4>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div>
                      <label className="text-xs text-gray-600">Actuelle</label>
                      <p className="text-xl sm:text-2xl font-bold text-amber-600">{produit.stock_reserve || 0}</p>
                    </div>
                    {produit.seuil_alerte_reserve && (
                      <div>
                        <label className="text-xs text-gray-600">Alerte</label>
                        <p className="text-base sm:text-lg font-semibold text-orange-600">{produit.seuil_alerte_reserve}</p>
                      </div>
                    )}
                    {produit.seuil_critique_reserve && (
                      <div>
                        <label className="text-xs text-gray-600">Critique</label>
                        <p className="text-base sm:text-lg font-semibold text-red-600">{produit.seuil_critique_reserve}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                Informations temporelles
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600">Création</label>
                <p className="text-xs sm:text-sm text-gray-900 mt-1">{formatDate(produit.created_at)}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600">Modification</label>
                <p className="text-xs sm:text-sm text-gray-900 mt-1">{formatDate(produit.updated_at)}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
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