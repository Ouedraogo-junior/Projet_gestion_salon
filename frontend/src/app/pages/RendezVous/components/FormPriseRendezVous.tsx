// src/app/pages/RendezVous/components/FormPriseRendezVous.tsx

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, MessageSquare, Loader2, CheckCircle } from 'lucide-react';
import { rendezVousApi } from '../../../../services/rendezVousApi';
import { toast } from 'sonner';
import type { TypePrestation } from '../../../../types/prestation.types';
import type { CreneauDisponible } from '../../../../types/rendezVous.types';
import { prestationApi } from '../../../../services/prestationApi';

export const FormPriseRendezVous: React.FC = () => {
  const [etape, setEtape] = useState(1); // 1: Infos, 2: Prestation, 3: Date/Heure, 4: Confirmation
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Données du formulaire
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    type_prestation_id: 0,
    date: '',
    heure: '',
    notes: '',
  });

  // Données chargées
  const [prestations, setPrestations] = useState<TypePrestation[]>([]);
  const [creneaux, setCreneaux] = useState<CreneauDisponible[]>([]);
  const [isLoadingCreneaux, setIsLoadingCreneaux] = useState(false);
  

  // Prestation sélectionnée (pour affichage)
  const prestationSelectionnee = prestations.find(p => p.id === formData.type_prestation_id);

  // Charger les prestations au montage
  useEffect(() => {
    loadPrestations();
  }, []);

  // Charger les créneaux quand date et prestation sont sélectionnées
  useEffect(() => {
    if (formData.date && formData.type_prestation_id) {
      loadCreneaux();
    }
  }, [formData.date, formData.type_prestation_id]);

  const loadPrestations = async () => {
    try {
        const response = await prestationApi.getAllPublic();
        
        if (response.success && response.data) {
        setPrestations(response.data);
        }
    } catch (error) {
        console.error('Erreur chargement prestations:', error);
        toast.error('Erreur lors du chargement des prestations');
    }
    };

  const loadCreneaux = async () => {
    setIsLoadingCreneaux(true);
    try {
      const response = await rendezVousApi.getCreneauxDisponibles(
        formData.date,
        formData.type_prestation_id
      );

      if (response.success) {
        setCreneaux(response.data.creneaux);
      }
    } catch (error) {
      console.error('Erreur chargement créneaux:', error);
      toast.error('Erreur lors du chargement des créneaux');
      setCreneaux([]);
    } finally {
      setIsLoadingCreneaux(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.telephone) {
      toast.error('Le numéro de téléphone est requis');
      return;
    }

    if (!formData.type_prestation_id) {
      toast.error('Veuillez sélectionner une prestation');
      return;
    }

    if (!formData.date || !formData.heure) {
      toast.error('Veuillez sélectionner une date et une heure');
      return;
    }

    setIsLoading(true);

    try {
      // Créer le datetime au format ISO
      const dateHeure = `${formData.date} ${formData.heure}:00`;

      const response = await rendezVousApi.prendreRendezVous({
        nom: formData.nom || undefined,
        prenom: formData.prenom || undefined,
        telephone: formData.telephone,
        email: formData.email || undefined,
        type_prestation_id: formData.type_prestation_id,
        date_heure: dateHeure,
        notes: formData.notes || undefined,
      });

      if (response.success) {
        setIsSuccess(true);
        toast.success('Rendez-vous enregistré avec succès ! Vous recevrez une confirmation par SMS.');
      }
    } catch (error: any) {
      console.error('Erreur prise RDV:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la prise de rendez-vous');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
      type_prestation_id: 0,
      date: '',
      heure: '',
      notes: '',
    });
    setEtape(1);
    setIsSuccess(false);
    setCreneaux([]);
  };

  // Affichage succès
  if (isSuccess) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Rendez-vous enregistré !
        </h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-gray-700 mb-2">
            <strong>Prestation:</strong> {prestationSelectionnee?.nom}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Date:</strong> {new Date(formData.date).toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Heure:</strong> {formData.heure}
          </p>
          <p className="text-gray-700">
            <strong>Prix estimé:</strong> {prestationSelectionnee?.prix_base.toLocaleString()} FCFA
          </p>
        </div>
        <p className="text-gray-600 mb-6">
          Vous recevrez une confirmation par SMS au <strong>{formData.telephone}</strong>.
          Le salon vous contactera pour confirmer définitivement votre rendez-vous.
        </p>
        <button
          onClick={resetForm}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
        >
          Prendre un nouveau rendez-vous
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Réservez votre rendez-vous
      </h2>

      {/* Indicateur d'étapes */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  etape >= step
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step}
              </div>
              <span className="text-xs mt-2 text-gray-600">
                {step === 1 && 'Vos infos'}
                {step === 2 && 'Prestation'}
                {step === 3 && 'Date & Heure'}
              </span>
            </div>
            {step < 3 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  etape > step ? 'bg-orange-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Étape 1: Informations personnelles */}
        {etape === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom (optionnel)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Votre prénom"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom (optionnel)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Votre nom"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="+226 XX XX XX XX"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Nous vous enverrons une confirmation par SMS
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (optionnel)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEtape(2)}
              className="w-full py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              Continuer
            </button>
          </div>
        )}

        {/* Étape 2: Sélection prestation */}
        {etape === 2 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choisissez votre prestation <span className="text-red-500">*</span>
            </label>

            {/* Liste scrollable avec hauteur fixe */}
            <div className="max-h-[400px] overflow-y-auto border-2 border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 gap-3 p-3">
                {prestations.map((prestation) => (
                  <div
                    key={prestation.id}
                    onClick={() => setFormData({ ...formData, type_prestation_id: prestation.id })}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      formData.type_prestation_id === prestation.id
                        ? 'border-orange-600 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{prestation.nom}</h4>
                        {prestation.description && (
                          <p className="text-sm text-gray-600 mt-1">{prestation.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {prestation.duree_estimee_minutes} min
                          </span>
                          <span className="font-semibold text-orange-600">
                            {prestation.prix_base.toLocaleString()} FCFA
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          formData.type_prestation_id === prestation.id
                            ? 'border-orange-600 bg-orange-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {formData.type_prestation_id === prestation.id && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEtape(1)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Retour
              </button>
              <button
                type="button"
                onClick={() => setEtape(3)}
                disabled={!formData.type_prestation_id}
                className="flex-1 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Étape 3: Date et heure */}
        {etape === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value, heure: '' })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {formData.date && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Heure <span className="text-red-500">*</span>
                </label>

                {isLoadingCreneaux ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
                  </div>
                ) : creneaux.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Aucun créneau disponible pour cette date
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {creneaux.map((creneau) => (
                      <button
                        key={creneau.heure}
                        type="button"
                        onClick={() => setFormData({ ...formData, heure: creneau.heure })}
                        disabled={!creneau.disponible}
                        className={`py-2.5 rounded-lg font-medium transition ${
                          formData.heure === creneau.heure
                            ? 'bg-orange-600 text-white'
                            : creneau.disponible
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {creneau.heure}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes / Instructions particulières (optionnel)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  placeholder="Précisez vos préférences..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEtape(2)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={!formData.date || !formData.heure || isLoading}
                className="flex-1 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Confirmation...
                  </>
                ) : (
                  'Confirmer le rendez-vous'
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};