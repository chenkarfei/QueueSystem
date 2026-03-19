import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Search, Filter, Eye } from 'lucide-react';
import { useQueue } from '../../hooks/useQueue';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

export default function QueueMonitor() {
  const { state } = useQueue();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const itemsPerPage = 20;

  const filteredTickets = useMemo(() => {
    return state.tickets
      .filter(t => {
        const matchesSearch = t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              t.customerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesService = filterService === 'all' || t.serviceId === filterService;
        const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
        const matchesDate = !filterDate || t.issuedAt.startsWith(filterDate);
        return matchesSearch && matchesService && matchesStatus && matchesDate;
      })
      .sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
  }, [state.tickets, searchTerm, filterService, filterStatus, filterDate]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getServiceName = (id) => state.services.find(s => s.id === id)?.name || id;
  const getCounterName = (id) => state.counters.find(c => c.id === id)?.name || id;

  const calculateWaitTime = (ticket) => {
    if (!ticket.calledAt) return '-';
    const waitMins = Math.round((new Date(ticket.calledAt) - new Date(ticket.issuedAt)) / 60000);
    return `${waitMins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Queue Monitor</h1>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search ticket or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-40 shrink-0"
              />
              <Select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="w-40 shrink-0">
                <option value="all">All Services</option>
                {state.services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-40 shrink-0">
                <option value="all">All Statuses</option>
                <option value="waiting">Waiting</option>
                <option value="serving">Serving</option>
                <option value="served">Served</option>
                <option value="no-show">No Show</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket No</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Wait Time</TableHead>
                <TableHead>Counter</TableHead>
                <TableHead>Time Issued</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTickets.length > 0 ? (
                paginatedTickets.map(ticket => (
                  <TableRow key={ticket.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" onClick={() => setSelectedTicket(ticket)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-600 dark:text-blue-400">{ticket.ticketNumber}</span>
                        {ticket.isTransferred && (
                          <Badge variant="warning" className="text-[10px] px-1.5 py-0">Transferred</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getServiceName(ticket.serviceId)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{ticket.customerName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.phoneNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ticket.status} className="capitalize">{ticket.status.replace('-', ' ')}</Badge>
                    </TableCell>
                    <TableCell>{calculateWaitTime(ticket)}</TableCell>
                    <TableCell>{ticket.counterId ? getCounterName(ticket.counterId) : '-'}</TableCell>
                    <TableCell className="text-gray-500 dark:text-gray-400">
                      {format(new Date(ticket.issuedAt), 'HH:mm:ss')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-gray-500 dark:text-gray-400">
                    No tickets found matching the filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTickets.length)} of {filteredTickets.length} entries
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                  Previous
                </Button>
                <Button variant="secondary" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail Modal */}
      <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title="Ticket Details">
        {selectedTicket && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-4xl font-black text-blue-600 dark:text-blue-400">{selectedTicket.ticketNumber}</h2>
              <Badge variant={selectedTicket.status} className="text-sm px-3 py-1 capitalize">
                {selectedTicket.status.replace('-', ' ')}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customer Name</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{selectedTicket.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{selectedTicket.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Service</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{getServiceName(selectedTicket.serviceId)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Counter</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{selectedTicket.counterId ? getCounterName(selectedTicket.counterId) : '-'}</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Issued At</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{format(new Date(selectedTicket.issuedAt), 'HH:mm:ss')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Called At</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{selectedTicket.calledAt ? format(new Date(selectedTicket.calledAt), 'HH:mm:ss') : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Served At</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{selectedTicket.servedAt ? format(new Date(selectedTicket.servedAt), 'HH:mm:ss') : '-'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
