import { useState, useEffect } from 'react';
import { Play, RotateCcw, ArrowRightLeft, UserX, CheckCircle2, Clock, Users } from 'lucide-react';
import { useQueue } from '../../hooks/useQueue';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/ui/Toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';

export default function CounterView() {
  const { state, dispatch } = useQueue();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferServiceId, setTransferServiceId] = useState('');

  // Find the counter assigned to this user
  const counter = state.counters.find(c => c.id === user?.counterId);
  const service = state.services.find(s => s.id === counter?.serviceId);

  // Current ticket being served at this counter
  const currentTicket = state.tickets.find(t => t.status === 'serving' && t.counterId === counter?.id);

  // Next tickets in queue for this service
  const nextTickets = state.tickets
    .filter(t => t.status === 'waiting' && t.serviceId === service?.id)
    .sort((a, b) => {
      if (a.isTransferred && !b.isTransferred) return -1;
      if (!a.isTransferred && b.isTransferred) return 1;
      return new Date(a.issuedAt) - new Date(b.issuedAt);
    })
    .slice(0, 5);

  // Daily stats
  const todayTickets = state.tickets.filter(t => 
    t.counterId === counter?.id && 
    new Date(t.issuedAt).toDateString() === new Date().toDateString()
  );
  const servedToday = todayTickets.filter(t => t.status === 'served').length;
  const noShowsToday = todayTickets.filter(t => t.status === 'no-show').length;

  const handleCallNext = () => {
    if (currentTicket) {
      addToast('Please complete current ticket first', 'warning');
      return;
    }
    if (nextTickets.length === 0) {
      addToast('No tickets waiting', 'info');
      return;
    }
    dispatch({ type: 'CALL_NEXT', payload: { counterId: counter.id, serviceId: service.id } });
    addToast(`Called ticket ${nextTickets[0].ticketNumber}`, 'success');
  };

  const handleRecall = () => {
    if (!currentTicket) return;
    dispatch({ type: 'RECALL_TICKET', payload: { ticketId: currentTicket.id } });
    addToast(`Recalled ticket ${currentTicket.ticketNumber}`, 'info');
  };

  const handleMarkServed = () => {
    if (!currentTicket) {
      addToast('No ticket is currently being served', 'warning');
      return;
    }
    dispatch({ type: 'MARK_SERVED', payload: { ticketId: currentTicket.id } });
    addToast(`Ticket ${currentTicket.ticketNumber} marked as served`, 'success');
  };

  const handleNoShow = () => {
    if (!currentTicket) {
      addToast('No ticket is currently being served', 'warning');
      return;
    }
    dispatch({ type: 'MARK_NOSHOW', payload: { ticketId: currentTicket.id } });
    addToast(`Ticket ${currentTicket.ticketNumber} marked as no-show`, 'warning');
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!currentTicket || !transferServiceId) return;
    
    dispatch({ 
      type: 'TRANSFER_TICKET', 
      payload: { ticketId: currentTicket.id, newServiceId: transferServiceId } 
    });
    
    setIsTransferModalOpen(false);
    setTransferServiceId('');
    addToast(`Ticket ${currentTicket.ticketNumber} transferred`, 'success');
  };

  const toggleStatus = () => {
    const newStatus = counter.status === 'open' ? 'break' : 'open';
    dispatch({ type: 'SET_COUNTER_STATUS', payload: { counterId: counter.id, status: newStatus } });
    addToast(`Counter status changed to ${newStatus}`, 'info');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      switch (e.key.toLowerCase()) {
        case 'n':
        case ' ':
          e.preventDefault();
          handleCallNext();
          break;
        case 'r':
          handleRecall();
          break;
        case 's':
          handleMarkServed();
          break;
        case 'x':
          handleNoShow();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTicket, nextTickets]);

  if (!counter) return <div className="p-8 text-center">No counter assigned to this user.</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{counter.name}</h1>
          <div className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
            <Badge variant="primary">{service?.name}</Badge>
            <span>•</span>
            <span>{user.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={counter.status === 'open' ? 'success' : 'warning'} className="text-sm px-3 py-1 uppercase">
            {counter.status}
          </Badge>
          <Button variant="secondary" onClick={toggleStatus}>
            Toggle Status
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Action Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-blue-100 dark:border-blue-900/50 shadow-md">
            <CardContent className="p-8 text-center min-h-[400px] flex flex-col justify-center">
              {currentTicket ? (
                <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Currently Serving</p>
                    <h2 className="text-7xl font-black text-blue-600 dark:text-blue-400 tracking-tighter my-4">
                      {currentTicket.ticketNumber}
                    </h2>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 inline-block min-w-[300px] text-left mx-auto border border-gray-100 dark:border-gray-800">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Customer</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{currentTicket.customerName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{currentTicket.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Wait Time</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                          <Clock className="h-4 w-4 text-amber-500" />
                          {Math.round((new Date(currentTicket.calledAt) - new Date(currentTicket.issuedAt)) / 60000)} mins
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Service</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{service?.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                    <Button size="lg" variant="info" onClick={handleRecall} className="w-full flex flex-col h-auto py-3 gap-1">
                      <RotateCcw className="h-5 w-5" />
                      <span>Recall</span>
                    </Button>
                    <Button size="lg" variant="warning" onClick={() => setIsTransferModalOpen(true)} className="w-full flex flex-col h-auto py-3 gap-1">
                      <ArrowRightLeft className="h-5 w-5" />
                      <span>Transfer</span>
                    </Button>
                    <Button size="lg" variant="danger" onClick={handleNoShow} className="w-full flex flex-col h-auto py-3 gap-1">
                      <UserX className="h-5 w-5" />
                      <span>No Show</span>
                    </Button>
                    <Button size="lg" variant="success" onClick={handleMarkServed} className="w-full flex flex-col h-auto py-3 gap-1">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Served</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-10 w-10 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Ready for Next Customer</h2>
                  <p className="text-gray-500 dark:text-gray-400">There are {nextTickets.length} people waiting in your queue.</p>
                  
                  <Button 
                    size="lg" 
                    className="w-full max-w-xs mx-auto h-16 text-lg shadow-lg shadow-blue-500/20"
                    onClick={handleCallNext}
                    disabled={nextTickets.length === 0 || counter.status !== 'open'}
                  >
                    <Play className="h-6 w-6 mr-2" />
                    Call Next Ticket
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Keyboard Shortcuts Hint */}
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
            <span className="flex items-center gap-1"><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 font-mono">Space</kbd> Call Next</span>
            <span className="flex items-center gap-1"><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 font-mono">R</kbd> Recall</span>
            <span className="flex items-center gap-1"><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 font-mono">S</kbd> Served</span>
            <span className="flex items-center gap-1"><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 font-mono">X</kbd> No Show</span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="flex justify-between items-center">
                <span>Next in Queue</span>
                <Badge variant="primary">{nextTickets.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {nextTickets.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {nextTickets.map((ticket, idx) => (
                    <div key={ticket.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-lg text-gray-900 dark:text-gray-100 w-12">{ticket.ticketNumber}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{ticket.customerName}</p>
                            {ticket.isTransferred && (
                              <Badge variant="warning" className="text-[10px] px-1.5 py-0">Transferred</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Wait: {Math.round((new Date() - new Date(ticket.issuedAt)) / 60000)}m</p>
                        </div>
                      </div>
                      {!currentTicket && (
                        <Button size="sm" onClick={() => {
                          dispatch({ type: 'CALL_SPECIFIC_TICKET', payload: { ticketId: ticket.id, counterId: counter.id } });
                          addToast(`Called ticket ${ticket.ticketNumber}`, 'success');
                        }}>Call</Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  Queue is empty
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
              <CardTitle>Daily Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Served Today</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{servedToday}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">No Shows</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{noShowsToday}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transfer Modal */}
      <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title="Transfer Ticket">
        <form onSubmit={handleTransfer} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Transfer ticket <strong>{currentTicket?.ticketNumber}</strong> to another service queue. The customer will be placed back in the waiting list for the new service.
          </p>
          <Select
            label="Target Service"
            value={transferServiceId}
            onChange={(e) => setTransferServiceId(e.target.value)}
            required
          >
            <option value="">Select a service...</option>
            {state.services.filter(s => s.id !== service?.id && s.active).map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsTransferModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="warning">Transfer Ticket</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
