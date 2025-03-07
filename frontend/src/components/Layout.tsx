import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Home, 
  Users, 
  Building2, 
  ShoppingCart, 
  CreditCard, 
  ClipboardList,
  LogOut,
  Menu,
  ChevronRight
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store';

const Layout: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);

  const navigation = [
    { name: 'Dashboard', to: '/', icon: Home },
    { name: 'Suppliers', to: '/suppliers', icon: Building2 },
    { name: 'Purchase Orders', to: '/purchase-orders', icon: ShoppingCart },
    { name: 'Payments', to: '/payments', icon: CreditCard },
  ];

  const adminNavigation = [
    { name: 'Users', to: '/users', icon: Users },
    { name: 'Audit Logs', to: '/audit-logs', icon: ClipboardList },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={twMerge(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out',
          !isOpen && '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-lg font-semibold text-gray-900">PO Manager</span>
          </div>
          {/* <button
            type="button"
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            onClick={() => setIsOpen(!isOpen)}
          >
            <ChevronRight className={`h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button> */}
        </div>

        <nav className="mt-5 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.name}
                to={item.to}
                className={twMerge(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={twMerge(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.name}
              </Link>
            );
          })}

          {user?.role === 'admin' && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-start">
                  <span className="bg-white pr-3 text-sm font-medium text-gray-500">Admin</span>
                </div>
              </div>

              {adminNavigation.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.name}
                    to={item.to}
                    className={twMerge(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon
                      className={twMerge(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-x-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <span className="text-sm font-semibold leading-6 text-gray-900">
              Welcome, {user?.username}!
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main
        className={twMerge(
          'transition-all duration-300',
          isOpen ? 'lg:pl-64' : ''
        )}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;