
import React, { useState } from 'react';
import { X, Mail, Link, Copy, Calendar, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvas?: Canvas;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, canvas }) => {
  const [shareMethod, setShareMethod] = useState<'email' | 'link'>('email');
  const [emailData, setEmailData] = useState({
    to: '',
    subject: `Canvas: ${canvas?.title || 'Untitled'}`,
    message: `Hi ${canvas?.clientName || 'there'},\n\nI've prepared your project canvas for review. Please take a look and let me know if you have any questions or feedback.\n\nBest regards`
  });
  const [linkSettings, setLinkSettings] = useState({
    password: '',
    expiresIn: '7',
    allowComments: true
  });

  const shareUrl = `https://canvas-manager.app/shared/${canvas?.id || 'demo'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    // In a real app, you'd show a toast notification here
  };

  const handleSendEmail = () => {
    // In a real app, you'd send the email via your backend
    console.log('Sending email:', emailData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Share Canvas</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Share Method Toggle */}
          <div className="flex space-x-1 bg-slate-100 rounded-lg p-1">
            <Button
              variant={shareMethod === 'email' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setShareMethod('email')}
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button
              variant={shareMethod === 'link' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setShareMethod('link')}
              className="flex-1"
            >
              <Link className="w-4 h-4 mr-2" />
              Link
            </Button>
          </div>

          {shareMethod === 'email' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Send to
                </label>
                <Input
                  type="email"
                  value={emailData.to}
                  onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                  placeholder="client@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Subject
                </label>
                <Input
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Message
                </label>
                <Textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSendEmail}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Shareable Link
                </label>
                <div className="flex space-x-2">
                  <Input value={shareUrl} readOnly className="flex-1" />
                  <Button onClick={handleCopyLink} variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Password (optional)
                </label>
                <Input
                  type="password"
                  value={linkSettings.password}
                  onChange={(e) => setLinkSettings({ ...linkSettings, password: e.target.value })}
                  placeholder="Set a password for extra security"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Link expires in
                </label>
                <select
                  value={linkSettings.expiresIn}
                  onChange={(e) => setLinkSettings({ ...linkSettings, expiresIn: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="1">1 day</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="never">Never</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowComments"
                  checked={linkSettings.allowComments}
                  onChange={(e) => setLinkSettings({ ...linkSettings, allowComments: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <label htmlFor="allowComments" className="text-sm text-slate-700">
                  Allow client to add comments
                </label>
              </div>

              <Button 
                onClick={handleCopyLink}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
