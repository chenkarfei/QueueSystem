import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useQueue } from '../../hooks/useQueue';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function CustomerBooking() {
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [newTicket, setNewTicket] = useState(null);

  useEffect(() => {
    if (state.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.darkMode]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone || !selectedService) return;

    const action = {
      type: 'ISSUE_TICKET',
      payload: { serviceId: selectedService.id, name, phone }
    };
    
    dispatch(action);
    
    // Find the newly created ticket (it will be the last one)
    setTimeout(() => {
      const tickets = JSON.parse(localStorage.getItem('qms_data')).tickets;
      const latestTicket = tickets[tickets.length - 1];
      setNewTicket(latestTicket);
      setStep(3);
    }, 100);
  };

  const getWaitCount = (serviceId) => {
    return state.tickets.filter(t => t.serviceId === serviceId && t.status === 'waiting').length;
  };

  const getCurrentlyServing = (serviceId) => {
    const serving = state.tickets.find(t => t.serviceId === serviceId && t.status === 'serving');
    return serving ? serving.ticketNumber : 'None';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-md">
        <header className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-500 mb-2">{state.settings.businessName}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {step === 1 && "Select a service to join the queue"}
            {step === 2 && "Enter your details"}
            {step === 3 && "You're in the queue!"}
          </p>
        </header>

        {step === 1 && (
          <div className="space-y-4">
            {state.services.filter(s => s.active).map((service) => (
              <Card 
                key={service.id} 
                className="cursor-pointer hover:border-blue-500 transition-all active:scale-[0.98]"
                onClick={() => handleServiceSelect(service)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{service.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{getWaitCount(service.id)} waiting</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {step === 2 && (
          <Card>
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Selected Service</h3>
                <p className="text-blue-600 dark:text-blue-400 font-semibold">{selectedService.name}</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="5551234567"
                  required
                  pattern="[0-9]*"
                />
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1">
                    Get My Number
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 3 && newTicket && (
          <Card className="text-center overflow-hidden border-blue-200 dark:border-blue-900 shadow-lg">
            <div className="bg-blue-600 p-6 text-white">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-blue-200" />
              <h2 className="text-xl font-medium opacity-90">Your Ticket Number</h2>
              <div className="text-6xl font-black tracking-tight mt-2">{newTicket.ticketNumber}</div>
            </div>
            <CardContent className="p-6 space-y-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Service</p>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{selectedService.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Position</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {getWaitCount(selectedService.id)}<span className="text-sm font-normal text-gray-500"> in line</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Est. Wait</p>
                  <div className="flex items-center justify-center gap-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    <Clock className="h-5 w-5 text-amber-500" />
                    ~{getWaitCount(selectedService.id) * 5}m
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Currently Serving</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getCurrentlyServing(selectedService.id)}</p>
              </div>

              <div className="pt-4 space-y-3">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate(`/queue/track?ticket=${newTicket.ticketNumber}`)}
                >
                  Track My Queue Live
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => {
                    setStep(1);
                    setName('');
                    setPhone('');
                    setSelectedService(null);
                  }}
                >
                  Book Another Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
