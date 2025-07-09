import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  AlertTriangle,
  Settings,
  Tag,
  Truck
} from 'lucide-react';

const Sidebar: React.FC = () => {
  console.log('Sidebar rendered');
  const { hasRole, user } = useAuth();

  console.log('User role in Sidebar:', user?.role);

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      allowedRoles: ['Admin', 'Staff', 'Customer']
    },
    {
      name: 'Products',
      href: '/products',
      icon: Package,
      allowedRoles: ['Admin', 'Staff']
    },
    {
      name: 'Categories',
      href: '/categories',
      icon: Tag,
      allowedRoles: ['Admin', 'Staff']
    },
    {
      name: 'Suppliers',
      href: '/suppliers',
      icon: Truck,
      allowedRoles: ['Admin', 'Staff']
    },
    {
      name: 'Orders',
      href: '/orders',
      icon: ShoppingCart,
      allowedRoles: ['Admin', 'Staff', 'Customer']
    },
    {
      name: 'Alerts',
      href: '/alerts',
      icon: AlertTriangle,
      allowedRoles: ['Admin', 'Staff']
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      allowedRoles: ['Admin']
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      allowedRoles: ['Admin']
    }
  ];

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-200">Navigation</h2>
      </div>
      
      <nav className="space-y-2">
        {navItems.map((item) => {
          const hasAccess = item.allowedRoles.some(role => {
            const result = hasRole(role);
            console.log(`Checking role "${role}" for nav item "${item.name}":`, result);
            return result;
          });
          
          if (!hasAccess) {
            console.log(`User does NOT have access to "${item.name}"`);
            return null;
          }
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
