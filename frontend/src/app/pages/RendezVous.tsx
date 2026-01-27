import { Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { rendezVousMock, clientsMock } from '@/lib/mockData';

export function RendezVous() {
  const getClient = (clientId: string) => {
    return clientsMock.find((c) => c.id === clientId);
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'Confirmé':
        return <CheckCircle className="w-4 h-4" />;
      case 'En attente':
        return <Clock className="w-4 h-4" />;
      case 'Annulé':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Confirmé':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'En attente':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Annulé':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Rendez-vous</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau RDV
        </Button>
      </div>

      {/* Onglets de vue */}
      <Tabs defaultValue="jour">
        <TabsList>
          <TabsTrigger value="jour">Jour</TabsTrigger>
          <TabsTrigger value="semaine">Semaine</TabsTrigger>
          <TabsTrigger value="mois">Mois</TabsTrigger>
        </TabsList>

        <TabsContent value="jour" className="mt-6">
          <div className="space-y-4">
            {/* Créneaux horaires */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rendezVousMock.map((rdv) => {
                const client = getClient(rdv.clientId);
                return (
                  <Card
                    key={rdv.id}
                    className={`border-l-4 ${getStatusColor(rdv.statut)}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getStatusIcon(rdv.statut)}
                          {rdv.heure}
                        </CardTitle>
                        <Badge variant="secondary">{rdv.duree} min</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm">{client?.nom}</p>
                        <p className="text-xs text-gray-600">{client?.telephone}</p>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-700">{rdv.service}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(rdv.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Button variant="outline" className="w-full" size="sm">
                        Détails
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="semaine" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Vue semaine en cours de développement...
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mois" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Vue mois en cours de développement...
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
