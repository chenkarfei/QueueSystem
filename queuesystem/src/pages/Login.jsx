import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, MonitorPlay, Ticket, Monitor } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useQueue } from '../hooks/useQueue';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedCounter, setSelectedCounter] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { state } = useQueue();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (selectedRole === 'counter' && !selectedCounter) {
      setError('Please select a counter');
      return;
    }
    
    if (login(selectedRole, pin, selectedCounter)) {
      navigate(selectedRole === 'admin' ? '/admin' : '/counter');
    } else {
      setError('Invalid PIN');
    }
  };

  const openModal = (role) => {
    setSelectedRole(role);
    setPin('');
    setSelectedCounter('');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-500 mb-2">QueuePro</h1>
          <p className="text-gray-600 dark:text-gray-400">Select your role to continue</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card 
            className="cursor-pointer hover:border-purple-500 transition-colors group"
            onClick={() => navigate('/queue')}
          >
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Ticket className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Customer</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get a ticket, join the queue, and track your status.</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-blue-500 transition-colors group"
            onClick={() => openModal('admin')}
          >
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldAlert className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Administrator</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage settings, view reports, and monitor queues.</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-green-500 transition-colors group"
            onClick={() => openModal('counter')}
          >
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MonitorPlay className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Counter Staff</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Call tickets, serve customers, and manage your counter.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Button variant="ghost" className="text-gray-500" onClick={() => navigate('/display')}>
            <Monitor className="h-4 w-4 mr-2" />
            Open Public Display Board
          </Button>
        </div>
      </div>

      <Modal 
        isOpen={!!selectedRole} 
        onClose={() => setSelectedRole(null)}
        title={`${selectedRole === 'admin' ? 'Admin' : 'Counter'} Login`}
      >
        <form onSubmit={handleLogin} className="space-y-4">
          {selectedRole === 'counter' && (
            <Select
              label="Select Counter"
              value={selectedCounter}
              onChange={(e) => setSelectedCounter(e.target.value)}
              required
            >
              <option value="">Select a counter...</option>
              {state.counters.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} - {state.services.find(s => s.id === c.serviceId)?.name || 'Unknown'}
                </option>
              ))}
            </Select>
          )}
          <Input
            type="password"
            label="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder={selectedRole === 'admin' ? "Hint: 1234" : "Hint: 5678"}
            autoFocus
            error={error}
            maxLength={4}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setSelectedRole(null)}>
              Cancel
            </Button>
            <Button type="submit">
              Login
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
