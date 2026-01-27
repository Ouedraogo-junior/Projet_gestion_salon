// src/app/pages/Produits/components/AttributFormModal.tsx
import { useState, useEffect } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from './ui/Badge';
import { produitsApi } from '@/services/produitsApi';
import { useCategories } from '@/hooks/useProduitsModule';

interface AttributFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  attribut?: any; // Pour édition
}

export function AttributFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  attribut 
}: AttributFormModalProps) {
  const { data: categoriesDisponibles } = useCategories();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    type_valeur: 'texte',
    unite: '',
    obligatoire: false,
    ordre: '0',
    valeurs_possibles: [] as string[]
  });
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [nouvelleValeur, setNouvelleValeur] = useState('');

  useEffect(() => {
    if (attribut) {
      // Mode édition
      setFormData({
        nom: attribut.nom || '',
        type_valeur: attribut.type_valeur || 'texte',
        unite: attribut.unite || '',
        obligatoire: attribut.obligatoire || false,
        ordre: attribut.ordre?.toString() || '0',
        valeurs_possibles: Array.isArray(attribut.valeurs_possibles) 
          ? attribut.valeurs_possibles 
          : []
      });
      
      // Charger les catégories existantes
      if (attribut.categories) {
        setSelectedCategories(attribut.categories.map((cat: any) => cat.id));
      }
    } else {
      // Mode création
      resetForm();
    }
  }, [attribut, isOpen]);

  const resetForm = () => {
    setFormData({
      nom: '',
      type_valeur: 'texte',
      unite: '',
      obligatoire: false,
      ordre: '0',
      valeurs_possibles: []
    });
    setSelectedCategories([]);
    setNouvelleValeur('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation : Au moins une valeur doit être définie
    if (formData.valeurs_possibles.length === 0) {
      alert('⚠️ Veuillez ajouter au moins une valeur possible.\nPour une saisie libre, ajoutez "Valeur libre" ou "Autre".');
      return;
    }
    
    setLoading(true);

    try {
      const payload = {
        nom: formData.nom,
        type_valeur: formData.type_valeur,
        unite: formData.unite || null,
        obligatoire: formData.obligatoire,
        ordre: parseInt(formData.ordre) || 0,
        valeurs_possibles: formData.valeurs_possibles
      };

      let attributId: number;

      if (attribut) {
        // Mise à jour
        const response = await produitsApi.attributs.update(attribut.id, payload);
        attributId = attribut.id;
        alert('✅ Attribut modifié avec succès');
      } else {
        // Création
        const response = await produitsApi.attributs.create(payload);
        attributId = response.data.id;
        alert('✅ Attribut créé avec succès');
      }

      // Associer aux catégories sélectionnées
      if (selectedCategories.length > 0) {
        await associerCategories(attributId);
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

  const associerCategories = async (attributId: number) => {
    try {
      for (const categorieId of selectedCategories) {
        try {
          await produitsApi.categories.associerAttribut(categorieId, {
            attribut_id: attributId,
            obligatoire: formData.obligatoire,
            ordre: parseInt(formData.ordre) || 0
          });
        } catch (error) {
          console.error('Erreur association catégorie:', error);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'association des catégories:', error);
    }
  };

  const toggleCategorie = (categorieId: number) => {
    if (selectedCategories.includes(categorieId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categorieId));
    } else {
      setSelectedCategories([...selectedCategories, categorieId]);
    }
  };

  const ajouterValeurPossible = () => {
    if (nouvelleValeur.trim() && !formData.valeurs_possibles.includes(nouvelleValeur.trim())) {
      setFormData({
        ...formData,
        valeurs_possibles: [...formData.valeurs_possibles, nouvelleValeur.trim()]
      });
      setNouvelleValeur('');
    }
  };

  const supprimerValeurPossible = (valeur: string) => {
    setFormData({
      ...formData,
      valeurs_possibles: formData.valeurs_possibles.filter(v => v !== valeur)
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={attribut ? 'Modifier l\'attribut' : 'Nouvel attribut'}
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
                placeholder="Ex: Longueur, Qualité, Couleur..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de valeur <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type_valeur}
                onChange={(e) => setFormData({ ...formData, type_valeur: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="texte">Texte</option>
                <option value="nombre">Nombre</option>
                <option value="liste">Liste de valeurs</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unité
              </label>
              <Input
                value={formData.unite}
                onChange={(e) => setFormData({ ...formData, unite: e.target.value })}
                placeholder="Ex: pouces, cm, grammes..."
              />
              <p className="text-xs text-gray-500 mt-1">Optionnel (ex: cm, pouces, grammes)</p>
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
              id="obligatoire"
              checked={formData.obligatoire}
              onChange={(e) => setFormData({ ...formData, obligatoire: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="obligatoire" className="ml-2 block text-sm text-gray-900">
              Attribut obligatoire
            </label>
          </div>
        </div>

        {/* Valeurs possibles (pour tous les types) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-semibold text-gray-900">
              Valeurs possibles <span className="text-red-500">*</span>
            </h3>
            {formData.type_valeur === 'liste' && (
              <span className="text-xs text-blue-600 font-medium">Liste déroulante</span>
            )}
            {formData.type_valeur !== 'liste' && (
              <span className="text-xs text-gray-500 font-medium">Au moins 1 valeur requise</span>
            )}
          </div>
          
          <p className="text-sm text-gray-600">
            {formData.type_valeur === 'liste' 
              ? 'Définissez les valeurs que l\'utilisateur pourra sélectionner dans une liste déroulante.'
              : 'Définissez au moins une valeur. Pour une saisie libre, ajoutez "Valeur libre" ou "Autre".'
            }
          </p>
          
          <div className="flex gap-2">
            <Input
              value={nouvelleValeur}
              onChange={(e) => setNouvelleValeur(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  ajouterValeurPossible();
                }
              }}
              placeholder={
                formData.type_valeur === 'texte' 
                  ? "Ex: Premium, Standard, Économique, Valeur libre..."
                  : formData.type_valeur === 'nombre'
                  ? "Ex: 10, 20, 30, Valeur libre..."
                  : "Ex: 14 pouces, 18 pouces, 20 pouces..."
              }
              className="flex-1"
            />
            <Button
              type="button"
              onClick={ajouterValeurPossible}
              disabled={!nouvelleValeur.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>

          {formData.valeurs_possibles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formData.valeurs_possibles.map((valeur, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {valeur}
                  <button
                    type="button"
                    onClick={() => supprimerValeurPossible(valeur)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-red-500 font-medium">
              ⚠️ Au moins une valeur est requise. {formData.type_valeur !== 'liste' && 'Ajoutez "Valeur libre" pour permettre une saisie manuelle.'}
            </p>
          )}
        </div>

        {/* Catégories associées */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
            Catégories associées
          </h3>
          <p className="text-sm text-gray-600">
            Sélectionnez les catégories auxquelles cet attribut s'applique.
          </p>

          {categoriesDisponibles.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Aucune catégorie disponible</p>
              <p className="text-sm text-gray-500 mt-1">
                Créez d'abord des catégories dans l'onglet Catégories
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {categoriesDisponibles.map((categorie: any) => {
                const isSelected = selectedCategories.includes(categorie.id);

                return (
                  <button
                    key={categorie.id}
                    type="button"
                    onClick={() => toggleCategorie(categorie.id)}
                    className={`border rounded-lg p-3 text-left transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{categorie.nom}</p>
                        {categorie.description && (
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {categorie.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {selectedCategories.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>{selectedCategories.length}</strong> catégorie(s) sélectionnée(s)
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
            {loading ? 'Enregistrement...' : attribut ? 'Modifier' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}