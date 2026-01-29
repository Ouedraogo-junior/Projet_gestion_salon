// src/app/pages/RendezVous/VuePubliqueRendezVous.tsx

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';
import { FormPriseRendezVous } from './components/FormPriseRendezVous';
import { MesRendezVousModal } from './components/MesRendezVousModal';

export const VuePubliqueRendezVous: React.FC = () => {
  const [showMesRendezVous, setShowMesRendezVous] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-yellow-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-5xl">🌀</span>
              <div>
                <h1 className="text-3xl font-bold">Fasodreadlocks</h1>
                <p className="text-orange-100 text-sm">Salon Afro Style - Ouagadougou</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowMesRendezVous(true)}
                className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-orange-50 transition"
              >
                Mes Rendez-vous
              </button>
              
                <a
                href="/login"
                className="bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-800 transition"
                >
                Espace Gérant
                </a>

            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Prenez Rendez-vous en Ligne
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choisissez votre prestation, sélectionnez un créneau et confirmez en quelques clics.
            Recevez une confirmation par SMS.
          </p>
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
                  <span className="font-medium">8h - 18h</span>
                </div>
                <div className="flex justify-between">
                  <span>Samedi</span>
                  <span className="font-medium">8h - 18h</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimanche</span>
                  <span className="font-medium text-red-600">Fermé</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Pause déjeuner:</span> 12h30 - 14h00
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
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">+226 XX XX XX XX</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">contact@fasodreads.bf</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Ouagadougou, Burkina Faso</span>
                </div>
              </div>
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2026 Fasodreadlocks - Tous droits réservés
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Fait par Junior OUEDRAOGO ✨
            </p>
          </div>
        </div>
      </footer>

      {/* Modal Mes Rendez-vous */}
      <MesRendezVousModal
        isOpen={showMesRendezVous}
        onClose={() => setShowMesRendezVous(false)}
      />
    </div>
  );
};