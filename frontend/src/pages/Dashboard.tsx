import React from 'react';
import { useSelector } from 'react-redux';
import { BarChart3, ShoppingCart, Building2, CreditCard } from 'lucide-react';
import type { RootState } from '../store';

const Dashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const stats = [
    {
      name: 'Total Purchase Orders',
      value: '24',
      icon: ShoppingCart,
      change: '+4.75%',
      changeType: 'positive'
    },
    {
      name: 'Active Suppliers',
      value: '12',
      icon: Building2,
      change: '+2.02%',
      changeType: 'positive'
    },
    {
      name: 'Pending Payments',
      value: '$45,000',
      icon: CreditCard,
      change: '-3.45%',
      changeType: 'negative'
    },
    {
      name: 'Monthly Spending',
      value: '$125,000',
      icon: BarChart3,
      change: '+5.25%',
      changeType: 'positive'
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your purchase orders today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-lg bg-white shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Purchase Orders</h2>
          <div className="text-sm text-gray-500">Coming soon...</div>
        </div>
        <div className="rounded-lg bg-white shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Status</h2>
          <div className="text-sm text-gray-500">Coming soon...</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;