// src/app/pages/public/components/ProduitDetailsModal.tsx
import { useEffect, useState } from 'react';
import { X, Package, ShoppingCart, ImageOff, Sparkles, Tag } from 'lucide-react';
import { publicApiService } from '@/services/publicApi';

interface ProduitDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  produitId: number;
  salonTel: string;
  salonNom: string;
}

export function ProduitDetailsModal({ 
  isOpen, 
  onClose, 
  produitId,
  salonTel,
  salonNom 
}: ProduitDetailsModalProps) {
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
      const response = await publicApiService.getProduitDetails(produitId);
      
      console.log('📦 Réponse API:', response);
      
      if (response.success && response.data) {
        setProduit(response.data);
        setImageError(false);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    return new Intl.NumberFormat('fr-FR').format(value ?? 0);
  };

  const handleCommander = () => {
    const message = `Bonjour ${salonNom}, je suis intéressé(e) par le produit : ${produit?.nom}`;
    const whatsappUrl = `https://wa.me/${salonTel.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <h3 className="text-xl font-bold text-gray-900">Détails du produit</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Chargement...</p>
            </div>
          ) : produit ? (
            <div className="space-y-6">
              {/* Grille principale */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Photo */}
                <div>
                  <div className="aspect-square bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl overflow-hidden">
                    {produit.photo_url && !imageError ? (
                      <img
                        src={produit.photo_url}
                        alt={produit.nom}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <ImageOff size={80} className="text-gray-300" />
                        <p className="text-sm text-gray-400 mt-2">Aucune photo</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Infos */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{produit.nom}</h2>
                    {produit.marque && (
                      <p className="text-lg text-gray-600 mt-1">
                        Marque: <span className="font-semibold">{produit.marque}</span>
                      </p>
                    )}
                    {produit.categorie && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-500">Catégorie:</span>
                        <span 
                          className="px-3 py-1 rounded-full text-sm font-medium text-white"
                          style={{ backgroundColor: produit.categorie.couleur || '#6366f1' }}
                        >
                          {produit.categorie.nom}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Prix */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl">
                    <div className="text-3xl font-bold text-indigo-600">
                      {formatCurrency(produit.prix_vente)} FCFA
                    </div>
                  </div>

                  {/* Description */}
                  {produit.description && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">{produit.description}</p>
                    </div>
                  )}

                  {/* Stock */}
                  <div className="flex items-center gap-2">
                    <Package size={18} className="text-gray-500" />
                    <span className="text-gray-600">
                      Stock: <span className="font-semibold text-green-600">{produit.stock_vente} unités</span>
                    </span>
                  </div>

                  {/* Bouton */}
                  <button
                    onClick={handleCommander}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700"
                  >
                    <ShoppingCart size={20} />
                    Commander via WhatsApp
                  </button>
                </div>
              </div>

              {/* Caractéristiques */}
              {produit.valeurs_attributs && produit.valeurs_attributs.length > 0 && (
                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="text-indigo-600" size={24} />
                    Caractéristiques
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {produit.valeurs_attributs.map((va: any) => (
                      <div key={va.id} className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">{va.attribut.nom}</p>
                            <p className="text-lg font-bold text-gray-900">
                              {va.valeur} {va.attribut.unite || ''}
                            </p>
                          </div>
                          <Tag className="text-indigo-400" size={20} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Produit non trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}