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
  const [isUpdating, setIsUpdating] = useState(false);

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


  const handleToggleActive = async () => {
  if (!produit) return;
  
  if (!confirm(`${produit.is_active ? 'Désactiver' : 'Activer'} ce produit ?`)) {
    return;
  }

  try {
    setIsUpdating(true);
    await produitsApi.produits.update(produit.id, {
      is_active: !produit.is_active
    });
    
    // Recharger les détails
    await loadProduitDetails();
  } catch (error: any) {
    console.error('❌ Erreur:', error);
    alert('❌ Erreur lors de la modification: ' + error.message);
  } finally {
    setIsUpdating(false);
  }
};

const handleToggleVisibility = async () => {
  if (!produit) return;
  
  if (!confirm(`Rendre ce produit ${produit.visible_public ? 'privé' : 'public'} ?`)) {
    return;
  }

  try {
    setIsUpdating(true);
    await produitsApi.produits.update(produit.id, {
      visible_public: !produit.visible_public
    });
    
    // Recharger les détails
    await loadProduitDetails();
  } catch (error: any) {
    console.error('❌ Erreur:', error);
    alert('❌ Erreur lors de la modification: ' + error.message);
  } finally {
    setIsUpdating(false);
  }
};

    useEffect(() => {
    if (produit) {
      console.log('📦 Produit complet:', produit);
      console.log('💰 prix_achat_stock_total:', produit.prix_achat_stock_total);
      console.log('💰 montant_total_achat:', produit.montant_total_achat);
      console.log('💰 prix_achat_devise_origine:', produit.prix_achat_devise_origine);
      console.log('💰 prix_achat (FCFA):', produit.prix_achat);
    }
  }, [produit]);

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
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                <Info className="w-5 h-5 text-blue-600" />
                ℹ️ Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
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
{(produit.date_commande || produit.frais_cmb || produit.frais_transit || produit.moyen_paiement || produit.date_reception || produit.prix_achat_devise_origine) && (
  <Card>
    <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500">
      <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
        <Calendar className="w-5 h-5 text-amber-600" />
        📦 Informations d'achat
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4 pt-4">
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

        {produit.devise_achat && (
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-600">Devise d'achat</label>
            <p className="text-sm sm:text-base text-gray-900 mt-1">
              {DEVISES.find(d => d.value === produit.devise_achat)?.label || produit.devise_achat}
              {' '}
              ({DEVISES.find(d => d.value === produit.devise_achat)?.symbole})
            </p>
          </div>
        )}

        {produit.quantite_stock_commande && (
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-600">Quantité commandée</label>
            <p className="text-sm sm:text-base text-gray-900 mt-1 font-semibold">
              {produit.quantite_stock_commande} unités
            </p>
          </div>
        )}

        {produit.taux_change && produit.devise_achat !== 'FCFA' && (
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-600">Taux de change appliqué</label>
            <p className="text-sm sm:text-base text-gray-900 mt-1">
              1 {DEVISES.find(d => d.value === produit.devise_achat)?.symbole} = {produit.taux_change} FCFA
            </p>
          </div>
        )}
      </div>

      {/* Prix unitaire dans les deux devises */}
      {produit.prix_achat_devise_origine && produit.devise_achat !== 'FCFA' && (
        <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-lg">💵</span>
            Prix unitaire
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">
                En {DEVISES.find(d => d.value === produit.devise_achat)?.label}
              </span>
              <span className="text-base sm:text-lg font-bold text-purple-600">
                {formatCurrency(produit.prix_achat_devise_origine)}{' '}
                {DEVISES.find(d => d.value === produit.devise_achat)?.symbole}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-purple-200">
              <span className="text-xs sm:text-sm text-gray-600">Converti en FCFA</span>
              <span className="text-lg sm:text-xl font-bold text-blue-600">
                {formatCurrency(produit.prix_achat)} FCFA
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Détails des coûts du stock total */}
{(produit.prix_achat_stock_total || produit.frais_cmb || produit.frais_transit || 
  produit.frais_bancaires || produit.frais_courtier || produit.frais_transport_local || 
  produit.cbm || produit.poids_kg) && (
  <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
      <span className="text-lg">📊</span>
      Coût total du stock commandé
    </h4>
    
    {/* Informations physiques */}
    {(produit.cbm || produit.poids_kg) && (
      <div className="mb-4 pb-3 border-b border-blue-200">
        <h5 className="text-xs font-medium text-gray-600 mb-2">Informations physiques</h5>
        <div className="grid grid-cols-2 gap-3">
          {produit.cbm && (
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">CBM (m³)</span>
              <span className="text-sm sm:text-base font-medium text-gray-900">
                {produit.cbm}
              </span>
            </div>
          )}
          {produit.poids_kg && (
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Poids (kg)</span>
              <span className="text-sm sm:text-base font-medium text-gray-900">
                {produit.poids_kg}
              </span>
            </div>
          )}
        </div>
      </div>
    )}
    
    <div className="space-y-2">
      {produit.prix_achat_stock_total && (
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-gray-600">Prix d'achat stock total</span>
          <span className="text-sm sm:text-base font-medium text-gray-900">
            {formatCurrency(produit.prix_achat_stock_total)}{' '}
            {DEVISES.find(d => d.value === produit.devise_achat)?.symbole || 'FCFA'}
          </span>
        </div>
      )}
      
      {produit.frais_cmb && produit.frais_cmb > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-gray-600">Frais CMB</span>
          <span className="text-sm sm:text-base font-medium text-gray-900">
            +{formatCurrency(produit.frais_cmb)}{' '}
            {DEVISES.find(d => d.value === produit.devise_achat)?.symbole || 'FCFA'}
          </span>
        </div>
      )}
      
      {produit.frais_transit && produit.frais_transit > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-gray-600">Frais transit/douane</span>
          <span className="text-sm sm:text-base font-medium text-gray-900">
            +{formatCurrency(produit.frais_transit)}{' '}
            {DEVISES.find(d => d.value === produit.devise_achat)?.symbole || 'FCFA'}
          </span>
        </div>
      )}

      {produit.frais_bancaires && produit.frais_bancaires > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-gray-600">Frais bancaires</span>
          <span className="text-sm sm:text-base font-medium text-gray-900">
            +{formatCurrency(produit.frais_bancaires)}{' '}
            {DEVISES.find(d => d.value === produit.devise_achat)?.symbole || 'FCFA'}
          </span>
        </div>
      )}

      {produit.frais_courtier && produit.frais_courtier > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-gray-600">Frais courtier</span>
          <span className="text-sm sm:text-base font-medium text-gray-900">
            +{formatCurrency(produit.frais_courtier)}{' '}
            {DEVISES.find(d => d.value === produit.devise_achat)?.symbole || 'FCFA'}
          </span>
        </div>
      )}

      {produit.frais_transport_local && produit.frais_transport_local > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-gray-600">Frais transport local</span>
          <span className="text-sm sm:text-base font-medium text-gray-900">
            +{formatCurrency(produit.frais_transport_local)}{' '}
            {DEVISES.find(d => d.value === produit.devise_achat)?.symbole || 'FCFA'}
          </span>
        </div>
      )}
      
      {produit.montant_total_achat && produit.montant_total_achat > 0 && (
        <>
          <div className="border-t border-blue-300 my-2"></div>
          <div className="flex justify-between items-center">
            <span className="text-sm sm:text-base font-semibold text-gray-900">Coût total du stock</span>
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
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                    <Tag className="w-5 h-5 text-indigo-600" />
                    📋 Caractéristiques
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
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
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                <DollarSign className="w-5 h-5 text-green-600" />
                💰 Prix et marges
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 pt-4">
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


           {/* Gains totaux */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                💎 Gains totaux
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Gain sur stock commandé */}
              {produit.gain_total_commande !== undefined && produit.quantite_stock_commande && (
                <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600">
                        Gain sur stock commandé
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        {produit.quantite_stock_commande} unités × {formatCurrency(produit.marge_montant || 0)} FCFA
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl sm:text-2xl font-bold text-purple-600">
                        {formatCurrency(produit.gain_total_commande)} FCFA
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-purple-200">
                    <p className="text-xs text-purple-700">
                      💡 Gain potentiel si tout le stock commandé est vendu
                    </p>
                  </div>
                </div>
              )}

              {/* Gain sur stock actuel */}
              {produit.gain_total_stock_actuel !== undefined && produit.stock_total && (
                <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600">
                        Gain sur stock actuel
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        {produit.stock_total} unités × {formatCurrency(produit.marge_montant || 0)} FCFA
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                        {formatCurrency(produit.gain_total_stock_actuel)} FCFA
                      </p>
                    </div>
                  </div>
                  
                  {/* Détail par type de stock */}
                  <div className="mt-3 pt-3 border-t border-emerald-200 space-y-2">
                    {produit.stock_vente > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">
                          🛒 Stock vente ({produit.stock_vente} unités)
                        </span>
                        <span className="font-semibold text-blue-600">
                          {formatCurrency((produit.marge_montant || 0) * produit.stock_vente)} FCFA
                        </span>
                      </div>
                    )}
                    {produit.stock_utilisation > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">
                          💇‍♀️ Stock salon ({produit.stock_utilisation} unités)
                        </span>
                        <span className="font-semibold text-purple-600">
                          {formatCurrency((produit.marge_montant || 0) * produit.stock_utilisation)} FCFA
                        </span>
                      </div>
                    )}
                    {produit.stock_reserve > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">
                          🏪 Stock réserve ({produit.stock_reserve} unités)
                        </span>
                        <span className="font-semibold text-amber-600">
                          {formatCurrency((produit.marge_montant || 0) * produit.stock_reserve)} FCFA
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-emerald-300">
                    <p className="text-xs text-emerald-700">
                      💰 Gain réel si tout le stock actuel est vendu maintenant
                    </p>
                  </div>
                </div>
              )}

              {/* Message si pas de stock */}
              {(!produit.stock_total || produit.stock_total === 0) && 
               (!produit.quantite_stock_commande || produit.quantite_stock_commande === 0) && (
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">
                    📦 Aucun stock disponible pour calculer les gains
                  </p>
                </div>
              )}
            </CardContent>
          </Card>   


          {/* Stocks */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-teal-500">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                <Package className="w-5 h-5 text-teal-600" />
                📊 Gestion des stocks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="border-l-4 border-blue-500 pl-3 sm:pl-4 bg-blue-50 rounded-r-lg py-3">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-lg">🛒</span>
                  Stock Vente
                </h4>
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

              <div className="border-l-4 border-purple-500 pl-3 sm:pl-4 bg-purple-50 rounded-r-lg py-3">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-lg">💇‍♀️</span>
                  Stock Salon
                </h4>
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
                <div className="border-l-4 border-amber-500 pl-3 sm:pl-4 bg-amber-50 rounded-r-lg py-3">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-lg">🏪</span>
                    Stock Réserve
                  </h4>
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
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-500">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                <Calendar className="w-5 h-5 text-gray-600" />
                🕐 Informations temporelles
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4">
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

{/* Statut et visibilité */}
<Card>
  <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-l-4 border-violet-500">
    <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
      <Info className="w-5 h-5 text-violet-600" />
      🔒 Statut et visibilité
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4 pt-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Statut du produit */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
        <label className="text-xs sm:text-sm font-medium text-gray-600 mb-2 block">
          Statut du produit
        </label>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant={produit.is_active ? 'success' : 'danger'} className="text-sm">
              {produit.is_active ? 'Actif' : 'Inactif'}
            </Badge>
            <span className="text-xs text-gray-500">
              {produit.is_active 
                ? 'Disponible pour vente/utilisation' 
                : 'Produit désactivé'}
            </span>
          </div>
          <button
            onClick={handleToggleActive}
            disabled={isUpdating}
            className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              produit.is_active
                ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isUpdating ? 'Modification...' : produit.is_active ? 'Désactiver' : 'Activer'}
          </button>
        </div>
      </div>

      {/* Visibilité publique */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
        <label className="text-xs sm:text-sm font-medium text-gray-600 mb-2 block">
          Visibilité publique
        </label>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant={produit.visible_public ? 'success' : 'warning'} className="text-sm">
              {produit.visible_public ? 'Public' : 'Privé'}
            </Badge>
            <span className="text-xs text-gray-500">
              {produit.visible_public 
                ? 'Visible sur le site web' 
                : 'Masqué du public'}
            </span>
          </div>
          <button
            onClick={handleToggleVisibility}
            disabled={isUpdating}
            className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              produit.visible_public
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isUpdating ? 'Modification...' : produit.visible_public ? 'Rendre privé' : 'Rendre public'}
          </button>
        </div>
      </div>
    </div>

    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
      <p className="text-xs text-amber-800">
        <strong>ℹ️ Note :</strong> Un produit peut être actif mais privé (disponible en interne uniquement) 
        ou public mais inactif (visible mais non disponible à la vente).
      </p>
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