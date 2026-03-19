import { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle2, UserX, Copy, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { useQueue } from '../../hooks/useQueue';
import { useToast } from '../../components/ui/Toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';

export default function Dashboard() {
  const { state } = useQueue();
  const { addToast } = useToast();
  const [now, setNow] = useState(new Date());

  // Auto-refresh for live stats
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

  // Calculate KPIs for today
  const todayTickets = state.tickets.filter(t => 
    new Date(t.issuedAt).toDateString() === now.toDateString()
  );

  const totalWaiting = todayTickets.filter(t => t.status === 'waiting').length;
  const servedToday = todayTickets.filter(t => t.status === 'served').length;
  const noShows = todayTickets.filter(t => t.status === 'no-show').length;

  // Calculate Avg Wait Time (for served tickets)
  const servedTickets = todayTickets.filter(t => t.status === 'served' && t.calledAt);
  const avgWaitMins = servedTickets.length > 0 
    ? Math.round(servedTickets.reduce((acc, t) => acc + (new Date(t.calledAt) - new Date(t.issuedAt)), 0) / servedTickets.length / 60000)
    : 0;

  // Calculate Avg Service Time
  const avgServiceMins = servedTickets.length > 0
    ? Math.round(servedTickets.reduce((acc, t) => acc + (new Date(t.servedAt) - new Date(t.calledAt)), 0) / servedTickets.length / 60000)
    : 0;

  // Chart Data: Tickets by Hour
  const hourlyData = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 8; // 8 AM to 5 PM
    const count = todayTickets.filter(t => new Date(t.issuedAt).getHours() === hour).length;
    return { name: `${hour}:00`, tickets: count };
  });

  // Chart Data: Tickets by Service
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const serviceData = state.services.map(s => ({
    name: s.name,
    value: todayTickets.filter(t => t.serviceId === s.id).length
  })).filter(d => d.value > 0);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(state.settings.queuePageUrl);
    addToast('Link copied to clipboard', 'success');
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('queue-qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'queue-qr-code.png';
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
      addToast('QR Code downloaded', 'success');
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Live data for {now.toLocaleDateString()}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Waiting</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalWaiting}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Served Today</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{servedToday}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-600 dark:text-amber-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Wait</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{avgWaitMins}m</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Service</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{avgServiceMins}m</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg text-red-600 dark:text-red-400">
              <UserX className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No Shows</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{noShows}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Traffic (Today)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="tickets" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Counter Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Counter</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Ticket</TableHead>
                    <TableHead className="text-right">Served Today</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.counters.map(counter => {
                    const service = state.services.find(s => s.id === counter.serviceId);
                    const currentTicket = state.tickets.find(t => t.status === 'serving' && t.counterId === counter.id);
                    const servedCount = todayTickets.filter(t => t.counterId === counter.id && t.status === 'served').length;
                    
                    return (
                      <TableRow key={counter.id}>
                        <TableCell className="font-medium">{counter.name}</TableCell>
                        <TableCell>{service?.name}</TableCell>
                        <TableCell>
                          <Badge variant={counter.status === 'open' ? 'success' : counter.status === 'break' ? 'warning' : 'default'}>
                            {counter.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-blue-600 dark:text-blue-400">
                          {currentTicket ? currentTicket.ticketNumber : '-'}
                        </TableCell>
                        <TableCell className="text-right">{servedCount}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px] flex items-center justify-center">
              {serviceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie
                      data={serviceData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {serviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-500 dark:text-gray-400">No data for today</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Booking QR</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <QRCodeSVG 
                  id="queue-qr-code"
                  value={state.settings.queuePageUrl} 
                  size={180} 
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Share this QR code or link with customers so they can join the queue from their phone.
              </p>
              <div className="flex w-full gap-2">
                <Button variant="secondary" className="flex-1" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button variant="primary" className="flex-1" onClick={handleDownloadQR}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
