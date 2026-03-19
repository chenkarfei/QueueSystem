import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { ToastProvider } from '../ui/Toast';
import { useQueue } from '../../hooks/useQueue';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { state } = useQueue();

  useEffect(() => {
    if (state.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.darkMode]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex flex-col lg:pl-64 min-h-screen">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
