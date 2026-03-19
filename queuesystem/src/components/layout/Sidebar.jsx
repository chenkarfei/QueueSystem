import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, Settings, MonitorPlay, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../ui/Button';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/monitor', icon: Users, label: 'Queue Monitor' },
    { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const counterLinks = [
    { to: '/counter', icon: MonitorPlay, label: 'Counter View' },
  ];

  const links = user?.role === 'admin' ? adminLinks : counterLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out dark:bg-gray-900 dark:border-gray-800 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-800 px-4">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">QueuePro</h1>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin'}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200" 
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="mb-4 px-3">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
