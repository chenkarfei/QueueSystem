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

export default function StaffSettings() {
  const { state, dispatch } = useQueue();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({ name: '', pin: '', counterId: '', role: 'counter' });

  const handleOpenModal = (staff = null) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData(staff);
    } else {
      setEditingStaff(null);
      setFormData({ name: '', pin: '', counterId: state.counters[0]?.id || '', role: 'counter' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.pin.length !== 4 || !/^\d+$/.test(formData.pin)) {
      addToast('PIN must be exactly 4 digits', 'error');
      return;
    }

    if (editingStaff) {
      dispatch({ type: 'UPDATE_STAFF', payload: { ...formData, id: editingStaff.id } });
      addToast('Staff updated', 'success');
    } else {
      dispatch({ type: 'ADD_STAFF', payload: { ...formData, id: `ST${Date.now()}` } });
      addToast('Staff added', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      dispatch({ type: 'DELETE_STAFF', payload: id });
      addToast('Staff deleted', 'success');
    }
  };

  const getCounterName = (id) => state.counters.find(c => c.id === id)?.name || 'Unassigned';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Staff</CardTitle>
        <Button size="sm" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Assigned Counter</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.staff.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell className="font-medium">{staff.name}</TableCell>
                <TableCell><Badge variant="primary" className="capitalize">{staff.role}</Badge></TableCell>
                <TableCell>{getCounterName(staff.counterId)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenModal(staff)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(staff.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStaff ? 'Edit Staff' : 'Add Staff'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <Input label="4-Digit PIN" type="password" value={formData.pin} onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })} required maxLength={4} />
            <Select label="Role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required>
              <option value="counter">Counter Staff</option>
              <option value="admin">Administrator</option>
            </Select>
            <Select label="Assigned Counter" value={formData.counterId} onChange={(e) => setFormData({ ...formData, counterId: e.target.value })} required>
              <option value="">Unassigned</option>
              {state.counters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Staff</Button>
            </div>
          </form>
        </Modal>
      </CardContent>
    </Card>
  );
}
