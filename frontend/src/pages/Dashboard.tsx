import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { BarChart3, ShoppingCart, Building2, CreditCard, Activity, Package, RefreshCw, DollarSign, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { RootState } from '../store';
import api from '../lib/api';

interface DashboardStats {
  totalSuppliers: number;
  totalPurchaseOrders: number;
  pendingPurchaseOrders: number;
  totalSpent: number;
  pendingPayments: number;
  recentActivities: {
    type: string;
    description: string;
    date: string;
    status: string;
    amount: number;
  }[];
  monthlySpending: {
    month: string;
    amount: number;
  }[];
  topSuppliers: {
    name: string;
    totalAmount: number;
    orderCount: number;
  }[];
}

const Dashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard');
      setStats(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        <Activity className="h-5 w-5 mr-2" />
        {error}
      </div>
    );
  }

  if (!stats) return null;

  // Ensure stats has default values to prevent TypeError
  const safeStats = {
    totalPurchaseOrders: stats?.totalPurchaseOrders ?? 0,
    pendingPurchaseOrders: stats?.pendingPurchaseOrders ?? 0,
    totalSuppliers: stats?.totalSuppliers ?? 0,
    totalSpent: stats?.totalSpent ?? 0,
    pendingPayments: stats?.pendingPayments ?? 0,
    monthlySpending: stats?.monthlySpending ?? [],
    recentActivities: stats?.recentActivities ?? [],
    topSuppliers: stats?.topSuppliers ?? []
  };

  const dashboardStats = [
    {
      name: 'Total Purchase Orders',
      value: `${safeStats.totalPurchaseOrders}`,
      icon: Package,
      description: `${safeStats.pendingPurchaseOrders} pending`
    },
    {
      name: 'Active Suppliers',
      value: `${safeStats.totalSuppliers}`,
      icon: Building2,
      description: 'Total suppliers'
    },
    {
      name: 'Total Spent',
      value: `$${safeStats.totalSpent.toFixed(2)}`,
      icon: DollarSign,
      description: 'All time'
    },
    {
      name: 'Pending Payments',
      value: `$${safeStats.pendingPayments.toFixed(2)}`,
      icon: Clock,
      description: 'Awaiting payment'
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
        {dashboardStats.map((item) => (
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

      {/* Monthly Spending Chart */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Monthly Spending</h2>
            <button
              onClick={fetchDashboardStats}
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safeStats.monthlySpending}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <div className="flow-root">
            <ul className="-mb-8">
              {safeStats.recentActivities.map((activity, index) => (
                <li key={index}>
                  <div className="relative pb-8">
                    {index !== safeStats.recentActivities.length - 1 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          activity.type === 'payment' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {activity.type === 'payment' ? (
                            <DollarSign className="h-5 w-5 text-green-600" />
                          ) : (
                            <Package className="h-5 w-5 text-blue-600" />
                          )}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">{activity.description}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            Status: <span className={`font-medium ${
                              activity.status === 'paid' ? 'text-green-600' :
                              activity.status === 'pending' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>{activity.status}</span>
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap">
                          <time dateTime={activity.date}>
                            {new Date(activity.date).toLocaleDateString()}
                          </time>
                          <p className="mt-1 text-gray-900 font-medium">
                            ${activity.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Top Suppliers */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Top Suppliers</h2>
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Count
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {safeStats.topSuppliers.map((supplier, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {supplier.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${supplier.totalAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {supplier.orderCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;