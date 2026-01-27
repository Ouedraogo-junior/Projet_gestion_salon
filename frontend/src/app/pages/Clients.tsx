import { useState } from 'react';
import { Plus, Search, Phone, Award, Calendar } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent } from '@/app/components/ui/card';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { clientsMock } from '@/lib/mockData';

export function Clients() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clientsMock.filter(
    (client) =>
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.telephone.includes(searchTerm)
  );

  const getInitials = (nom: string) => {
    return nom
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
    return colors[index % colors.length];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Clients</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau client
        </Button>
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher par nom ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filtres</Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client, index) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <Avatar className={`w-12 h-12 ${getAvatarColor(index)}`}>
                  <AvatarFallback className="text-white">
                    {getInitials(client.nom)}
                  </AvatarFallback>
                </Avatar>

                {/* Infos */}
                <div className="flex-1">
                  <h3 className="text-lg">{client.nom}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Phone className="w-4 h-4" />
                    <span>{client.telephone}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl text-blue-600">{client.visites}</div>
                  <div className="text-xs text-gray-600 mt-1">Visites</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    <Award className="w-4 h-4 text-green-600" />
                    <span className="text-2xl text-green-600">{client.pointsFidelite}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Points fidélité</div>
                </div>
              </div>

              {/* Dernière visite */}
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Dernière visite:{' '}
                  {new Date(client.derniereVisite).toLocaleDateString('fr-FR')}
                </span>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1" size="sm">
                  Voir détails
                </Button>
                <Button variant="outline" size="sm">
                  Photos
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <Button variant="outline" size="sm" disabled>
          Précédent
        </Button>
        <Badge variant="secondary">Page 1 sur 1</Badge>
        <Button variant="outline" size="sm" disabled>
          Suivant
        </Button>
      </div>
    </div>
  );
}
