// src/app/pages/Produits/components/ProduitFormModal.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './ui/Modal';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Textarea } from './ui/Textarea';
import { produitsApi } from '@/services/produitsApi';
import { Upload, X, Camera, AlertCircle } from 'lucide-react';
import type { Produit, Categorie } from '@/types/produit.types';
import { tokenStorage } from '@/utils/tokenStorage';

interface ProduitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  produit?: Produit | null;
  categories: Categorie[];
}

export function ProduitFormModal({
  isOpen,
  onClose,
  onSuccess,
  produit,
  categories
}: ProduitFormModalProps) {
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
    seuil_alerte: '',
    seuil_critique: '',
    seuil_alerte_utilisation: '',
    seuil_critique_utilisation: '',
    type_stock_principal: 'mixte',
    is_active: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  
  // État pour la photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attributsCategorie, setAttributsCategorie] = useState<any[]>([]);
  const [valeursAttributs, setValeursAttributs] = useState<Record<number, string>>({});

  useEffect(() => {
    if (produit) {
      setFormData({
        nom: produit.nom || '',
        reference: produit.reference || '',
        description: produit.description || '',
        categorie_id: produit.categorie_id?.toString() || '',
        marque: produit.marque || '',
        fournisseur: produit.fournisseur || '',
        prix_achat: produit.prix_achat?.toString() || '',
        prix_vente: produit.prix_vente?.toString() || '',
        stock_vente: produit.stock_vente?.toString() || '0',
        stock_utilisation: produit.stock_utilisation?.toString() || '0',
        seuil_alerte: produit.seuil_alerte?.toString() || '',
        seuil_critique: produit.seuil_critique?.toString() || '',
        seuil_alerte_utilisation: produit.seuil_alerte_utilisation?.toString() || '',
        seuil_critique_utilisation: produit.seuil_critique_utilisation?.toString() || '',
        type_stock_principal: produit.type_stock_principal || 'mixte',
        is_active: produit.is_active ?? true
      });

      if (produit.photo_url) {
        const photoUrl = getImageUrl(produit.photo_url);
        setPhotoPreview(photoUrl);
      }
    } else {
      resetForm();
    }
    setError('');
  }, [produit]);

  useEffect(() => {
  const loadAttributs = async () => {
    if (!formData.categorie_id) {
      setAttributsCategorie([]);
      return;
    }

    try {
      console.log('🔍 Chargement attributs pour catégorie:', formData.categorie_id);
      
      const token = tokenStorage.getToken();
      const url = `${import.meta.env.VITE_API_URL}/api/categories/${formData.categorie_id}`;
      
      // console.log('📡 URL:', url);
      // console.log('🔑 Token:', token ? 'Présent' : 'ABSENT');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      // console.log('📥 Status:', response.status);
      // console.log('📥 Content-Type:', response.headers.get('content-type'));
      
      // Lire la réponse brute AVANT de parser
      const textResponse = await response.text();
      //console.log('📥 Réponse brute (premiers 1000 chars):', textResponse.substring(0, 1000));
      
      // Si ce n'est pas du JSON, arrêter ici
      if (!response.headers.get('content-type')?.includes('application/json')) {
        console.error('❌ La réponse n\'est pas du JSON!');
        setError('Erreur serveur - réponse invalide');
        return;
      }
      
      const data = JSON.parse(textResponse);
      //console.log('✅ Data parsée:', data);
      
      if (data.success && data.data.attributs) {
        //console.log('✅ Attributs trouvés:', data.data.attributs);
        setAttributsCategorie(data.data.attributs);
        
        if (produit?.valeurs_attributs) {
          const valeurs: Record<number, string> = {};
          produit.valeurs_attributs.forEach((va: any) => {
            valeurs[va.attribut_id] = va.valeur;
          });
          setValeursAttributs(valeurs);
        }
      } else {
        //console.warn('⚠️ Pas d\'attributs dans la réponse');
        setAttributsCategorie([]);
      }
      
    } catch (error: any) {
      console.error('❌ Erreur complète:', error);
      console.error('❌ Message:', error.message);
      console.error('❌ Stack:', error.stack);
      setAttributsCategorie([]);
    }
  };

    loadAttributs();
  }, [formData.categorie_id, produit]);

  const getImageUrl = (url: string) => {
    if (!url) return null;
    const cleanUrl = url.replace(/^(storage\/)+/, '');
    return `${import.meta.env.VITE_API_URL}/storage/${cleanUrl}`;
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
      seuil_alerte: '',
      seuil_critique: '',
      seuil_alerte_utilisation: '',
      seuil_critique_utilisation: '',
      type_stock_principal: 'mixte',
      is_active: true
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setError('');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5 MB');
      return;
    }

    setPhotoFile(file);
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteExistingPhoto = async () => {
    if (!produit || !confirm('Supprimer la photo actuelle ?')) return;

    try {
      setIsUploadingPhoto(true);
      await produitsApi.produits.deletePhoto(produit.id);
      setPhotoPreview(null);
      setError('');
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la suppression de la photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload: any = {
        ...formData,
        categorie_id: parseInt(formData.categorie_id),
        prix_achat: parseFloat(formData.prix_achat),
        prix_vente: parseFloat(formData.prix_vente),
        stock_vente: parseInt(formData.stock_vente) || 0,
        stock_utilisation: parseInt(formData.stock_utilisation) || 0,
        
        // Seuils optionnels - envoyer null si vide
        seuil_alerte: formData.seuil_alerte ? parseInt(formData.seuil_alerte) : null,
        seuil_critique: formData.seuil_critique ? parseInt(formData.seuil_critique) : null,
        seuil_alerte_utilisation: formData.seuil_alerte_utilisation ? parseInt(formData.seuil_alerte_utilisation) : null,
        seuil_critique_utilisation: formData.seuil_critique_utilisation ? parseInt(formData.seuil_critique_utilisation) : null,
        
        attributs: valeursAttributs
      };

      let produitId: number;

      if (produit) {
        await produitsApi.produits.update(produit.id, payload);
        produitId = produit.id;
      } else {
        const response = await produitsApi.produits.create(payload);
        produitId = response.data.id;
      }

      // Upload de la photo si présente
      if (photoFile) {
        setIsUploadingPhoto(true);
        await produitsApi.produits.uploadPhoto(produitId, photoFile);
      }

      onSuccess();
      onClose();
      resetForm();
      
    } catch (error: any) {
      console.error('Erreur soumission:', error);
      
      // Gestion d'erreur lisible
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] as string : 'Erreur de validation');
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Une erreur est survenue lors de l\'enregistrement');
      }
    } finally {
      setIsSubmitting(false);
      setIsUploadingPhoto(false);
    }
  };

  // Déterminer quels stocks afficher
  const showStockVente = formData.type_stock_principal === 'vente' || formData.type_stock_principal === 'mixte';
  const showStockUtilisation = formData.type_stock_principal === 'utilisation' || formData.type_stock_principal === 'mixte';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={produit ? 'Modifier le produit' : 'Nouveau produit'}
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Message d'erreur */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-800 font-medium">Erreur</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Section Photo */}
        <div className="space-y-3 border-b pb-4">
          <label className="text-sm font-medium text-gray-700">Photo du produit</label>
          
          <div className="flex gap-4">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden flex-shrink-0">
              {photoPreview ? (
                <img src={photoPreview} alt="Aperçu" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <Camera size={32} className="text-gray-300 mb-1" />
                  <span className="text-xs text-gray-400">Aucune photo</span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting || isUploadingPhoto}
              >
                <Upload className="w-4 h-4 mr-2" />
                {photoPreview ? 'Changer la photo' : 'Choisir une photo'}
              </Button>

              {photoPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={photoFile ? handleRemovePhoto : handleDeleteExistingPhoto}
                  disabled={isSubmitting || isUploadingPhoto}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              )}

              <p className="text-xs text-gray-500">JPG, PNG, WEBP (max 5 MB)</p>
            </div>
          </div>
        </div>

        {/* Informations de base */}
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

        {/* Attributs dynamiques */}
        {attributsCategorie.length > 0 && (
          <div className="border-t pt-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Caractéristiques du produit</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {attributsCategorie.map((attr) => (
                <div key={attr.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {attr.nom}
                    {attr.pivot?.obligatoire && <span className="text-red-500">*</span>}
                  </label>
                  
                  {attr.type_valeur === 'liste' ? (
                    <select
                      value={valeursAttributs[attr.id] || ''}
                      onChange={(e) => setValeursAttributs({
                        ...valeursAttributs,
                        [attr.id]: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required={attr.pivot?.obligatoire}
                    >
                      <option value="">Sélectionnez...</option>
                      {attr.valeurs_possibles?.map((val: string, idx: number) => (
                        <option key={idx} value={val}>{val}</option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type={attr.type_valeur === 'nombre' ? 'number' : 'text'}
                      value={valeursAttributs[attr.id] || ''}
                      onChange={(e) => setValeursAttributs({
                        ...valeursAttributs,
                        [attr.id]: e.target.value
                      })}
                      placeholder={attr.unite ? `Valeur en ${attr.unite}` : ''}
                      required={attr.pivot?.obligatoire}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
            <Input
              value={formData.marque}
              onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
              placeholder="Marque du produit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
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

        {/* Section Stocks - Affichage conditionnel */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Stocks et seuils</h3>
          
          <div className={`grid ${showStockVente && showStockUtilisation ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
            {/* Stock Vente */}
            {showStockVente && (
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
                  <label className="block text-xs text-gray-600 mb-1">
                    Seuil alerte <span className="text-gray-400">(optionnel)</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.seuil_alerte}
                    onChange={(e) => setFormData({ ...formData, seuil_alerte: e.target.value })}
                    min="0"
                    placeholder="Laisser vide si non souhaité"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Seuil critique <span className="text-gray-400">(optionnel)</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.seuil_critique}
                    onChange={(e) => setFormData({ ...formData, seuil_critique: e.target.value })}
                    min="0"
                    placeholder="Laisser vide si non souhaité"
                  />
                </div>
              </div>
            )}

            {/* Stock Salon */}
            {showStockUtilisation && (
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
                  <label className="block text-xs text-gray-600 mb-1">
                    Seuil alerte <span className="text-gray-400">(optionnel)</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.seuil_alerte_utilisation}
                    onChange={(e) => setFormData({ ...formData, seuil_alerte_utilisation: e.target.value })}
                    min="0"
                    placeholder="Laisser vide si non souhaité"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Seuil critique <span className="text-gray-400">(optionnel)</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.seuil_critique_utilisation}
                    onChange={(e) => setFormData({ ...formData, seuil_critique_utilisation: e.target.value })}
                    min="0"
                    placeholder="Laisser vide si non souhaité"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploadingPhoto}>
            {isSubmitting || isUploadingPhoto 
              ? 'Enregistrement...' 
              : produit ? 'Modifier' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}