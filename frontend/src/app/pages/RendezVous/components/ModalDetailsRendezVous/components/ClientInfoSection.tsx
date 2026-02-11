// src/app/pages/RendezVous/components/ModalDetailsRendezVous/components/ClientInfoSection.tsx

import React from 'react';
import { User, Phone, Mail, PhoneCall, MessageCircle, Send } from 'lucide-react';

interface ClientInfo {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
}

interface Props {
  client: ClientInfo;
  dateHeure: string;
  prestationNom: string;
}

export const ClientInfoSection: React.FC<Props> = ({ client, dateHeure, prestationNom }) => {
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

  const handlePhoneCall = () => {
    window.location.href = `tel:${client.telephone}`;
  };

  const handleWhatsAppCall = () => {
    const phone = formatPhoneForWhatsApp(client.telephone);
    const whatsappCallUrl = `https://wa.me/${phone.replace('+', '')}`;
    window.open(whatsappCallUrl, '_blank');
  };

  const handleWhatsAppMessage = () => {
    const phone = formatPhoneForWhatsApp(client.telephone);
    const message = `Bonjour ${client.prenom} ${client.nom}, concernant votre rendez-vous du ${formatDate(dateHeure)} à ${formatHeure(dateHeure)} pour ${prestationNom}.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone.replace('+', '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmail = () => {
    const subject = `Rendez-vous - ${prestationNom}`;
    const body = `Bonjour ${client.prenom} ${client.nom},\n\nConcernant votre rendez-vous :\n- Date : ${formatDate(dateHeure)}\n- Heure : ${formatHeure(dateHeure)}\n- Prestation : ${prestationNom}\n\nCordialement,`;
    const mailtoUrl = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500 uppercase mb-2 sm:mb-3">Client</h3>
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-gray-400" />
          <span className="font-medium text-gray-900">
            {client.prenom} {client.nom}
          </span>
        </div>
        
        {/* Téléphone avec actions */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Phone className="w-5 h-5 text-gray-400" />
            <a 
              href={`tel:${client.telephone}`}
              className="text-gray-700 hover:text-orange-600 transition font-medium"
            >
              {client.telephone}
            </a>
          </div>
          
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

        {/* Email */}
        {client.email && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <a 
                href={`mailto:${client.email}`}
                className="text-gray-700 hover:text-orange-600 transition truncate"
              >
                {client.email}
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
  );
};