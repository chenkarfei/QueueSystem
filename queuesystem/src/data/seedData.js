import { subDays, subHours, subMinutes } from 'date-fns';

const generateHistoricalTickets = () => {
  const tickets = [];
  const now = new Date();
  
  // Generate 80 tickets for today
  for (let i = 0; i < 80; i++) {
    const serviceId = ['S1', 'S2', 'S3', 'S4', 'S5'][Math.floor(Math.random() * 5)];
    const prefix = { S1: 'A', S2: 'B', S3: 'C', S4: 'D', S5: 'E' }[serviceId];
    const statusRand = Math.random();
    let status = 'waiting';
    if (statusRand > 0.8) status = 'served';
    else if (statusRand > 0.7) status = 'no-show';
    else if (statusRand > 0.6) status = 'serving';

    const issuedAt = subMinutes(now, Math.floor(Math.random() * 300));
    const calledAt = status !== 'waiting' ? new Date(issuedAt.getTime() + Math.random() * 1800000) : null;
    const servedAt = (status === 'served' || status === 'no-show') ? new Date(calledAt.getTime() + Math.random() * 900000) : null;

    tickets.push({
      id: `T_TODAY_${i}`,
      ticketNumber: `${prefix}${(i + 1).toString().padStart(3, '0')}`,
      serviceId,
      customerName: `Customer ${i}`,
      phoneNumber: `55501${i.toString().padStart(2, '0')}`,
      status,
      issuedAt: issuedAt.toISOString(),
      calledAt: calledAt ? calledAt.toISOString() : null,
      servedAt: servedAt ? servedAt.toISOString() : null,
      counterId: status !== 'waiting' ? `C${Math.floor(Math.random() * 6) + 1}` : null,
    });
  }

  // Generate some historical data for the past 7 days
  for (let d = 1; d <= 7; d++) {
    const day = subDays(now, d);
    for (let i = 0; i < 50; i++) {
      const serviceId = ['S1', 'S2', 'S3', 'S4', 'S5'][Math.floor(Math.random() * 5)];
      const prefix = { S1: 'A', S2: 'B', S3: 'C', S4: 'D', S5: 'E' }[serviceId];
      const issuedAt = subHours(day, Math.floor(Math.random() * 8));
      const calledAt = new Date(issuedAt.getTime() + Math.random() * 1800000);
      const servedAt = new Date(calledAt.getTime() + Math.random() * 900000);
      
      tickets.push({
        id: `T_HIST_${d}_${i}`,
        ticketNumber: `${prefix}${(i + 1).toString().padStart(3, '0')}`,
        serviceId,
        customerName: `Hist Customer ${d}-${i}`,
        phoneNumber: `55502${i.toString().padStart(2, '0')}`,
        status: Math.random() > 0.1 ? 'served' : 'no-show',
        issuedAt: issuedAt.toISOString(),
        calledAt: calledAt.toISOString(),
        servedAt: servedAt.toISOString(),
        counterId: `C${Math.floor(Math.random() * 6) + 1}`,
      });
    }
  }

  return tickets;
};

export const initialData = {
  services: [
    { id: 'S1', name: 'General Enquiry', prefix: 'A', maxDailyTickets: 200, active: true },
    { id: 'S2', name: 'Account Services', prefix: 'B', maxDailyTickets: 150, active: true },
    { id: 'S3', name: 'Loan Application', prefix: 'C', maxDailyTickets: 50, active: true },
    { id: 'S4', name: 'Document Submission', prefix: 'D', maxDailyTickets: 100, active: true },
    { id: 'S5', name: 'Technical Support', prefix: 'E', maxDailyTickets: 80, active: true },
  ],
  counters: [
    { id: 'C1', name: 'Counter 1', serviceId: 'S1', status: 'open' },
    { id: 'C2', name: 'Counter 2', serviceId: 'S2', status: 'open' },
    { id: 'C3', name: 'Counter 3', serviceId: 'S3', status: 'open' },
    { id: 'C4', name: 'Counter 4', serviceId: 'S4', status: 'break' },
    { id: 'C5', name: 'Counter 5', serviceId: 'S5', status: 'closed' },
    { id: 'C6', name: 'Counter 6', serviceId: 'S1', status: 'open' },
  ],
  staff: [
    { id: 'ST1', name: 'Alice Smith', pin: '5678', counterId: 'C1', role: 'counter' },
    { id: 'ST2', name: 'Bob Johnson', pin: '5678', counterId: 'C2', role: 'counter' },
    { id: 'ST3', name: 'Carol Williams', pin: '5678', counterId: 'C3', role: 'counter' },
    { id: 'ST4', name: 'David Brown', pin: '5678', counterId: 'C4', role: 'counter' },
  ],
  tickets: [],
  settings: {
    businessName: "QueuePro",
    marqueeText: "Welcome to QueuePro — Please take a number and wait to be called.",
    businessHours: { open: "08:00", close: "17:00" },
    maxQueueSize: 500,
    queuePageUrl: window.location.origin + "/queue",
    darkMode: false,
  }
};
