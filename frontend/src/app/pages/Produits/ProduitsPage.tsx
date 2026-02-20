import { useState, useEffect } from 'react';
import { Package, Tag, ArrowRightLeft, History, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CategoriesTab } from './components/CategoriesTab';
import { AttributsTab } from './components/AttributsTab';
import { ProduitsTab } from './components/ProduitsTab';
import { TransfertsTab } from './components/TransfertsTab';
import { MouvementsTab } from './components/MouvementsTab';
import { ValidationProduitsTab } from './components/ValidationProduitsTab';
import { produitsApi } from '@/services/produitsApi';

type TabType = 'produits' | 'validation' | 'categories' | 'attributs' | 'transferts' | 'mouvements';

export function ProduitsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('produits');
  const { user } = useAuth();
  const isGestionnaire = user?.role === 'gestionnaire';

  const tabs = [
    { id: 'produits',    label: 'Produits',     icon: Package },
    ...(isGestionnaire ? [{ id: 'validation', label: 'En attente', icon: Clock }] : []),
    { id: 'categories',  label: 'Catégories',   icon: Tag },
    { id: 'attributs',   label: 'Attributs',    icon: Tag },
    { id: 'transferts',  label: 'Transferts',   icon: ArrowRightLeft },
    { id: 'mouvements',  label: 'Mouvements',   icon: History },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'produits':   return <ProduitsTab />;
      case 'validation': return isGestionnaire ? <ValidationProduitsTab /> : <ProduitsTab />;
      case 'categories': return <CategoriesTab />;
      case 'attributs':  return <AttributsTab />;
      case 'transferts': return <TransfertsTab />;
      case 'mouvements': return <MouvementsTab />;
      default:           return <ProduitsTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Gestion des Produits</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Gérez vos produits, catégories, stocks et mouvements
          </p>
        </div>

        <div className="bg-white rounded-lg shadow mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            {/* Desktop */}
            <nav className="hidden md:flex space-x-4 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 py-4 px-3 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {/* Badge compteur sur l'onglet validation */}
                    {tab.id === 'validation' && <ValidationBadge />}
                  </button>
                );
              })}
            </nav>

            {/* Mobile */}
            <div className="md:hidden px-3 py-3">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as TabType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>{tab.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>{renderTabContent()}</div>
      </div>
    </div>
  );
}


// Petit badge qui affiche le nombre de produits en attente
function ValidationBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    produitsApi.produits.enAttente({ per_page: 1 })
      .then((res) => setCount(res.data?.total ?? 0))
      .catch(() => setCount(null));
  }, []);

  if (!count) return null;

  return (
    <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold">
      {count > 9 ? '9+' : count}
    </span>
  );
}