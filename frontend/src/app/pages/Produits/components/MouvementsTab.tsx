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
      case 'entree':     return TrendingUp;
      case 'sortie':     return TrendingDown;
      case 'ajustement': return RefreshCw;
      case 'inventaire': return Package;
      default:           return Package;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: any = {
      'entree':     'Entrée',
      'sortie':     'Sortie',
      'ajustement': 'Ajustement',
      'inventaire': 'Inventaire'
    };
    return labels[type] || type;
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'entree':     return 'success';
      case 'sortie':     return 'danger';
      case 'ajustement': return 'warning';
      case 'inventaire': return 'info';
      default:           return 'default';
    }
  };

  const getProduitNom = (mvt: any) => mvt.variante?.produit?.nom || 'Produit inconnu';
  const getVarianteRef = (mvt: any) => mvt.variante?.reference || '';

  const filteredMouvements = mouvements.filter((m: any) => {
    if (filterType !== 'tous' && m.type_mouvement !== filterType) return false;
    if (filterStock !== 'tous' && m.type_stock !== filterStock) return false;
    if (filterProduit && m.variante?.produit?.id?.toString() !== filterProduit) return false;
    if (search) {
      const nom = getProduitNom(m).toLowerCase();
      if (!nom.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Mouvements de stock</h2>
          <p className="text-sm text-gray-600 mt-1">Historique complet des mouvements de stock</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="tous">Tous les types</option>
              <option value="entree">Entrée</option>
              <option value="sortie">Sortie</option>
              <option value="ajustement">Ajustement</option>
              <option value="inventaire">Inventaire</option>
            </select>

            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="tous">Tous les stocks</option>
              <option value="vente">Stock Vente</option>
              <option value="utilisation">Stock Salon</option>
              <option value="reserve">Stock Réserve</option>
            </select>

            <select
              value={filterProduit}
              onChange={(e) => setFilterProduit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Tous les produits</option>
              {produits.map((prod: any) => (
                <option key={prod.id} value={prod.id}>{prod.nom}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Entrées',     type: 'entree',     color: 'text-green-600', Icon: TrendingUp },
          { label: 'Sorties',     type: 'sortie',     color: 'text-red-600',   Icon: TrendingDown },
          { label: 'Ajustements', type: 'ajustement', color: 'text-orange-600',Icon: RefreshCw },
          { label: 'Inventaires', type: 'inventaire', color: 'text-blue-600',  Icon: Package },
        ].map(({ label, type, color, Icon }) => (
          <Card key={type}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">{label}</p>
                  <p className={`text-lg sm:text-2xl font-bold ${color}`}>
                    {mouvements.filter((m: any) => m.type_mouvement === type).length}
                  </p>
                </div>
                <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tableau / Cards */}
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
        <>
          {/* Vue Mobile */}
          <div className="lg:hidden space-y-3">
            {filteredMouvements.map((mvt: any) => {
              const TypeIcon = getTypeIcon(mvt.type_mouvement);
              return (
                <Card key={mvt.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{getProduitNom(mvt)}</p>
                          {getVarianteRef(mvt) && (
                            <p className="text-xs text-gray-500">{getVarianteRef(mvt)}</p>
                          )}
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <div>{new Date(mvt.created_at).toLocaleDateString('fr-FR')}</div>
                          <div>{new Date(mvt.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1">
                          <TypeIcon className="w-3 h-3" />
                          <Badge variant={getTypeVariant(mvt.type_mouvement)}>
                            {getTypeLabel(mvt.type_mouvement)}
                          </Badge>
                        </div>
                        <Badge variant={mvt.type_stock === 'vente' ? 'info' : mvt.type_stock === 'reserve' ? 'warning' : 'default'}>
                          {mvt.type_stock === 'vente' ? 'Vente' : mvt.type_stock === 'reserve' ? 'Réserve' : 'Salon'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                        <div>
                          <p className="text-xs text-gray-500">Quantité</p>
                          <p className={`text-sm font-medium ${
                            mvt.type_mouvement === 'entree' ? 'text-green-600' :
                            mvt.type_mouvement === 'sortie' ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {mvt.type_mouvement === 'entree' ? '+' : mvt.type_mouvement === 'sortie' ? '-' : ''}
                            {mvt.quantite}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Avant</p>
                          <p className="text-sm font-medium text-gray-900">{mvt.stock_avant}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Après</p>
                          <p className="text-sm font-medium text-gray-900">{mvt.stock_apres}</p>
                        </div>
                      </div>

                      {(mvt.motif || mvt.user) && (
                        <div className="pt-2 border-t space-y-1">
                          {mvt.motif && (
                            <p className="text-xs text-gray-600"><span className="font-medium">Motif:</span> {mvt.motif}</p>
                          )}
                          {mvt.user && (
                            <p className="text-xs text-gray-600"><span className="font-medium">Par:</span> {mvt.user?.nom_complet || mvt.user?.name}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Vue Desktop */}
          <Card className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Date', 'Produit / Variante', 'Type', 'Stock', 'Quantité', 'Avant', 'Après', 'Motif', 'Utilisateur'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMouvements.map((mvt: any) => {
                    const TypeIcon = getTypeIcon(mvt.type_mouvement);
                    return (
                      <tr key={mvt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(mvt.created_at).toLocaleDateString('fr-FR')}</div>
                          <div className="text-xs text-gray-500">{new Date(mvt.created_at).toLocaleTimeString('fr-FR')}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{getProduitNom(mvt)}</div>
                          {getVarianteRef(mvt) && (
                            <div className="text-xs text-gray-500">{getVarianteRef(mvt)}</div>
                          )}
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
                          <Badge variant={mvt.type_stock === 'vente' ? 'info' : mvt.type_stock === 'reserve' ? 'warning' : 'default'}>
                            {mvt.type_stock === 'vente' ? 'Vente' : mvt.type_stock === 'reserve' ? 'Réserve' : 'Salon'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-medium ${
                            mvt.type_mouvement === 'entree' ? 'text-green-600' :
                            mvt.type_mouvement === 'sortie' ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {mvt.type_mouvement === 'entree' ? '+' : mvt.type_mouvement === 'sortie' ? '-' : ''}
                            {mvt.quantite}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{mvt.stock_avant}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mvt.stock_apres}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{mvt.motif || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {mvt.user?.nom_complet || mvt.user?.name || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}