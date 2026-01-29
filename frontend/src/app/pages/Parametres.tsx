// src/app/pages/Parametres.tsx
import {
  Building,
  Users as UsersIcon,
  MessageSquare,
  Award,
  Database,
  Palette,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';
import { Switch } from '@/app/components/ui/switch';

export function Parametres() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl">Paramètres</h1>

      <Tabs defaultValue="salon">
        <TabsList>
          <TabsTrigger value="salon">
            <Building className="w-4 h-4 mr-2" />
            Salon
          </TabsTrigger>
          <TabsTrigger value="utilisateurs">
            <UsersIcon className="w-4 h-4 mr-2" />
            Utilisateurs
          </TabsTrigger>
          {/* <TabsTrigger value="sms">
            <MessageSquare className="w-4 h-4 mr-2" />
            SMS
          </TabsTrigger> */}
          {/* <TabsTrigger value="fidelite">
            <Award className="w-4 h-4 mr-2" />
            Fidélité
          </TabsTrigger> */}
          {/* <TabsTrigger value="sync">
            <Database className="w-4 h-4 mr-2" />
            Synchronisation
          </TabsTrigger> */}
          {/* <TabsTrigger value="theme">
            <Palette className="w-4 h-4 mr-2" />
            Thème
          </TabsTrigger> */}
        </TabsList>

        {/* Informations salon */}
        <TabsContent value="salon" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations du salon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom-salon">Nom du salon</Label>
                <Input id="nom-salon" defaultValue="Salon Afro Style" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input id="adresse" defaultValue="Ouagadougou, Burkina Faso" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input id="telephone" defaultValue="+226 70 00 00 00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="contact@afrostyle.bf" />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="horaires">Horaires d'ouverture</Label>
                <Input id="horaires" defaultValue="Lundi - Samedi: 9h - 19h" />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">Enregistrer</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Utilisateurs */}
        <TabsContent value="utilisateurs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm">Admin Salon</p>
                    <p className="text-xs text-gray-600">admin@afrostyle.bf</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Administrateur
                    </span>
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  + Ajouter un utilisateur
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration SMS */}
        {/* <TabsContent value="sms" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration SMS (Africa's Talking)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Clé API</Label>
                <Input id="api-key" type="password" placeholder="YOUR_API_KEY_HERE" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sender-id">Sender ID</Label>
                <Input id="sender-id" placeholder="AFROSTYLE" />
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  📌 Note: Obtenez vos identifiants API sur{' '}
                  <a
                    href="https://africastalking.com"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    africastalking.com
                  </a>
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">Enregistrer</Button>
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* Programme de fidélité */}
        {/* <TabsContent value="fidelite" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Programme de fidélité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm">Activer le programme de fidélité</p>
                  <p className="text-xs text-gray-600">
                    Les clients gagnent des points à chaque achat
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="points-ratio">Points par 1000 FCFA dépensés</Label>
                <Input id="points-ratio" type="number" defaultValue="10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remise-ratio">Remise (% par 100 points)</Label>
                <Input id="remise-ratio" type="number" defaultValue="5" />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">Enregistrer</Button>
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* Synchronisation */}
        {/* <TabsContent value="sync" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Synchronisation & Backups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm">Synchronisation automatique</p>
                  <p className="text-xs text-gray-600">Sync toutes les 5 minutes</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dernière synchronisation:</span>
                  <span>Il y a 2 minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Actions en attente:</span>
                  <span className="text-orange-600">0</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Synchroniser maintenant
              </Button>
              <Separator />
              <Button variant="outline" className="w-full">
                Créer un backup
              </Button>
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* Thème */}
        {/* <TabsContent value="theme" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Thème & Préférences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm">Mode sombre</p>
                  <p className="text-xs text-gray-600">
                    Économise la batterie et réduit la fatigue oculaire
                  </p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label>Couleur principale</Label>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-lg bg-blue-600 border-2 border-blue-800" />
                  <button className="w-10 h-10 rounded-lg bg-purple-600 border" />
                  <button className="w-10 h-10 rounded-lg bg-orange-600 border" />
                  <button className="w-10 h-10 rounded-lg bg-green-600 border" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
