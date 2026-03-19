import { useState, useEffect } from 'react';
import { useQueue } from '../../hooks/useQueue';
import { cn } from '../../components/ui/Button';

export default function DisplayBoard() {
  const { state } = useQueue();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentCalls, setRecentCalls] = useState({});

  useEffect(() => {
    if (state.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.darkMode]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Track recently called tickets to trigger animations
  useEffect(() => {
    const servingTickets = state.tickets.filter(t => t.status === 'serving');
    
    setRecentCalls(prev => {
      const newRecentCalls = { ...prev };
      let hasChanges = false;

      servingTickets.forEach(ticket => {
        if (!prev[ticket.counterId] || prev[ticket.counterId].ticketNumber !== ticket.ticketNumber || prev[ticket.counterId].calledAt !== ticket.calledAt) {
          newRecentCalls[ticket.counterId] = {
            ticketNumber: ticket.ticketNumber,
            calledAt: ticket.calledAt,
            isNew: true
          };
          hasChanges = true;
        }
      });

      if (hasChanges) {
        // Remove 'isNew' flag after animation duration
        setTimeout(() => {
          setRecentCalls(current => {
            const updated = { ...current };
            Object.keys(updated).forEach(k => {
              updated[k] = { ...updated[k], isNew: false };
            });
            return updated;
          });
        }, 3000);
        return newRecentCalls;
      }
      
      return prev;
    });
  }, [state.tickets]);

  const allCounters = state.counters;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="h-24 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-10 shadow-lg">
        <h1 className="text-4xl font-bold text-blue-500 tracking-tight">{state.settings.businessName}</h1>
        <div className="text-right">
          <div className="text-3xl font-medium tracking-wider">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-gray-400 text-lg">
            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allCounters.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-500">
              <div className="text-3xl font-bold mb-2">No Counters Configured</div>
              <p className="text-xl italic">Please add counters in the admin settings.</p>
            </div>
          ) : (
            allCounters.map(counter => {
              const servingTicket = state.tickets.find(t => t.status === 'serving' && t.counterId === counter.id);
              const displayTicketNumber = servingTicket ? servingTicket.ticketNumber : counter.lastCalledTicket;
              
              const isNew = recentCalls[counter.id]?.isNew;
              const isOpen = counter.status === 'open';

              return (
                <div 
                  key={counter.id} 
                  className={cn(
                    "bg-gray-900 rounded-3xl border-2 flex flex-col overflow-hidden transition-all duration-500 h-64",
                    isNew ? "border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)] scale-105 z-10" : 
                    isOpen ? "border-gray-800" : "border-gray-900 opacity-40 grayscale"
                  )}
                >
                  <div className={cn(
                    "py-4 text-center text-2xl font-semibold tracking-widest uppercase transition-colors duration-500",
                    isNew ? "bg-green-500 text-white" : 
                    isOpen ? "bg-gray-800 text-gray-300" : "bg-gray-900 text-gray-600"
                  )}>
                    {counter.name} {!isOpen && `(${counter.status})`}
                  </div>
                  <div className="flex-1 flex items-center justify-center p-8 relative">
                    {!isOpen ? (
                      <div className="text-3xl text-gray-700 font-bold uppercase tracking-tighter">Closed</div>
                    ) : displayTicketNumber ? (
                      <div className={cn(
                        "text-[8rem] font-black tracking-tighter leading-none transition-all duration-500",
                        isNew ? "text-green-400 scale-110" : "text-white"
                      )}>
                        {displayTicketNumber}
                      </div>
                    ) : (
                      <div className="text-4xl text-gray-600 font-medium">Available</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Marquee Footer */}
      <footer className="h-16 bg-blue-600 flex items-center overflow-hidden whitespace-nowrap">
        <div className="animate-[marquee_20s_linear_infinite] text-2xl font-medium text-white px-4">
          {state.settings.marqueeText}
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
      `}} />
    </div>
  );
}
