
import React, { useState } from 'react';
import { X, Copy, Mail, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvas?: any;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, canvas }) => {
  const [email, setEmail] = useState('');
  const [shareLink] = useState(`https://yourapp.com/canvas/${canvas?.id || 'demo'}`);

  const handleEmailShare = () => {
    // Implementation for email sharing
    console.log('Sharing via email to:', email);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Share Canvas</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Share via Email</label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
              />
              <Button onClick={handleEmailShare}>
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Share Link</label>
            <div className="flex gap-2">
              <Input value={shareLink} readOnly />
              <Button onClick={copyLink}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
