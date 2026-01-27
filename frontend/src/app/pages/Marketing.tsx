import { Plus, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { campagnesSMSMock } from '@/lib/mockData';

export function Marketing() {
  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'Envoyé':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Programmé':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'Échoué':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Anniversaires':
        return 'bg-purple-100 text-purple-700';
      case 'Promotions':
        return 'bg-orange-100 text-orange-700';
      case 'Rappels RDV':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Marketing SMS</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle campagne
        </Button>
      </div>

      {/* Statistiques SMS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">SMS envoyés ce mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">347</div>
            <p className="text-xs text-gray-600 mt-1">+23% vs mois dernier</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Taux de livraison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">98.5%</div>
            <p className="text-xs text-gray-600 mt-1">Excellent taux</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Crédits restants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">1,250</div>
            <p className="text-xs text-gray-600 mt-1">Renouveler bientôt</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des campagnes */}
      <Card>
        <CardHeader>
          <CardTitle>Campagnes SMS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campagnesSMSMock.map((campagne) => (
              <div
                key={campagne.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(campagne.type)}>{campagne.type}</Badge>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(campagne.statut)}
                        <span className="text-xs text-gray-600">{campagne.statut}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{campagne.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>Date: {new Date(campagne.date).toLocaleDateString('fr-FR')}</span>
                      <span>Destinataires: {campagne.destinataires}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    {campagne.statut === 'Programmé' ? 'Modifier' : 'Détails'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
