// src/app/pages/RendezVous/components/ModalDetailsRendezVous.tsx

import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Calendar, Clock, Scissors, DollarSign, CheckCircle, XCircle, Trash2, AlertCircle, Edit2, MessageCircle, Send, PhoneCall } from 'lucide-react';
import type { RendezVous } from '../../../../types/rendezVous.types';
import { useRendezVous } from '../../../../hooks/useRendezVous';

interface Props {
  rdv: RendezVous;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalDetailsRendezVous: React.FC<Props> = ({ rdv, isOpen, onClose, onSuccess }) => {
  const { confirmer, annuler, terminer, delete: deleteRdv, marquerAcomptePaye, updateAcompte } = useRendezVous();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showAnnuler, setShowAnnuler] = useState(false);
  const [motifAnnulation, setMotifAnnulation] = useState('');
  const [showEditAcompte, setShowEditAcompte] = useState(false);
  const [nouveauMontantAcompte, setNouveauMontantAcompte] = useState(rdv.acompte_montant || 0);

  useEffect(() => {
    setNouveauMontantAcompte(rdv.acompte_montant || 0);
  }, [rdv.acompte_montant]);

  const getStatutBadge = (statut: string) => {
    const configs = {
      en_attente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      confirme: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmé' },
      en_cours: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En cours' },
      termine: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Terminé' },
      annule: { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulé' },
      no_show: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Absent' },
    };
    const config = configs[statut as keyof typeof configs] || configs.en_attente;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatHeure = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  // Formater le numéro pour WhatsApp (format international)
  const formatPhoneForWhatsApp = (phone: string) => {
    let cleaned = phone.replace(/[^0-9+]/g, '');
    
    if (cleaned.startsWith('+226')) {
      return cleaned;
    }
    
    if (cleaned.startsWith('226')) {
      return '+' + cleaned;
    }
    
    return '+226' + cleaned;
  };

  // Appel téléphonique classique
  const handlePhoneCall = () => {
    window.location.href = `tel:${rdv.client?.telephone}`;
  };

  // Appel via WhatsApp
  const handleWhatsAppCall = () => {
    const phone = formatPhoneForWhatsApp(rdv.client?.telephone || '');
    const whatsappCallUrl = `https://wa.me/${phone.replace('+', '')}`;
    window.open(whatsappCallUrl, '_blank');
  };

  // Message WhatsApp
  const handleWhatsAppMessage = () => {
    const phone = formatPhoneForWhatsApp(rdv.client?.telephone || '');
    const message = `Bonjour ${rdv.client?.prenom} ${rdv.client?.nom}, concernant votre rendez-vous du ${formatDate(rdv.date_heure)} à ${formatHeure(rdv.date_heure)} pour ${rdv.typePrestation?.nom}.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone.replace('+', '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  // Envoyer un email
  const handleEmail = () => {
    const subject = `Rendez-vous - ${rdv.typePrestation?.nom}`;
    const body = `Bonjour ${rdv.client?.prenom} ${rdv.client?.nom},\n\nConcernant votre rendez-vous :\n- Date : ${formatDate(rdv.date_heure)}\n- Heure : ${formatHeure(rdv.date_heure)}\n- Prestation : ${rdv.typePrestation?.nom}\n- Prix estimé : ${rdv.prix_estime ? formatCurrency(Number(rdv.prix_estime)) + ' FCFA' : 'N/A'}\n\nCordialement,`;
    const mailtoUrl = `mailto:${rdv.client?.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handleConfirmer = () => {
    confirmer({ id: rdv.id }, {
      onSuccess: () => {
        onSuccess();
      },
    });
  };

  const handleAnnuler = () => {
    if (!motifAnnulation.trim()) return;
    
    annuler({ id: rdv.id, motif: motifAnnulation }, {
      onSuccess: () => {
        setShowAnnuler(false);
        setMotifAnnulation('');
        onSuccess();
      },
    });
  };

  const handleTerminer = () => {
    terminer(rdv.id, {
      onSuccess: () => {
        onSuccess();
      },
    });
  };

  const handleDelete = () => {
    deleteRdv(rdv.id, {
      onSuccess: () => {
        setShowConfirmDelete(false);
        onSuccess();
      },
    });
  };

  const handleMarquerAcomptePaye = () => {
    marquerAcomptePaye(rdv.id, {
      onSuccess: () => {
        onSuccess();
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 px-4 pb-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pr-2">
            <h2 className="text-base sm:text-xl font-bold text-gray-900">Détails du rendez-vous</h2>
            {getStatutBadge(rdv.statut)}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Date et heure */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 text-sm sm:text-base">{formatDate(rdv.date_heure)}</div>
                  <div className="text-sm text-gray-600">à {formatHeure(rdv.date_heure)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-700 ml-8 sm:ml-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-sm sm:text-base">{rdv.duree_minutes} min</span>
              </div>
            </div>
          </div>

          {/* Client avec actions */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2 sm:mb-3">Client</h3>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900">
                  {rdv.client?.prenom} {rdv.client?.nom}
                </span>
              </div>
              
              {/* Téléphone avec actions d'appel et message */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <a 
                    href={`tel:${rdv.client?.telephone}`}
                    className="text-gray-700 hover:text-orange-600 transition font-medium"
                  >
                    {rdv.client?.telephone}
                  </a>
                </div>
                
                {/* Boutons d'action téléphone */}
                <div className="flex flex-wrap gap-2 ml-8">
                  <button
                    onClick={handlePhoneCall}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition"
                    title="Appeler"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span className="hidden xs:inline">Appeler</span>
                  </button>
                  
                  <button
                    onClick={handleWhatsAppCall}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition"
                    title="Appeler via WhatsApp"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>
                  
                  <button
                    onClick={handleWhatsAppMessage}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                    title="Envoyer un message WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Message</span>
                  </button>
                </div>
              </div>

              {/* Email avec bouton d'envoi */}
              {rdv.client?.email && (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <a 
                      href={`mailto:${rdv.client.email}`}
                      className="text-gray-700 hover:text-orange-600 transition truncate"
                    >
                      {rdv.client.email}
                    </a>
                  </div>
                  
                  <div className="ml-8">
                    <button
                      onClick={handleEmail}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition"
                      title="Envoyer un email"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden xs:inline">Envoyer un email</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prestation */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2 sm:mb-3">Prestation</h3>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Scissors className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">{rdv.typePrestation?.nom}</div>
                    {rdv.typePrestation?.description && (
                      <div className="text-sm text-gray-600">{rdv.typePrestation.description}</div>
                    )}
                  </div>
                </div>
                {rdv.prix_estime && (
                  <div className="flex items-center gap-2 ml-8 sm:ml-0">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900">{formatCurrency(Number(rdv.prix_estime))} FCFA</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coiffeur(s) */}
        {(rdv.coiffeur || (rdv.coiffeurs && rdv.coiffeurs.length > 0)) && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2 sm:mb-3">
              {rdv.coiffeurs && rdv.coiffeurs.length > 1 ? 'Coiffeurs' : 'Coiffeur'}
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
              {rdv.coiffeurs && rdv.coiffeurs.length > 0 ? (
                rdv.coiffeurs.map((coiffeur) => (
                  <div key={coiffeur.id} className="flex items-center gap-3">
                    <Scissors className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {coiffeur.prenom} {coiffeur.nom}
                      </div>
                      {coiffeur.specialite && (
                        <div className="text-sm text-gray-600">{coiffeur.specialite}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : rdv.coiffeur ? (
                <div className="flex items-center gap-3">
                  <Scissors className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {rdv.coiffeur.prenom} {rdv.coiffeur.nom}
                    </div>
                    {rdv.coiffeur.specialite && (
                      <div className="text-sm text-gray-600">{rdv.coiffeur.specialite}</div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

          {/* Acompte */}
          {rdv.acompte_demande && (
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase">Acompte</h3>
                {!rdv.acompte_paye && rdv.statut !== 'termine' && rdv.statut !== 'annule' && (
                  <button
                    onClick={() => setShowEditAcompte(!showEditAcompte)}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Modifier
                  </button>
                )}
              </div>

              {!showEditAcompte ? (
                <div className={`rounded-lg p-3 sm:p-4 ${rdv.acompte_paye ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-gray-500" />
                        <span className="font-medium text-gray-900 text-lg">
                          {rdv.acompte_montant ? `${formatCurrency(Number(rdv.acompte_montant))} FCFA` : '-'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1 ml-7">
                        {rdv.acompte_paye ? (
                          <span className="flex items-center gap-1 text-green-700">
                            <CheckCircle className="w-4 h-4" />
                            Payé
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-700">
                            <AlertCircle className="w-4 h-4" />
                            En attente de paiement
                          </span>
                        )}
                      </div>
                    </div>
                    {!rdv.acompte_paye && rdv.statut !== 'termine' && rdv.statut !== 'annule' && (
                      <button
                        onClick={handleMarquerAcomptePaye}
                        className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Marquer comme payé
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-800">
                      Vous pouvez modifier le montant de l'acompte si le client n'a pas payé le montant complet.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant de l'acompte (FCFA)
                    </label>
                    <input
                      type="number"
                      value={nouveauMontantAcompte}
                      onChange={(e) => setNouveauMontantAcompte(Number(e.target.value))}
                      min="0"
                      max={rdv.prix_estime || undefined}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex flex-col xs:flex-row gap-2">
                    <button
                      onClick={() => {
                        setShowEditAcompte(false);
                        setNouveauMontantAcompte(rdv.acompte_montant || 0);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => {
                        updateAcompte({ id: rdv.id, acompte_montant: nouveauMontantAcompte });
                        setShowEditAcompte(false);
                        onSuccess();
                      }}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {rdv.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-2 sm:mb-3">Notes</h3>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <p className="text-gray-700">{rdv.notes}</p>
              </div>
            </div>
          )}

          {/* Motif annulation */}
          {rdv.statut === 'annule' && rdv.motif_annulation && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-2 sm:mb-3">Motif d'annulation</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                <p className="text-gray-700">{rdv.motif_annulation}</p>
                {rdv.date_annulation && (
                  <p className="text-sm text-gray-600 mt-2">
                    Annulé le {formatDate(rdv.date_annulation)} à {formatHeure(rdv.date_annulation)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Modal Annulation */}
          {showAnnuler && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-[60] px-4 pb-0 sm:p-4">
              <div className="bg-white rounded-t-2xl sm:rounded-lg p-5 sm:p-6 max-w-md w-full">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Annuler le rendez-vous</h3>
                <textarea
                  value={motifAnnulation}
                  onChange={(e) => setMotifAnnulation(e.target.value)}
                  placeholder="Motif de l'annulation..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
                <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 mt-4">
                  <button
                    onClick={() => {
                      setShowAnnuler(false);
                      setMotifAnnulation('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAnnuler}
                    disabled={!motifAnnulation.trim()}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    Confirmer l'annulation
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Suppression */}
          {showConfirmDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-[60] px-4 pb-0 sm:p-4">
              <div className="bg-white rounded-t-2xl sm:rounded-lg p-5 sm:p-6 max-w-md w-full">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Supprimer le rendez-vous</h3>
                <p className="text-gray-600 mb-6">
                  Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action est irréversible.
                </p>
                <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="w-full xs:w-auto px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition flex items-center justify-center xs:justify-start gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>

          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
            {rdv.statut === 'en_attente' && (
              <>
                <button
                  onClick={() => setShowAnnuler(true)}
                  className="w-full xs:w-auto px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Annuler
                </button>
                <button
                  onClick={handleConfirmer}
                  className="w-full xs:w-auto px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirmer
                </button>
              </>
            )}

            {rdv.statut === 'confirme' && (
              <>
                <button
                  onClick={() => setShowAnnuler(true)}
                  className="w-full xs:w-auto px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Annuler
                </button>
                <button
                  onClick={handleTerminer}
                  className="w-full xs:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Marquer terminé
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};