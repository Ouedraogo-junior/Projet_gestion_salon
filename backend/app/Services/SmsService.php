<?php

namespace App\Services;

class SmsService
{
    /**
     * Envoyer SMS de confirmation
     */
    public function envoyerConfirmation($telephone, $rendezVous)
    {
        $message = "Bonjour {$rendezVous->client->prenom}, votre RDV du " 
                 . $rendezVous->date_heure->format('d/m/Y à H:i') 
                 . " pour {$rendezVous->typePrestation->nom} est confirmé.";
        
        return $this->envoyer($telephone, $message);
    }

    /**
     * Envoyer SMS de rappel
     */
    public function envoyerRappel($telephone, $rendezVous)
    {
        $message = "Rappel: RDV demain à " 
                 . $rendezVous->date_heure->format('H:i') 
                 . " pour {$rendezVous->typePrestation->nom}.";
        
        return $this->envoyer($telephone, $message);
    }

    /**
     * Envoyer SMS d'annulation
     */
    public function envoyerAnnulation($telephone, $rendezVous)
    {
        $message = "Votre RDV du " 
                 . $rendezVous->date_heure->format('d/m/Y à H:i') 
                 . " a été annulé. Contactez-nous pour replanifier.";
        
        return $this->envoyer($telephone, $message);
    }

    /**
     * Méthode générique d'envoi SMS
     * TODO: Intégrer l'API SMS (Orange Money, Moov, etc.)
     */
    private function envoyer($telephone, $message)
    {
        // À implémenter avec votre provider SMS
        \Log::info("SMS à envoyer à {$telephone}: {$message}");
        
        return true;
    }
}