import { Menu } from 'lucide-react';

export default function Topbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:px-6 lg:px-8">
      <button
        onClick={onMenuClick}
        className="lg:hidden rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        <Menu className="h-6 w-6" />
      </button>
      <div className="flex flex-1 justify-end">
        {/* Add user profile dropdown or notifications here if needed */}
      </div>
    </header>
  );
}
