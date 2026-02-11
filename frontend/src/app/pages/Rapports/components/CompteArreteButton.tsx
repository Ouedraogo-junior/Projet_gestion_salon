// src/app/pages/Rapports/components/CompteArreteButton.tsx

import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Lock, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { UserRole } from '@/config/rapportPermissions';
import { rapportApi } from '@/services/rapportApi';

interface CompteArreteButtonProps {
  userRole: UserRole;
}

export function CompteArreteButton({ userRole }: CompteArreteButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleCompteArrete = async () => {
    setIsLoading(true);

    try {
        await rapportApi.envoyerCompteArrete(
        new Date().toISOString().split('T')[0]
        );

        toast.success('Compte arrêté envoyé', {
        description: 'Le gestionnaire a été notifié par email.',
        icon: <CheckCircle className="h-4 w-4" />,
        });
    } catch (error: any) {
        toast.error('Erreur', {
        description: error.response?.data?.message || 'Impossible d\'envoyer le compte arrêté.',
        });
    } finally {
        setIsLoading(false);
    }
    };

  return (
    <Button 
      onClick={handleCompteArrete} 
      disabled={isLoading}
      variant="outline"
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Lock className="h-4 w-4" />
      )}
      Compte arrêté
    </Button>
  );
}