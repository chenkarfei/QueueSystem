import { useState, useMemo } from 'react';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Download, Calendar as CalendarIcon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQueue } from '../../hooks/useQueue';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';

export default function Reports() {
  const { state } = useQueue();
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });
  const [activeTab, setActiveTab] = useState('daily');

  const filteredTickets = useMemo(() => {
    const start = startOfDay(new Date(dateRange.from));
    const end = endOfDay(new Date(dateRange.to));
    return state.tickets.filter(t => {
      const ticketDate = new Date(t.issuedAt);
      return isWithinInterval(ticketDate, { start, end });
    });
  }, [state.tickets, dateRange]);

  // 1. Daily Summary Data
  const dailyData = useMemo(() => {
    const days = {};
    filteredTickets.forEach(t => {
      const dateStr = format(new Date(t.issuedAt), 'MMM dd');
      if (!days[dateStr]) {
        days[dateStr] = { date: dateStr, total: 0, served: 0, waitTimeSum: 0, serviceTimeSum: 0 };
      }
      days[dateStr].total += 1;
      if (t.status === 'served') {
        days[dateStr].served += 1;
        if (t.calledAt) days[dateStr].waitTimeSum += (new Date(t.calledAt) - new Date(t.issuedAt));
        if (t.servedAt) days[dateStr].serviceTimeSum += (new Date(t.servedAt) - new Date(t.calledAt));
      }
    });
    return Object.values(days).map(d => ({
      ...d,
      avgWait: d.served > 0 ? Math.round(d.waitTimeSum / d.served / 60000) : 0,
      avgService: d.served > 0 ? Math.round(d.serviceTimeSum / d.served / 60000) : 0,
    }));
  }, [filteredTickets]);

  // 2. Service Breakdown Data
  const serviceData = useMemo(() => {
    return state.services.map(s => {
      const serviceTickets = filteredTickets.filter(t => t.serviceId === s.id);
      const served = serviceTickets.filter(t => t.status === 'served');
      const waitTimeSum = served.reduce((acc, t) => acc + (t.calledAt ? new Date(t.calledAt) - new Date(t.issuedAt) : 0), 0);
      const serviceTimeSum = served.reduce((acc, t) => acc + (t.servedAt ? new Date(t.servedAt) - new Date(t.calledAt) : 0), 0);
      return {
        name: s.name,
        total: serviceTickets.length,
        served: served.length,
        avgWait: served.length > 0 ? Math.round(waitTimeSum / served.length / 60000) : 0,
        avgService: served.length > 0 ? Math.round(serviceTimeSum / served.length / 60000) : 0,
      };
    }).filter(d => d.total > 0);
  }, [filteredTickets, state.services]);

  // 3. Counter Performance Data
  const counterData = useMemo(() => {
    return state.counters.map(c => {
      const counterTickets = filteredTickets.filter(t => t.counterId === c.id && t.status === 'served');
      const serviceTimeSum = counterTickets.reduce((acc, t) => acc + (t.servedAt ? new Date(t.servedAt) - new Date(t.calledAt) : 0), 0);
      return {
        name: c.name,
        served: counterTickets.length,
        avgService: counterTickets.length > 0 ? Math.round(serviceTimeSum / counterTickets.length / 60000) : 0,
      };
    }).filter(d => d.served > 0);
  }, [filteredTickets, state.counters]);

  // 4. Hourly Traffic Data
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 12 }, (_, i) => ({ hour: i + 7, name: `${i + 7}:00`, total: 0 }));
    filteredTickets.forEach(t => {
      const h = new Date(t.issuedAt).getHours();
      const hourObj = hours.find(obj => obj.hour === h);
      if (hourObj) hourObj.total += 1;
    });
    return hours;
  }, [filteredTickets]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const exportCSV = (data, filename) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${dateRange.from}_to_${dateRange.to}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports & Analytics</h1>
        <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <Input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} className="h-8 text-sm" />
          <span className="text-gray-500">to</span>
          <Input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} className="h-8 text-sm" />
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        {[
          { id: 'daily', label: 'Daily Summary' },
          { id: 'service', label: 'Service Breakdown' },
          { id: 'counter', label: 'Counter Performance' },
          { id: 'hourly', label: 'Hourly Traffic' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>
            {activeTab === 'daily' && 'Daily Ticket Volume & Wait Times'}
            {activeTab === 'service' && 'Tickets by Service Category'}
            {activeTab === 'counter' && 'Tickets Served by Counter'}
            {activeTab === 'hourly' && 'Average Hourly Traffic'}
          </CardTitle>
          <Button variant="secondary" size="sm" onClick={() => {
            if (activeTab === 'daily') exportCSV(dailyData, 'daily_summary');
            if (activeTab === 'service') exportCSV(serviceData, 'service_breakdown');
            if (activeTab === 'counter') exportCSV(counterData, 'counter_performance');
            if (activeTab === 'hourly') exportCSV(hourlyData, 'hourly_traffic');
          }}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              {activeTab === 'daily' && (
                <LineChart data={dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="total" name="Total Tickets" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="avgWait" name="Avg Wait (mins)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              )}
              {activeTab === 'service' && (
                <PieChart>
                  <Pie data={serviceData} cx="50%" cy="45%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="total" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {serviceData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              )}
              {activeTab === 'counter' && (
                <BarChart data={counterData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Bar dataKey="served" name="Tickets Served" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgService" name="Avg Service Time (mins)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
              {activeTab === 'hourly' && (
                <LineChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="total" name="Tickets Issued" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Data Tables */}
          <div className="mt-8">
            {activeTab === 'daily' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total Tickets</TableHead>
                    <TableHead className="text-right">Served</TableHead>
                    <TableHead className="text-right">Avg Wait (m)</TableHead>
                    <TableHead className="text-right">Avg Service (m)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.date}</TableCell>
                      <TableCell className="text-right">{row.total}</TableCell>
                      <TableCell className="text-right">{row.served}</TableCell>
                      <TableCell className="text-right">{row.avgWait}</TableCell>
                      <TableCell className="text-right">{row.avgService}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {activeTab === 'service' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Total Tickets</TableHead>
                    <TableHead className="text-right">Served</TableHead>
                    <TableHead className="text-right">Avg Wait (m)</TableHead>
                    <TableHead className="text-right">Avg Service (m)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-right">{row.total}</TableCell>
                      <TableCell className="text-right">{row.served}</TableCell>
                      <TableCell className="text-right">{row.avgWait}</TableCell>
                      <TableCell className="text-right">{row.avgService}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {activeTab === 'counter' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Counter</TableHead>
                    <TableHead className="text-right">Served</TableHead>
                    <TableHead className="text-right">Avg Service (m)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {counterData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-right">{row.served}</TableCell>
                      <TableCell className="text-right">{row.avgService}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
