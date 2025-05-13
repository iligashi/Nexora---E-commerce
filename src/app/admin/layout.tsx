import Link from 'next/link';
import { ReactNode } from 'react';
import { User, ShoppingCart, Package, Users, Settings, BarChart2, Home, Layers } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Inventory', href: '/admin/inventory', icon: Layers },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Manage User', href: '/admin/users', icon: User },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="h-16 flex items-center justify-center font-bold text-xl border-b">Bazar</div>
        <nav className="flex-1 py-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link href={item.href} className="flex items-center gap-3 px-6 py-2 rounded-lg hover:bg-blue-50 text-gray-700 font-medium">
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t text-xs text-gray-400">&copy; {new Date().getFullYear()} Bazar Admin</div>
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center px-8 justify-between">
          <div className="flex items-center gap-4 w-full">
            <input
              type="text"
              placeholder="Search anything..."
              className="px-4 py-2 border rounded w-96 bg-gray-100 focus:outline-none focus:ring"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="font-semibold">Your Balance <span className="ml-2 text-blue-600">$1365</span></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-blue-600">A</div>
              <span className="font-medium">admin</span>
            </div>
          </div>
        </header>
        {/* Page content */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
} 