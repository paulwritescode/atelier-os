
import React, { useState } from 'react';
import { User, Mail, Phone, Ruler, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Canvas {
  id: string;
  title: string;
  clientName: string;
  status: 'Draft' | 'In Progress' | 'Completed';
  lastModified: string;
  createdAt: string;
  previewImage: string;
  content: string;
}

interface ClientInfoPanelProps {
  canvas?: Canvas;
}

export const ClientInfoPanel: React.FC<ClientInfoPanelProps> = ({ canvas }) => {
  const [clientData, setClientData] = useState({
    name: canvas?.clientName || '',
    email: '',
    phone: '',
    measurements: {
      chest: '',
      waist: '',
      hips: '',
      height: '',
      weight: ''
    },
    preferences: '',
    budget: '',
    deadline: '',
    specialRequirements: ''
  });

  const handleMeasurementChange = (field: string, value: string) => {
    setClientData({
      ...clientData,
      measurements: { ...clientData.measurements, [field]: value }
    });
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl p-6 space-y-8">
      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
            <Input
              value={clientData.name}
              onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
              placeholder="Client's full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <Input
              type="email"
              value={clientData.email}
              onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
              placeholder="client@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
            <Input
              type="tel"
              value={clientData.phone}
              onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Budget</label>
            <Input
              value={clientData.budget}
              onChange={(e) => setClientData({ ...clientData, budget: e.target.value })}
              placeholder="$500 - $1000"
            />
          </div>
        </div>
      </div>

      {/* Measurements */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <Ruler className="w-5 h-5 mr-2" />
          Measurements
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Chest (in)</label>
            <Input
              value={clientData.measurements.chest}
              onChange={(e) => handleMeasurementChange('chest', e.target.value)}
              placeholder="36"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Waist (in)</label>
            <Input
              value={clientData.measurements.waist}
              onChange={(e) => handleMeasurementChange('waist', e.target.value)}
              placeholder="32"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Hips (in)</label>
            <Input
              value={clientData.measurements.hips}
              onChange={(e) => handleMeasurementChange('hips', e.target.value)}
              placeholder="38"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Height (ft)</label>
            <Input
              value={clientData.measurements.height}
              onChange={(e) => handleMeasurementChange('height', e.target.value)}
              placeholder="5'8&quot;"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Weight (lbs)</label>
            <Input
              value={clientData.measurements.weight}
              onChange={(e) => handleMeasurementChange('weight', e.target.value)}
              placeholder="150"
            />
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Project Details
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Deadline</label>
            <Input
              type="date"
              value={clientData.deadline}
              onChange={(e) => setClientData({ ...clientData, deadline: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Style Preferences</label>
            <Textarea
              value={clientData.preferences}
              onChange={(e) => setClientData({ ...clientData, preferences: e.target.value })}
              placeholder="Describe preferred styles, colors, materials..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Special Requirements</label>
            <Textarea
              value={clientData.specialRequirements}
              onChange={(e) => setClientData({ ...clientData, specialRequirements: e.target.value })}
              placeholder="Any special requirements, allergies, or considerations..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
