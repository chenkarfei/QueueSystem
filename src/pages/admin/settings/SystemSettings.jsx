import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useQueue } from '../../../hooks/useQueue';
import { useToast } from '../../../components/ui/Toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export default function SystemSettings() {
  const { state, dispatch } = useQueue();
  const { addToast } = useToast();
  const [formData, setFormData] = useState(state.settings);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: 'UPDATE_SETTINGS', payload: formData });
    addToast('System settings saved successfully', 'success');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="grid gap-6 sm:grid-cols-2">
            <Input 
              label="Business Name" 
              value={formData.businessName} 
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} 
              required 
            />
            <Input 
              label="Max Queue Size (per day)" 
              type="number" 
              value={formData.maxQueueSize} 
              onChange={(e) => setFormData({ ...formData, maxQueueSize: parseInt(e.target.value) })} 
              required 
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Input 
              label="Opening Time" 
              type="time" 
              value={formData.businessHours.open} 
              onChange={(e) => setFormData({ ...formData, businessHours: { ...formData.businessHours, open: e.target.value } })} 
              required 
            />
            <Input 
              label="Closing Time" 
              type="time" 
              value={formData.businessHours.close} 
              onChange={(e) => setFormData({ ...formData, businessHours: { ...formData.businessHours, close: e.target.value } })} 
              required 
            />
          </div>

          <Input 
            label="Display Board Marquee Text" 
            value={formData.marqueeText} 
            onChange={(e) => setFormData({ ...formData, marqueeText: e.target.value })} 
            required 
          />

          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Customer Queue URL</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This URL is used to generate the QR code for customers to join the queue from their mobile devices.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex-1 w-full">
                <Input 
                  value={formData.queuePageUrl} 
                  onChange={(e) => setFormData({ ...formData, queuePageUrl: e.target.value })} 
                  required 
                />
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 shrink-0">
                <QRCodeSVG value={formData.queuePageUrl} size={100} level="L" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="darkMode" 
                checked={formData.darkMode} 
                onChange={(e) => setFormData({ ...formData, darkMode: e.target.checked })} 
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
              />
              <label htmlFor="darkMode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Dark Mode (System-wide)
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit">Save Settings</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
