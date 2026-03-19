import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useQueue } from '../../../hooks/useQueue';
import { useToast } from '../../../components/ui/Toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';

export default function ServiceSettings() {
  const { state, dispatch } = useQueue();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({ name: '', prefix: '', maxDailyTickets: 100, active: true });

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData(service);
    } else {
      setEditingService(null);
      setFormData({ name: '', prefix: '', maxDailyTickets: 100, active: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.prefix.length !== 1 || !/^[A-Z]$/.test(formData.prefix)) {
      addToast('Prefix must be a single uppercase letter', 'error');
      return;
    }

    const isPrefixTaken = state.services.some(s => s.prefix === formData.prefix && s.id !== editingService?.id);
    if (isPrefixTaken) {
      addToast('Prefix is already in use', 'error');
      return;
    }

    if (editingService) {
      dispatch({ type: 'UPDATE_SERVICE', payload: { ...formData, id: editingService.id } });
      addToast('Service updated', 'success');
    } else {
      dispatch({ type: 'ADD_SERVICE', payload: { ...formData, id: `S${Date.now()}` } });
      addToast('Service added', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      dispatch({ type: 'DELETE_SERVICE', payload: id });
      addToast('Service deleted', 'success');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Services</CardTitle>
        <Button size="sm" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Prefix</TableHead>
              <TableHead>Max Daily</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell><Badge variant="primary">{service.prefix}</Badge></TableCell>
                <TableCell>{service.maxDailyTickets}</TableCell>
                <TableCell>
                  <Badge variant={service.active ? 'success' : 'default'}>
                    {service.active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenModal(service)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(service.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingService ? 'Edit Service' : 'Add Service'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Service Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <Input label="Prefix Letter (A-Z)" value={formData.prefix} onChange={(e) => setFormData({ ...formData, prefix: e.target.value.toUpperCase().slice(0, 1) })} required maxLength={1} />
            <Input label="Max Daily Tickets" type="number" value={formData.maxDailyTickets} onChange={(e) => setFormData({ ...formData, maxDailyTickets: parseInt(e.target.value) })} required min={1} />
            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" id="active" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Service</Button>
            </div>
          </form>
        </Modal>
      </CardContent>
    </Card>
  );
}
