// src/app/pages/Produits/components/ProduitFormModal.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './ui/Modal';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Textarea } from './ui/Textarea';
import { produitsApi } from '@/services/produitsApi';
import { Upload, X, ImageOff, Camera } from 'lucide-react';
import type { Produit, Categorie } from '@/types/produit.types';

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
    seuil_alerte: '20',
    seuil_critique: '10',
    seuil_alerte_utilisation: '15',
    seuil_critique_utilisation: '5',
    type_stock_principal: 'mixte',
    is_active: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // État pour la photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        seuil_alerte: produit.seuil_alerte?.toString() || '20',
        seuil_critique: produit.seuil_critique?.toString() || '10',
        seuil_alerte_utilisation: produit.seuil_alerte_utilisation?.toString() || '15',
        seuil_critique_utilisation: produit.seuil_critique_utilisation?.toString() || '5',
        type_stock_principal: produit.type_stock_principal || 'mixte',
        is_active: produit.is_active ?? true
      });

      // Charger la photo existante
      if (produit.photo_url) {
        const photoUrl = getImageUrl(produit.photo_url);
        setPhotoPreview(photoUrl);
      }
    } else {
      resetForm();
    }
  }, [produit]);

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
      seuil_alerte: '20',
      seuil_critique: '10',
      seuil_alerte_utilisation: '15',
      seuil_critique_utilisation: '5',
      type_stock_principal: 'mixte',
      is_active: true
    });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5 MB');
      return;
    }

    setPhotoFile(file);

    // Prévisualisation
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
      alert('✅ Photo supprimée avec succès');
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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

      let produitId: number;

      if (produit) {
        // Mise à jour
        await produitsApi.produits.update(produit.id, payload);
        produitId = produit.id;
        alert('✅ Produit modifié avec succès');
      } else {
        // Création
        const response = await produitsApi.produits.create(payload);
        produitId = response.data.id;
        alert('✅ Produit créé avec succès');
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
      alert('❌ Erreur: ' + (error.message || 'Une erreur est survenue'));
    } finally {
      setIsSubmitting(false);
      setIsUploadingPhoto(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={produit ? 'Modifier le produit' : 'Nouveau produit'}
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section Photo */}
        <div className="space-y-3 border-b pb-4">
          <label className="text-sm font-medium text-gray-700">Photo du produit</label>
          
          <div className="flex gap-4">
            {/* Aperçu photo */}
            <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden flex-shrink-0">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <Camera size={32} className="text-gray-300 mb-1" />
                  <span className="text-xs text-gray-400">Aucune photo</span>
                </div>
              )}
            </div>

            {/* Actions photo */}
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

              <p className="text-xs text-gray-500">
                JPG, PNG, WEBP (max 5 MB)
              </p>
            </div>
          </div>
        </div>

        {/* Reste du formulaire (inchangé) */}
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
            onClick={onClose}
          >
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