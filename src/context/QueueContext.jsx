import { createContext, useReducer, useEffect, useRef } from 'react';
import { initialData } from '../data/seedData';

export const QueueContext = createContext(null);

const queueReducer = (state, action) => {
  switch (action.type) {
    case 'ISSUE_TICKET': {
      const { serviceId, name, phone } = action.payload;
      const service = state.services.find(s => s.id === serviceId);
      
      // Calculate next number for this service based on ticketNumber prefix
      const todayTickets = state.tickets.filter(t => new Date(t.issuedAt).toDateString() === new Date().toDateString());
      
      let maxNum = 0;
      todayTickets.forEach(t => {
        if (t.ticketNumber.startsWith(service.prefix)) {
          const numPart = t.ticketNumber.substring(service.prefix.length);
          if (/^\d+$/.test(numPart)) {
            const num = parseInt(numPart, 10);
            if (num > maxNum) {
              maxNum = num;
            }
          }
        }
      });
      
      const nextNum = maxNum + 1;
      const ticketNumber = `${service.prefix}${nextNum.toString().padStart(3, '0')}`;
      
      const newTicket = {
        id: Date.now().toString(),
        ticketNumber,
        serviceId,
        customerName: name,
        phoneNumber: phone,
        status: 'waiting',
        issuedAt: new Date().toISOString(),
        calledAt: null,
        servedAt: null,
        counterId: null,
      };
      
      return { ...state, tickets: [...state.tickets, newTicket] };
    }
    case 'CALL_NEXT': {
      const { counterId, serviceId } = action.payload;
      // Find longest waiting ticket for this service (prioritize transferred tickets)
      const waitingTickets = state.tickets
        .filter(t => t.status === 'waiting' && t.serviceId === serviceId)
        .sort((a, b) => {
          if (a.isTransferred && !b.isTransferred) return -1;
          if (!a.isTransferred && b.isTransferred) return 1;
          return new Date(a.issuedAt) - new Date(b.issuedAt);
        });
        
      if (waitingTickets.length === 0) return state;
      
      const ticketToCall = waitingTickets[0];
      
      const updatedTickets = state.tickets.map(t => 
        t.id === ticketToCall.id 
          ? { ...t, status: 'serving', calledAt: new Date().toISOString(), counterId }
          : t
      );
      
      const updatedCounters = state.counters.map(c => 
        c.id === counterId ? { ...c, lastCalledTicket: ticketToCall.ticketNumber } : c
      );
      
      return { ...state, tickets: updatedTickets, counters: updatedCounters };
    }
    case 'CALL_SPECIFIC_TICKET': {
      const { ticketId, counterId } = action.payload;
      const ticketToCall = state.tickets.find(t => t.id === ticketId);
      const updatedTickets = state.tickets.map(t => 
        t.id === ticketId 
          ? { ...t, status: 'serving', calledAt: new Date().toISOString(), counterId }
          : t
      );
      
      const updatedCounters = state.counters.map(c => 
        c.id === counterId ? { ...c, lastCalledTicket: ticketToCall?.ticketNumber } : c
      );
      
      return { ...state, tickets: updatedTickets, counters: updatedCounters };
    }
    case 'RECALL_TICKET': {
      const { ticketId } = action.payload;
      // Just updates the calledAt time to trigger a flash on display board
      const updatedTickets = state.tickets.map(t => 
        t.id === ticketId 
          ? { ...t, calledAt: new Date().toISOString() }
          : t
      );
      return { ...state, tickets: updatedTickets };
    }
    case 'MARK_SERVED': {
      const { ticketId } = action.payload;
      const updatedTickets = state.tickets.map(t => 
        t.id === ticketId 
          ? { ...t, status: 'served', servedAt: new Date().toISOString() }
          : t
      );
      return { ...state, tickets: updatedTickets };
    }
    case 'MARK_NOSHOW': {
      const { ticketId } = action.payload;
      const updatedTickets = state.tickets.map(t => 
        t.id === ticketId 
          ? { ...t, status: 'no-show', servedAt: new Date().toISOString() }
          : t
      );
      return { ...state, tickets: updatedTickets };
    }
    case 'TRANSFER_TICKET': {
      const { ticketId, newServiceId } = action.payload;
      const service = state.services.find(s => s.id === newServiceId);
      
      // Calculate next number for this service based on ticketNumber prefix
      const todayTickets = state.tickets.filter(t => new Date(t.issuedAt).toDateString() === new Date().toDateString());
      
      let maxNum = 0;
      todayTickets.forEach(t => {
        if (t.ticketNumber.startsWith(service.prefix)) {
          const numPart = t.ticketNumber.substring(service.prefix.length);
          if (/^\d+$/.test(numPart)) {
            const num = parseInt(numPart, 10);
            if (num > maxNum) {
              maxNum = num;
            }
          }
        }
      });
      
      const nextNum = maxNum + 1;
      const newTicketNumber = `${service.prefix}${nextNum.toString().padStart(3, '0')}`;

      const updatedTickets = state.tickets.map(t => {
        if (t.id === ticketId) {
          const previousNumbers = t.previousTicketNumbers || [];
          return { 
            ...t, 
            status: 'waiting', 
            serviceId: newServiceId, 
            counterId: null, 
            calledAt: null, 
            isTransferred: true,
            previousTicketNumbers: [...previousNumbers, t.ticketNumber],
            ticketNumber: newTicketNumber
          };
        }
        return t;
      });
      return { ...state, tickets: updatedTickets };
    }
    case 'SET_COUNTER_STATUS': {
      const { counterId, status } = action.payload;
      const updatedCounters = state.counters.map(c => 
        c.id === counterId ? { ...c, status } : c
      );
      return { ...state, counters: updatedCounters };
    }
    case 'UPDATE_SETTINGS': {
      return { ...state, settings: { ...state.settings, ...action.payload } };
    }
    // Basic CRUD for settings
    case 'ADD_SERVICE':
      return { ...state, services: [...state.services, action.payload] };
    case 'UPDATE_SERVICE':
      return { ...state, services: state.services.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_SERVICE':
      return { ...state, services: state.services.filter(s => s.id !== action.payload) };
    case 'ADD_COUNTER':
      return { ...state, counters: [...state.counters, action.payload] };
    case 'UPDATE_COUNTER':
      return { ...state, counters: state.counters.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_COUNTER':
      return { ...state, counters: state.counters.filter(c => c.id !== action.payload) };
    case 'ADD_STAFF':
      return { ...state, staff: [...state.staff, action.payload] };
    case 'UPDATE_STAFF':
      return { ...state, staff: state.staff.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_STAFF':
      return { ...state, staff: state.staff.filter(s => s.id !== action.payload) };
    case 'SYNC_STATE':
      return action.payload;
    default:
      return state;
  }
};

export const QueueProvider = ({ children }) => {
  const [state, dispatch] = useReducer(queueReducer, initialData, (initial) => {
    const saved = localStorage.getItem('qms_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Filter out dummy tickets generated by seed data and auto-simulation
      parsed.tickets = parsed.tickets.filter(t => 
        !t.customerName.startsWith('Customer ') && 
        !t.customerName.startsWith('Hist Customer ')
      );
      return parsed;
    }
    return initial;
  });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Use BroadcastChannel for more reliable cross-tab sync
  useEffect(() => {
    const channel = new BroadcastChannel('qms_sync');
    
    const handleMessage = (event) => {
      if (event.data?.type === 'SYNC_STATE') {
        // Only sync if the received state is different to avoid loops
        if (JSON.stringify(event.data.payload) !== JSON.stringify(stateRef.current)) {
          dispatch({ type: 'SYNC_STATE', payload: event.data.payload });
        }
      }
    };

    channel.onmessage = handleMessage;

    return () => channel.close();
  }, []);

  // Broadcast state changes to other tabs
  useEffect(() => {
    localStorage.setItem('qms_data', JSON.stringify(state));
    const channel = new BroadcastChannel('qms_sync');
    channel.postMessage({ type: 'SYNC_STATE', payload: state });
    channel.close();
  }, [state]);

  return (
    <QueueContext.Provider value={{ state, dispatch }}>
      {children}
    </QueueContext.Provider>
  );
};
