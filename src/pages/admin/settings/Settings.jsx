import { useState } from 'react';
import { Settings as SettingsIcon, Briefcase, MonitorPlay, Users } from 'lucide-react';
import ServiceSettings from './ServiceSettings';
import CounterSettings from './CounterSettings';
import StaffSettings from './StaffSettings';
import SystemSettings from './SystemSettings';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('services');

  const tabs = [
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'counters', label: 'Counters', icon: MonitorPlay },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'system', label: 'System', icon: SettingsIcon },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="w-full lg:w-64 shrink-0">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'services' && <ServiceSettings />}
          {activeTab === 'counters' && <CounterSettings />}
          {activeTab === 'staff' && <StaffSettings />}
          {activeTab === 'system' && <SystemSettings />}
        </div>
      </div>
    </div>
  );
}
