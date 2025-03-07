import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Home, 
  Users, 
  Building2, 
  ShoppingCart, 
  CreditCard, 
  ClipboardList,
  LogOut 
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store';

const Layout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <ShoppingCart className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">PO Manager</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">
                  <Home className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
                <Link to="/suppliers" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                  <Building2 className="h-4 w-4 mr-1" />
                  Suppliers
                </Link>
                <Link to="/purchase-orders" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Purchase Orders
                </Link>
                <Link to="/payments" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                  <CreditCard className="h-4 w-4 mr-1" />
                  Payments
                </Link>
                {user?.role === 'admin' && (
                  <>
                    <Link to="/users" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                      <Users className="h-4 w-4 mr-1" />
                      Users
                    </Link>
                    <Link to="/audit-logs" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                      <ClipboardList className="h-4 w-4 mr-1" />
                      Audit Logs
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">{user?.username}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;