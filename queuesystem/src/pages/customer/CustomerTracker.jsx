import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Clock, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { useQueue } from '../../hooks/useQueue';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export default function CustomerTracker() {
  const { state } = useQueue();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTicket = searchParams.get('ticket') || '';
  
  const [ticketNo, setTicketNo] = useState(initialTicket);
  const [ticketData, setTicketData] = useState(null);
  const [error, setError] = useState('');
  const [refreshCountdown, setRefreshCountdown] = useState(10);

  useEffect(() => {
    if (state.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.darkMode]);

  const fetchTicketStatus = (number) => {
    if (!number) return;
    const found = state.tickets.find(t => {
      if (new Date(t.issuedAt).toDateString() !== new Date().toDateString()) return false;
      if (t.ticketNumber.toUpperCase() === number.toUpperCase()) return true;
      if (t.previousTicketNumbers && t.previousTicketNumbers.some(n => n.toUpperCase() === number.toUpperCase())) return true;
      return false;
    });
    
    if (found) {
      setTicketData(found);
      if (found.ticketNumber.toUpperCase() !== number.toUpperCase()) {
        setTicketNo(found.ticketNumber);
        navigate(`/queue/track?ticket=${found.ticketNumber}`, { replace: true });
      }
      setError('');
    } else {
      setTicketData(null);
      setError('Ticket not found for today. Please check the number.');
    }
  };

  useEffect(() => {
    if (initialTicket) {
      fetchTicketStatus(initialTicket);
    }
  }, [initialTicket, state.tickets]);

  useEffect(() => {
    if (!ticketData || ticketData.status === 'served' || ticketData.status === 'no-show') return;

    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchTicketStatus(ticketNo);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [ticketData, ticketNo, state.tickets]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTicketStatus(ticketNo);
    setRefreshCountdown(10);
  };

  const getWaitCount = (ticket) => {
    return state.tickets.filter(t => {
      if (t.serviceId !== ticket.serviceId || t.status !== 'waiting' || t.id === ticket.id) return false;
      if (t.isTransferred && !ticket.isTransferred) return true;
      if (!t.isTransferred && ticket.isTransferred) return false;
      return new Date(t.issuedAt) < new Date(ticket.issuedAt);
    }).length;
  };

  const getInitialWaitCount = (ticket) => {
    return state.tickets.filter(t => {
      if (t.serviceId !== ticket.serviceId || t.id === ticket.id) return false;
      if (t.calledAt && new Date(t.calledAt) <= new Date(ticket.issuedAt)) return false;
      if (t.isTransferred && !ticket.isTransferred) return true;
      if (!t.isTransferred && ticket.isTransferred) return false;
      return new Date(t.issuedAt) < new Date(ticket.issuedAt);
    }).length;
  };

  const getCurrentlyServing = (serviceId) => {
    const serving = state.tickets.find(t => t.serviceId === serviceId && t.status === 'serving');
    return serving ? serving.ticketNumber : 'None';
  };

  const getServiceName = (serviceId) => {
    return state.services.find(s => s.id === serviceId)?.name || 'Unknown Service';
  };

  const getCounterName = (counterId) => {
    return state.counters.find(c => c.id === counterId)?.name || counterId;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-md">
        <header className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-500 mb-2">{state.settings.businessName}</h1>
          <p className="text-gray-600 dark:text-gray-400">Live Queue Tracker</p>
        </header>

        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Enter Ticket Number (e.g. A012)"
                value={ticketNo}
                onChange={(e) => setTicketNo(e.target.value)}
                className="uppercase"
              />
              <Button type="submit" className="shrink-0">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            {error && <p className="text-sm text-red-500 mt-2 flex items-center gap-1"><AlertCircle className="h-4 w-4"/> {error}</p>}
          </CardContent>
        </Card>

        {ticketData && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {ticketData.status === 'serving' && (
              <div className="bg-green-500 text-white p-4 rounded-xl shadow-lg shadow-green-500/20 text-center animate-pulse">
                <h2 className="text-xl font-bold mb-1">Your number is being called!</h2>
                <p className="text-green-50">Please proceed to {getCounterName(ticketData.counterId)} immediately.</p>
              </div>
            )}

            <Card className="overflow-hidden border-t-4 border-t-blue-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Ticket Number</p>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{ticketData.ticketNumber}</h2>
                  </div>
                  <Badge variant={ticketData.status} className="capitalize text-sm px-3 py-1">
                    {ticketData.status.replace('-', ' ')}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Name</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{ticketData.customerName}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Service</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{getServiceName(ticketData.serviceId)}</span>
                  </div>

                  {ticketData.status === 'waiting' && (
                    <div className="pt-4 space-y-6">
                      {/* Now Serving Highlight */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/50 text-center">
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mb-2">Now Serving</p>
                        <p className="text-5xl font-black text-blue-700 dark:text-blue-300">
                          {getCurrentlyServing(ticketData.serviceId)}
                        </p>
                      </div>

                      {/* Queue Position & Progress */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">People Ahead of You</span>
                          <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {getWaitCount(ticketData)}
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-1000 ease-in-out rounded-full"
                            style={{ 
                              width: `${Math.max(5, getInitialWaitCount(ticketData) === 0 ? 100 : ((getInitialWaitCount(ticketData) - getWaitCount(ticketData)) / getInitialWaitCount(ticketData)) * 100)}%` 
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 font-medium">
                          <span>Joined: {getInitialWaitCount(ticketData)} ahead</span>
                          <span>Your Turn</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {ticketData.status === 'serving' && (
                    <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500 dark:text-gray-400">Counter</span>
                      <span className="font-bold text-green-600 dark:text-green-400 text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {getCounterName(ticketData.counterId)}
                      </span>
                    </div>
                  )}
                </div>

                {(ticketData.status === 'waiting' || ticketData.status === 'serving') && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <RefreshCw className="h-4 w-4 animate-spin-slow" />
                    Auto-refreshing in {refreshCountdown}s
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-8 text-center">
          <Button variant="ghost" onClick={() => navigate('/queue')}>
            Back to Booking
          </Button>
        </div>
      </div>
    </div>
  );
}
