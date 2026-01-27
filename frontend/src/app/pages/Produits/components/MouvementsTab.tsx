// src/app/pages/Produits/components/MouvementsTab.tsx
import { useState } from 'react';
import { Search, Filter, Download, TrendingUp, TrendingDown, RefreshCw, Package } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent } from '@/app/components/ui/card';
import { useMouvements, useProduits } from '@/hooks/useProduitsModule';
import { produitsApi } from '@/services/produitsApi';
import { Badge } from './ui/Badge';

export function MouvementsTab() {
  const { data: mouvements, loading, reload } = useMouvements();
  const { data: produits } = useProduits();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('tous');
  const [filterStock, setFilterStock] = useState<string>('tous');
  const [filterProduit, setFilterProduit] = useState<string>('');

  const handleExport = async () => {
    try {
      const response = await produitsApi.mouvements.export();
      alert('✅ Export en cours de téléchargement...');
      console.log('Export data:', response);
    } catch (error: any) {
      alert('❌ Erreur lors de l\'export: ' + error.message);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'entree':
        return TrendingUp;
      case 'sortie':
        return TrendingDown;
      case 'ajustement':
        return RefreshCw;
      case 'inventaire':
        return Package;
      default:
        return Package;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: any = {
      'entree': 'Entrée',
      'sortie': 'Sortie',
      'ajustement': 'Ajustement',
      'inventaire': 'Inventaire'
    };
    return labels[type] || type;
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'entree':
        return 'success';
      case 'sortie':
        return 'danger';
      case 'ajustement':
        return 'warning';
      case 'inventaire':
        return 'info';
      default:
        return 'default';
    }
  };

  const filteredMouvements = mouvements.filter((m: any) => {
    if (filterType !== 'tous' && m.type_mouvement !== filterType) return false;
    if (filterStock !== 'tous' && m.type_stock !== filterStock) return false;
    if (filterProduit && m.produit_id.toString() !== filterProduit) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mouvements de stock</h2>
          <p className="text-sm text-gray-600 mt-1">
            Historique complet des mouvements de stock
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="tous">Tous les types</option>
                <option value="entree">Entrée</option>
                <option value="sortie">Sortie</option>
                <option value="ajustement">Ajustement</option>
                <option value="inventaire">Inventaire</option>
              </select>
            </div>

            <div>
              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="tous">Tous les stocks</option>
                <option value="vente">Stock Vente</option>
                <option value="utilisation">Stock Salon</option>
              </select>
            </div>

            <div>
              <select
                value={filterProduit}
                onChange={(e) => setFilterProduit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les produits</option>
                {produits.map((prod: any) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Entrées</p>
                <p className="text-2xl font-bold text-green-600">
                  {mouvements.filter((m: any) => m.type_mouvement === 'entree').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sorties</p>
                <p className="text-2xl font-bold text-red-600">
                  {mouvements.filter((m: any) => m.type_mouvement === 'sortie').length}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ajustements</p>
                <p className="text-2xl font-bold text-orange-600">
                  {mouvements.filter((m: any) => m.type_mouvement === 'ajustement').length}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inventaires</p>
                <p className="text-2xl font-bold text-blue-600">
                  {mouvements.filter((m: any) => m.type_mouvement === 'inventaire').length}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      ) : filteredMouvements.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600">Aucun mouvement trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Après
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motif
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMouvements.map((mvt: any) => {
                  const TypeIcon = getTypeIcon(mvt.type_mouvement);
                  
                  return (
                    <tr key={mvt.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(mvt.created_at).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(mvt.created_at).toLocaleTimeString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {mvt.produit?.nom || 'Produit inconnu'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {mvt.produit?.reference}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="w-4 h-4" />
                          <Badge variant={getTypeVariant(mvt.type_mouvement)}>
                            {getTypeLabel(mvt.type_mouvement)}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={mvt.type_stock === 'vente' ? 'info' : 'default'}>
                          {mvt.type_stock === 'vente' ? 'Vente' : 'Salon'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-medium ${
                          mvt.type_mouvement === 'entree' 
                            ? 'text-green-600' 
                            : mvt.type_mouvement === 'sortie'
                            ? 'text-red-600'
                            : 'text-gray-900'
                        }`}>
                          {mvt.type_mouvement === 'entree' ? '+' : mvt.type_mouvement === 'sortie' ? '-' : ''}
                          {mvt.quantite}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {mvt.stock_avant}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {mvt.stock_apres}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {mvt.motif || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {mvt.user?.nom_complet || mvt.user?.name || '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}