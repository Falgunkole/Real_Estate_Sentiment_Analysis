import { useEffect, useState } from 'react';
import { BarChart3, MapPin, IndianRupee, Home } from 'lucide-react';
import { getProperties } from '../lib/queries';

interface DashboardStats {
  totalProperties: number;
  uniqueLocations: number;
  avgPrice: number;
  avgArea: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    uniqueLocations: 0,
    avgPrice: 0,
    avgArea: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      const properties = await getProperties();
      const uniqueLocations = new Set(properties.map((property) => property.location)).size;
      const avgPrice =
        properties.length > 0
          ? properties.reduce((sum, property) => sum + property.price, 0) / properties.length
          : 0;
      const avgArea =
        properties.length > 0
          ? properties.reduce((sum, property) => sum + property.area_sqft, 0) / properties.length
          : 0;

      setStats({
        totalProperties: properties.length,
        uniqueLocations,
        avgPrice,
        avgArea
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-stone-600">Loading dashboard...</div>;
  }

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);

  const cards = [
    {
      label: 'Total Properties',
      value: stats.totalProperties,
      icon: Home,
      tone: 'text-amber-700 bg-amber-50 border-amber-200'
    },
    {
      label: 'Locations Covered',
      value: stats.uniqueLocations,
      icon: MapPin,
      tone: 'text-indigo-700 bg-indigo-50 border-indigo-200'
    },
    {
      label: 'Average Price',
      value: formatPrice(stats.avgPrice),
      icon: IndianRupee,
      tone: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    {
      label: 'Average Area',
      value: `${Math.round(stats.avgArea)} sq.ft`,
      icon: BarChart3,
      tone: 'text-orange-700 bg-orange-50 border-orange-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-600 text-sm">{card.label}</p>
                <p className="text-3xl font-semibold mt-1 text-stone-900">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl border ${card.tone}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            {card.label === 'Average Area' && <p className="text-xs mt-4 text-stone-500">Calculated across all listed properties.</p>}
          </div>
        );
      })}
    </div>
  );
}
