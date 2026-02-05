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
import { DEVISES, MOYENS_PAIEMENT } from '@/constants/devises';

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
    date_commande: '',
    prix_achat_stock_total: '', // Prix d'achat du stock total
    quantite_stock_commande: '', // Quantité commandée
    devise_achat: 'FCFA',
    frais_cmb: '',
    frais_transit: '',
    moyen_paiement: '',
    date_reception: '',
    prix_achat: '', // Prix d'achat unitaire (calculé automatiquement)
    prix_vente: '',
    stock_vente: '',
    stock_utilisation: '',
    stock_reserve: '',
    seuil_alerte: '',
    seuil_critique: '',
    seuil_alerte_utilisation: '',
    seuil_critique_utilisation: '',
    seuil_alerte_reserve: '',
    seuil_critique_reserve: '',
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

  // Calcul automatique du prix d'achat unitaire
  useEffect(() => {
    const stockTotal = parseFloat(formData.prix_achat_stock_total) || 0;
    const quantite = parseFloat(formData.quantite_stock_commande) || 0;
    const fraisCmb = parseFloat(formData.frais_cmb) || 0;
    const fraisTransit = parseFloat(formData.frais_transit) || 0;

    if (stockTotal > 0 && quantite > 0) {
      const prixUnitaire = (stockTotal + fraisCmb + fraisTransit) / quantite;
      setFormData(prev => ({
        ...prev,
        prix_achat: prixUnitaire.toFixed(2)
      }));
    }
  }, [formData.prix_achat_stock_total, formData.quantite_stock_commande, formData.frais_cmb, formData.frais_transit]);

  useEffect(() => {
    if (produit) {
      setFormData({
        nom: produit.nom || '',
        reference: produit.reference || '',
        description: produit.description || '',
        categorie_id: produit.categorie_id?.toString() || '',
        marque: produit.marque || '',
        fournisseur: produit.fournisseur || '',
        date_commande: produit.date_commande || '',
        prix_achat_stock_total: '', // Non stocké en base, vide en édition
        quantite_stock_commande: '', // Non stocké en base, vide en édition
        prix_achat: produit.prix_achat?.toString() || '',
        devise_achat: produit.devise_achat || 'FCFA',
        frais_cmb: produit.frais_cmb?.toString() || '',
        frais_transit: produit.frais_transit?.toString() || '',
        moyen_paiement: produit.moyen_paiement || '',
        date_reception: produit.date_reception || '',
        prix_vente: produit.prix_vente?.toString() || '',
        stock_vente: produit.stock_vente?.toString() || '0',
        stock_utilisation: produit.stock_utilisation?.toString() || '0',
        stock_reserve: produit.stock_reserve?.toString() || '0',
        seuil_alerte: produit.seuil_alerte?.toString() || '',
        seuil_critique: produit.seuil_critique?.toString() || '',
        seuil_alerte_utilisation: produit.seuil_alerte_utilisation?.toString() || '',
        seuil_critique_utilisation: produit.seuil_critique_utilisation?.toString() || '',
        seuil_alerte_reserve: produit.seuil_alerte_reserve?.toString() || '',
        seuil_critique_reserve: produit.seuil_critique_reserve?.toString() || '',
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
        const token = tokenStorage.getToken();
        const url = `${import.meta.env.VITE_API_URL}/api/categories/${formData.categorie_id}`;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        const textResponse = await response.text();
        
        if (!response.headers.get('content-type')?.includes('application/json')) {
          console.error('❌ La réponse n\'est pas du JSON!');
          setError('Erreur serveur - réponse invalide');
          return;
        }
        
        const data = JSON.parse(textResponse);
        
        if (data.success && data.data.attributs) {
          setAttributsCategorie(data.data.attributs);
          
          if (produit?.valeurs_attributs) {
            const valeurs: Record<number, string> = {};
            produit.valeurs_attributs.forEach((va: any) => {
              valeurs[va.attribut_id] = va.valeur;
            });
            setValeursAttributs(valeurs);
          }
        } else {
          setAttributsCategorie([]);
        }
        
      } catch (error: any) {
        console.error('❌ Erreur complète:', error);
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
      date_commande: '',
      prix_achat_stock_total: '',
      quantite_stock_commande: '',
      devise_achat: 'FCFA',
      frais_cmb: '',
      frais_transit: '',
      moyen_paiement: '',
      date_reception: '',
      prix_achat: '',
      prix_vente: '',
      stock_vente: '',
      stock_utilisation: '',
      stock_reserve: '',
      seuil_alerte: '',
      seuil_critique: '',
      seuil_alerte_utilisation: '',
      seuil_critique_utilisation: '',
      seuil_alerte_reserve: '',
      seuil_critique_reserve: '',
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
      const isReserve = formData.type_stock_principal === 'reserve';
      
      const payload: any = {
        nom: formData.nom,
        reference: formData.reference,
        description: formData.description,
        categorie_id: parseInt(formData.categorie_id),
        marque: formData.marque,
        fournisseur: formData.fournisseur,
        date_commande: formData.date_commande || null,
        prix_achat: parseFloat(formData.prix_achat),
        devise_achat: formData.devise_achat,
        frais_cmb: formData.frais_cmb ? parseFloat(formData.frais_cmb) : null,
        frais_transit: formData.frais_transit ? parseFloat(formData.frais_transit) : null,
        moyen_paiement: formData.moyen_paiement || null,
        date_reception: formData.date_reception || null,
        prix_vente: parseFloat(formData.prix_vente),
        stock_vente: isReserve ? 0 : (parseInt(formData.stock_vente) || 0),
        stock_utilisation: isReserve ? 0 : (parseInt(formData.stock_utilisation) || 0),
        stock_reserve: isReserve ? (parseInt(formData.stock_reserve) || 0) : 0,
        seuil_alerte: isReserve ? null : (formData.seuil_alerte ? parseInt(formData.seuil_alerte) : null),
        seuil_critique: isReserve ? null : (formData.seuil_critique ? parseInt(formData.seuil_critique) : null),
        seuil_alerte_utilisation: isReserve ? null : (formData.seuil_alerte_utilisation ? parseInt(formData.seuil_alerte_utilisation) : null),
        seuil_critique_utilisation: isReserve ? null : (formData.seuil_critique_utilisation ? parseInt(formData.seuil_critique_utilisation) : null),
        seuil_alerte_reserve: isReserve && formData.seuil_alerte_reserve ? parseInt(formData.seuil_alerte_reserve) : null,
        seuil_critique_reserve: isReserve && formData.seuil_critique_reserve ? parseInt(formData.seuil_critique_reserve) : null,
        type_stock_principal: formData.type_stock_principal,
        is_active: formData.is_active,
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Logique d'affichage conditionnel
  const isReserve = formData.type_stock_principal === 'reserve';
  const showStockVente = !isReserve && ['vente', 'mixte'].includes(formData.type_stock_principal);
  const showStockUtilisation = !isReserve && ['utilisation', 'mixte'].includes(formData.type_stock_principal);

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
              <option value="reserve">Réserve (stock non alloué)</option>
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

        {/* Informations de commande */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Informations de commande</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de commande
              </label>
              <Input
                type="date"
                value={formData.date_commande}
                onChange={(e) => setFormData({ ...formData, date_commande: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de réception
              </label>
              <Input
                type="date"
                value={formData.date_reception}
                onChange={(e) => setFormData({ ...formData, date_reception: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moyen de paiement
              </label>
              <select
                value={formData.moyen_paiement}
                onChange={(e) => setFormData({ ...formData, moyen_paiement: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionnez...</option>
                {MOYENS_PAIEMENT.map((mp) => (
                  <option key={mp.value} value={mp.value}>
                    {mp.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Devise d'achat <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.devise_achat}
                onChange={(e) => setFormData({ ...formData, devise_achat: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {DEVISES.map((devise) => (
                  <option key={devise.value} value={devise.value}>
                    {devise.label} ({devise.symbole})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Prix et coûts */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Prix et coûts d'achat</h3>
          
          {/* Prix d'achat du stock total */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Stock commandé</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix d'achat total du stock
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={formData.prix_achat_stock_total}
                    onChange={(e) => setFormData({ ...formData, prix_achat_stock_total: e.target.value })}
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="flex-1"
                  />
                  <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 flex items-center">
                    {DEVISES.find(d => d.value === formData.devise_achat)?.symbole || 'FCFA'}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Montant total payé pour le stock</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité commandée
                </label>
                <Input
                  type="number"
                  value={formData.quantite_stock_commande}
                  onChange={(e) => setFormData({ ...formData, quantite_stock_commande: e.target.value })}
                  min="0"
                  step="1"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Nombre d'unités</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frais CMB
                </label>
                <Input
                  type="number"
                  value={formData.frais_cmb}
                  onChange={(e) => setFormData({ ...formData, frais_cmb: e.target.value })}
                  min="0"
                  step="0.01"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Frais totaux CMB</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frais de transit/douane
                </label>
                <Input
                  type="number"
                  value={formData.frais_transit}
                  onChange={(e) => setFormData({ ...formData, frais_transit: e.target.value })}
                  min="0"
                  step="0.01"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Frais totaux transit/douane</p>
              </div>
            </div>

            {/* Calcul coût total du stock */}
            {(formData.prix_achat_stock_total || formData.frais_cmb || formData.frais_transit) && (
              <div className="mt-4 pt-3 border-t border-blue-300">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Coût total du stock</span>
                  <span className="text-lg font-bold text-blue-600">
                    {(() => {
                      const total = 
                        (parseFloat(formData.prix_achat_stock_total) || 0) +
                        (parseFloat(formData.frais_cmb) || 0) +
                        (parseFloat(formData.frais_transit) || 0);
                      return formatCurrency(total);
                    })()}{' '}
                    {DEVISES.find(d => d.value === formData.devise_achat)?.symbole || 'FCFA'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Prix unitaire calculé automatiquement */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Prix unitaire (calculé automatiquement)</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix d'achat unitaire <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={formData.prix_achat}
                    onChange={(e) => setFormData({ ...formData, prix_achat: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="flex-1"
                    readOnly={!!(formData.prix_achat_stock_total && formData.quantite_stock_commande)}
                  />
                  <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 flex items-center">
                    {DEVISES.find(d => d.value === formData.devise_achat)?.symbole || 'FCFA'}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {(formData.prix_achat_stock_total && formData.quantite_stock_commande) 
                    ? 'Calculé à partir du stock total'
                    : 'Ou saisir manuellement si stock inconnu'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix de vente unitaire <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={formData.prix_vente}
                    onChange={(e) => setFormData({ ...formData, prix_vente: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="flex-1"
                  />
                  <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 flex items-center">
                    FCFA
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Prix par unité</p>
              </div>
            </div>

            {/* Calcul de la marge */}
            {formData.prix_achat && formData.prix_vente && (
              <div className="mt-4 pt-3 border-t border-green-300">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Marge unitaire</span>
                  <span className="text-base font-bold text-green-600">
                    {(() => {
                      const marge = parseFloat(formData.prix_vente) - parseFloat(formData.prix_achat);
                      const margePct = (marge / parseFloat(formData.prix_achat)) * 100;
                      return `${formatCurrency(marge)} FCFA (${margePct.toFixed(1)}%)`;
                    })()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section Stock Réserve */}
        {isReserve && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Stock de réserve</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800 mb-2">
                ℹ️ Ce produit sera stocké en réserve. Utilisez les transferts pour l'allouer au stock vente ou salon.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité en réserve
                </label>
                <Input
                  type="number"
                  value={formData.stock_reserve}
                  onChange={(e) => setFormData({ ...formData, stock_reserve: e.target.value })}
                  min="0"
                  placeholder="0"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seuil d'alerte <span className="text-gray-400">(optionnel)</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.seuil_alerte_reserve}
                    onChange={(e) => setFormData({ ...formData, seuil_alerte_reserve: e.target.value })}
                    min="0"
                    placeholder="Laisser vide si non souhaité"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seuil critique <span className="text-gray-400">(optionnel)</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.seuil_critique_reserve}
                    onChange={(e) => setFormData({ ...formData, seuil_critique_reserve: e.target.value })}
                    min="0"
                    placeholder="Laisser vide si non souhaité"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section Stocks opérationnels - SEULEMENT si pas réserve */}
        {!isReserve && (
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
        )}

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