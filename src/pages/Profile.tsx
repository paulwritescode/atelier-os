
import React, { useState } from 'react';
import { User, Mail, Phone, Building, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Profile = () => {
  const [userProfile, setUserProfile] = useState({
    name: 'John Smith',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    businessName: 'Smith Tailoring Co.',
    bio: 'Professional tailor with 15 years of experience in custom clothing.',
    address: '123 Fashion St, Design City, DC 12345'
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    // Save profile logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-bold">Profile</h1>
            </div>
            <Button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl p-8">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{userProfile.name}</h2>
              <p className="text-slate-600">{userProfile.businessName}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <Input
                value={userProfile.name}
                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <Input
                type="email"
                value={userProfile.email}
                onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <Input
                value={userProfile.phone}
                onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Business Name</label>
              <Input
                value={userProfile.businessName}
                onChange={(e) => setUserProfile({ ...userProfile, businessName: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
              <Input
                value={userProfile.address}
                onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
              <Textarea
                value={userProfile.bio}
                onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                disabled={!isEditing}
                rows={4}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
