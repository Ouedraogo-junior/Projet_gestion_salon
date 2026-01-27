// src/app/pages/Produits/components/CategorieFormModal.tsx
import { useState, useEffect } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Textarea } from './ui/Textarea';
import { Badge } from './ui/Badge';
import { produitsApi } from '@/services/produitsApi';
import { useAttributs } from '@/hooks/useProduitsModule';

interface CategorieFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categorie?: any; // Pour édition
}

interface AttributSelection {
  attribut_id: number;
  obligatoire: boolean;
  ordre: number;
}

export function CategorieFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  categorie 
}: CategorieFormModalProps) {
  const { data: attributsDisponibles } = useAttributs();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    icone: '',
    couleur: '#3B82F6',
    ordre: '0',
    is_active: true
  });
  const [selectedAttributs, setSelectedAttributs] = useState<AttributSelection[]>([]);

  useEffect(() => {
    if (categorie) {
      // Mode édition
      setFormData({
        nom: categorie.nom || '',
        description: categorie.description || '',
        icone: categorie.icone || '',
        couleur: categorie.couleur || '#3B82F6',
        ordre: categorie.ordre?.toString() || '0',
        is_active: categorie.is_active ?? true
      });
      
      // Charger les attributs existants
      if (categorie.attributs) {
        setSelectedAttributs(
          categorie.attributs.map((attr: any) => ({
            attribut_id: attr.id,
            obligatoire: attr.pivot?.obligatoire || false,
            ordre: attr.pivot?.ordre || 0
          }))
        );
      }
    } else {
      // Mode création
      resetForm();
    }
  }, [categorie, isOpen]);

  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      icone: '',
      couleur: '#3B82F6',
      ordre: '0',
      is_active: true
    });
    setSelectedAttributs([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        ordre: parseInt(formData.ordre) || 0
      };

      let categorieId: number;

      if (categorie) {
        // Mise à jour
        const response = await produitsApi.categories.update(categorie.id, payload);
        categorieId = categorie.id;
        alert('✅ Catégorie modifiée avec succès');
      } else {
        // Création
        const response = await produitsApi.categories.create(payload);
        categorieId = response.data.id;
        alert('✅ Catégorie créée avec succès');
      }

      // Associer les attributs
      if (selectedAttributs.length > 0) {
        await associerAttributs(categorieId);
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Erreur:', error);
      alert('❌ Erreur: ' + (error.message || 'Une erreur est survenue'));
    } finally {
      setLoading(false);
    }
  };

  const associerAttributs = async (categorieId: number) => {
    try {
      // Si en mode édition, d'abord dissocier tous les attributs existants
      if (categorie?.attributs) {
        for (const attr of categorie.attributs) {
          try {
            await produitsApi.categories.dissocierAttribut(categorieId, attr.id);
          } catch (error) {
            console.error('Erreur dissociation:', error);
          }
        }
      }

      // Associer les nouveaux attributs sélectionnés
      for (const selection of selectedAttributs) {
        try {
          await produitsApi.categories.associerAttribut(categorieId, {
            attribut_id: selection.attribut_id,
            obligatoire: selection.obligatoire,
            ordre: selection.ordre
          });
        } catch (error) {
          console.error('Erreur association:', error);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'association des attributs:', error);
    }
  };

  const toggleAttribut = (attributId: number) => {
    const existe = selectedAttributs.find(a => a.attribut_id === attributId);
    
    if (existe) {
      // Retirer l'attribut
      setSelectedAttributs(selectedAttributs.filter(a => a.attribut_id !== attributId));
    } else {
      // Ajouter l'attribut
      setSelectedAttributs([
        ...selectedAttributs,
        {
          attribut_id: attributId,
          obligatoire: false,
          ordre: selectedAttributs.length
        }
      ]);
    }
  };

  const updateAttributConfig = (attributId: number, field: 'obligatoire' | 'ordre', value: any) => {
    setSelectedAttributs(
      selectedAttributs.map(a => 
        a.attribut_id === attributId 
          ? { ...a, [field]: field === 'ordre' ? parseInt(value) : value }
          : a
      )
    );
  };

  const isAttributSelected = (attributId: number) => {
    return selectedAttributs.some(a => a.attribut_id === attributId);
  };

  const getAttributConfig = (attributId: number) => {
    return selectedAttributs.find(a => a.attribut_id === attributId);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categorie ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
            Informations de base
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
                placeholder="Ex: Perruques, Mèches, Produits capillaires..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icône
              </label>
              <Input
                value={formData.icone}
                onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                placeholder="Ex: package, scissors, etc."
              />
              <p className="text-xs text-gray-500 mt-1">Nom d'icône Lucide</p>
            </div>
          </div>

          <div>
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(val: string) => setFormData({ ...formData, description: val })}
              placeholder="Description de la catégorie..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Couleur
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.couleur}
                  onChange={(e) => setFormData({ ...formData, couleur: e.target.value })}
                  className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  value={formData.couleur}
                  onChange={(e) => setFormData({ ...formData, couleur: e.target.value })}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordre d'affichage
              </label>
              <Input
                type="number"
                value={formData.ordre}
                onChange={(e) => setFormData({ ...formData, ordre: e.target.value })}
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Catégorie active
            </label>
          </div>
        </div>

        {/* Attributs associés */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
            Attributs de la catégorie
          </h3>
          <p className="text-sm text-gray-600">
            Sélectionnez les attributs qui caractérisent les produits de cette catégorie.
          </p>

          {attributsDisponibles.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Aucun attribut disponible</p>
              <p className="text-sm text-gray-500 mt-1">
                Créez d'abord des attributs dans l'onglet Attributs
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {attributsDisponibles.map((attribut: any) => {
                const isSelected = isAttributSelected(attribut.id);
                const config = getAttributConfig(attribut.id);

                return (
                  <div
                    key={attribut.id}
                    className={`border rounded-lg p-4 transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          type="button"
                          onClick={() => toggleAttribut(attribut.id)}
                          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300 hover:border-blue-400'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </button>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{attribut.nom}</h4>
                            <Badge variant="outline" className="text-xs">
                              {attribut.type_valeur}
                            </Badge>
                            {attribut.unite && (
                              <span className="text-xs text-gray-500">({attribut.unite})</span>
                            )}
                          </div>

                          {/* Configuration si sélectionné */}
                          {isSelected && config && (
                            <div className="mt-3 grid grid-cols-2 gap-3">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`obligatoire-${attribut.id}`}
                                  checked={config.obligatoire}
                                  onChange={(e) => 
                                    updateAttributConfig(attribut.id, 'obligatoire', e.target.checked)
                                  }
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label 
                                  htmlFor={`obligatoire-${attribut.id}`} 
                                  className="ml-2 block text-sm text-gray-700"
                                >
                                  Obligatoire
                                </label>
                              </div>

                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Ordre
                                </label>
                                <Input
                                  type="number"
                                  value={config.ordre}
                                  onChange={(e) => 
                                    updateAttributConfig(attribut.id, 'ordre', e.target.value)
                                  }
                                  min="0"
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedAttributs.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>{selectedAttributs.length}</strong> attribut(s) sélectionné(s)
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : categorie ? 'Modifier' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}