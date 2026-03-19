import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useQueue } from '../../../hooks/useQueue';
import { useToast } from '../../../components/ui/Toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';

export default function CounterSettings() {
  const { state, dispatch } = useQueue();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCounter, setEditingCounter] = useState(null);
  const [formData, setFormData] = useState({ name: '', serviceId: '', status: 'closed' });

  const handleOpenModal = (counter = null) => {
    if (counter) {
      setEditingCounter(counter);
      setFormData(counter);
    } else {
      setEditingCounter(null);
      setFormData({ name: '', serviceId: state.services[0]?.id || '', status: 'closed' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCounter) {
      dispatch({ type: 'UPDATE_COUNTER', payload: { ...formData, id: editingCounter.id } });
      addToast('Counter updated', 'success');
    } else {
      dispatch({ type: 'ADD_COUNTER', payload: { ...formData, id: `C${Date.now()}` } });
      addToast('Counter added', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this counter?')) {
      dispatch({ type: 'DELETE_COUNTER', payload: id });
      addToast('Counter deleted', 'success');
    }
  };

  const getServiceName = (id) => state.services.find(s => s.id === id)?.name || 'Unknown';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Counters</CardTitle>
        <Button size="sm" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Counter
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Counter Name</TableHead>
              <TableHead>Assigned Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.counters.map((counter) => (
              <TableRow key={counter.id}>
                <TableCell className="font-medium">{counter.name}</TableCell>
                <TableCell>{getServiceName(counter.serviceId)}</TableCell>
                <TableCell>
                  <Badge variant={counter.status === 'open' ? 'success' : counter.status === 'break' ? 'warning' : 'default'}>
                    {counter.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenModal(counter)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(counter.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCounter ? 'Edit Counter' : 'Add Counter'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Counter Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Counter 1" />
            <Select label="Assigned Service" value={formData.serviceId} onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })} required>
              {state.services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Select label="Initial Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} required>
              <option value="open">Open</option>
              <option value="break">Break</option>
              <option value="closed">Closed</option>
            </Select>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Counter</Button>
            </div>
          </form>
        </Modal>
      </CardContent>
    </Card>
  );
}
