import { useState } from 'react';
import { Scan, Trash2, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Separator } from '@/app/components/ui/separator';
import { produitsMock, clientsMock } from '@/lib/mockData';
import { toast } from 'sonner';

interface ArticlePanier {
  produitId: string;
  nom: string;
  prix: number;
  quantite: number;
}

export function Ventes() {
  const [panier, setPanier] = useState<ArticlePanier[]>([]);
  const [clientSelectionne, setClientSelectionne] = useState<string>('');
  const [remise, setRemise] = useState(0);

  const ajouterArticle = (produitId: string) => {
    const produit = produitsMock.find((p) => p.id === produitId);
    if (!produit) return;

    const articleExistant = panier.find((a) => a.produitId === produitId);
    if (articleExistant) {
      setPanier(
        panier.map((a) =>
          a.produitId === produitId ? { ...a, quantite: a.quantite + 1 } : a
        )
      );
    } else {
      setPanier([
        ...panier,
        { produitId, nom: produit.nom, prix: produit.prix, quantite: 1 },
      ]);
    }
  };

  const retirerArticle = (produitId: string) => {
    setPanier(panier.filter((a) => a.produitId !== produitId));
  };

  const sousTotal = panier.reduce((sum, article) => sum + article.prix * article.quantite, 0);
  const montantRemise = (sousTotal * remise) / 100;
  const total = sousTotal - montantRemise;

  const effectuerPaiement = (methode: string) => {
    if (panier.length === 0) {
      toast.error('Le panier est vide');
      return;
    }
    toast.success(`Paiement de ${total.toLocaleString()} FCFA par ${methode} effectué!`);
    setPanier([]);
    setClientSelectionne('');
    setRemise(0);
  };

  const annulerVente = () => {
    setPanier([]);
    setClientSelectionne('');
    setRemise(0);
    toast.info('Vente annulée');
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-6">Ventes / Caisse</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gauche - Panier */}
        <div className="lg:col-span-2 space-y-4">
          {/* Scan code-barre */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input placeholder="Scanner code-barre ou rechercher..." className="flex-1" />
                <Button variant="outline">
                  <Scan className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Liste des articles */}
          <Card>
            <CardHeader>
              <CardTitle>Articles du panier</CardTitle>
            </CardHeader>
            <CardContent>
              {panier.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Le panier est vide. Scannez ou sélectionnez des produits.
                </div>
              ) : (
                <div className="space-y-2">
                  {panier.map((article) => (
                    <div
                      key={article.produitId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm">{article.nom}</p>
                        <p className="text-xs text-gray-600">
                          {article.prix.toLocaleString()} FCFA × {article.quantite}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">
                          {(article.prix * article.quantite).toLocaleString()} FCFA
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => retirerArticle(article.produitId)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sélection rapide de produits */}
          <Card>
            <CardHeader>
              <CardTitle>Produits disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {produitsMock.map((produit) => (
                  <Button
                    key={produit.id}
                    variant="outline"
                    size="sm"
                    onClick={() => ajouterArticle(produit.id)}
                    className="h-auto py-3 flex flex-col items-start"
                  >
                    <span className="text-sm">{produit.nom}</span>
                    <span className="text-xs text-gray-600">
                      {produit.prix.toLocaleString()} FCFA
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Droite - Récapitulatif et paiement */}
        <div className="space-y-4">
          {/* Sélection client */}
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={clientSelectionne} onValueChange={setClientSelectionne}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clientsMock.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Récapitulatif */}
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span>{sousTotal.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Remise fidélité</span>
                  <span className="text-green-600">-{montantRemise.toLocaleString()} FCFA</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl">
                  <span>TOTAL</span>
                  <span className="text-blue-600">{total.toLocaleString()} FCFA</span>
                </div>
              </div>

              {/* Boutons de paiement */}
              <div className="space-y-2">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  onClick={() => effectuerPaiement('Espèces')}
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Espèces
                </Button>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                  onClick={() => effectuerPaiement('Mobile Money')}
                >
                  <Smartphone className="w-5 h-5 mr-2" />
                  Mobile Money
                </Button>
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  size="lg"
                  onClick={() => effectuerPaiement('Crédit')}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Crédit
                </Button>
              </div>

              <Separator />

              <Button variant="outline" className="w-full" onClick={annulerVente}>
                Annuler
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
