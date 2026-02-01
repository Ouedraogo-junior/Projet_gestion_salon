// src/app/pages/RendezVous/VuePubliqueRendezVous.tsx

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';
import { FormPriseRendezVous } from './components/FormPriseRendezVous';
import { MesRendezVousModal } from './components/MesRendezVousModal';
import { useSalonPublic } from '@/hooks/useSalonPublic';

export const VuePubliqueRendezVous: React.FC = () => {
  const [showMesRendezVous, setShowMesRendezVous] = useState(false);
  const { salon, isLoading } = useSalonPublic();

  // URL de base pour les images
  const getLogoUrl = (logoPath: string | null) => {
    if (!logoPath) return null;
    return `http://127.0.0.1:8000/storage/${logoPath}`;
  };

  // Parser les horaires (format attendu: "Lundi - Samedi: 9h - 19h")
  const parseHoraires = (horaires: string | null) => {
    if (!horaires) {
      return {
        semaine: '8h - 18h',
        //samedi: '8h - 18h',
        dimanche: 'Fermé',
        pause: '12h30 - 14h00'
      };
    }
    
    // Horaires par défaut si parsing échoue
    return {
      semaine: horaires,
      //samedi: horaires,
      dimanche: 'Fermé',
      pause: '12h30 - 14h00'
    };
  };

  const horaires = parseHoraires(salon?.horaires || null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Prenez Rendez-vous en Ligne
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choisissez votre prestation, sélectionnez un créneau et confirmez en quelques clics.
          </p>
        </div>

        {/* Bouton Mes Rendez-vous centré */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowMesRendezVous(true)}
            className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold border-2 border-orange-600 hover:bg-orange-50 transition shadow-md"
          >
            Mes Rendez-vous
          </button>

           {/* <a
                href="/login"
                className="bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-800 transition"
              >
                Espace Gérant
              </a> */}
        </div>

        {/* Grille : Formulaire + Infos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire de prise de RDV */}
          <div className="lg:col-span-2">
            <FormPriseRendezVous />
          </div>

          {/* Informations du salon */}
          <div className="space-y-6">
            {/* Horaires */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-orange-100">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Horaires d'ouverture</h3>
              </div>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Lundi - Vendredi</span>
                  <span className="font-medium">{horaires.semaine}</span>
                </div>
                {/* <div className="flex justify-between">
                  <span>Samedi</span>
                  <span className="font-medium">{horaires.samedi}</span>
                </div> */}
                <div className="flex justify-between">
                  <span>Dimanche</span>
                  <span className="font-medium text-red-600">{horaires.dimanche}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Pause déjeuner:</span> {horaires.pause}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-orange-100">
              <div className="flex items-center gap-3 mb-4">
                <Phone className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Contact</h3>
              </div>
              {isLoading ? (
                <div className="text-gray-500">Chargement...</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{salon?.telephone || '+226 XX XX XX XX'}</span>
                  </div>
                  {salon?.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{salon.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{salon?.adresse || 'Ouagadougou, Burkina Faso'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Réseaux sociaux */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-orange-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Suivez-nous</h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg hover:scale-110 transition"
                >
                  <Instagram className="w-6 h-6" />
                </a>

                <a
                  href="#"
                  className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-lg hover:scale-110 transition"
                >
                  <Facebook className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Modal Mes Rendez-vous */}
      <MesRendezVousModal
        isOpen={showMesRendezVous}
        onClose={() => setShowMesRendezVous(false)}
      />
    </div>
  );
};