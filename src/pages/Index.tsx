
import React, { useState } from 'react';
import { Plus, Search, Filter, Grid, List, Calendar, User, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CanvasCard } from '@/components/CanvasCard';
import { CreateCanvasModal } from '@/components/CreateCanvasModal';
import { CanvasEditor } from '@/components/CanvasEditor';

const Index = () => {
  const [canvases, setCanvases] = useState([
    {
      id: '1',
      title: 'Sarah Johnson - Wedding Dress',
      clientName: 'Sarah Johnson',
      status: 'In Progress' as const,
      lastModified: '2 hours ago',
      createdAt: '2024-06-10',
      previewImage: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop',
      content: 'Wedding dress consultation with detailed measurements and style preferences...'
    },
    {
      id: '2',
      title: 'Michael Chen - Business Suit',
      clientName: 'Michael Chen',
      status: 'Draft' as const,
      lastModified: '1 day ago',
      createdAt: '2024-06-09',
      previewImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
      content: 'Custom business suit with specific fabric requirements...'
    },
    {
      id: '3',
      title: 'Emma Rodriguez - Evening Gown',
      clientName: 'Emma Rodriguez',
      status: 'Completed' as const,
      lastModified: '3 days ago',
      createdAt: '2024-06-07',
      previewImage: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop',
      content: 'Elegant evening gown for charity gala event...'
    }
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCanvas, setSelectedCanvas] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCanvases = canvases.filter(canvas => {
    const matchesSearch = canvas.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      canvas.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || canvas.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleCreateCanvas = (canvasData: any) => {
    const newCanvas = {
      id: Date.now().toString(),
      title: `${canvasData.clientName} - ${canvasData.projectType}`,
      clientName: canvasData.clientName,
      status: 'Draft' as const,
      lastModified: 'Just now',
      createdAt: new Date().toISOString().split('T')[0],
      previewImage: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop',
      content: canvasData.notes || 'New canvas created...'
    };
    setCanvases([newCanvas, ...canvases]);
    setIsCreateModalOpen(false);
  };

  if (selectedCanvas) {
    const canvas = canvases.find(c => c.id === selectedCanvas);
    return (
      <CanvasEditor
        canvas={canvas}
        onBack={() => setSelectedCanvas(null)}
        onSave={(updatedCanvas) => {
          setCanvases(canvases.map(c => c.id === selectedCanvas ? { ...c, ...updatedCanvas } : c));
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                  Canvas Manager
                </h1>
              </div>
              <div className="hidden md:flex items-center space-x-1 text-sm text-slate-500">
                <span>•</span>
                <span>{canvases.length} canvases</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Canvas
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search canvases or clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/70 backdrop-blur-sm border-slate-200"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Canvas Grid/List */}
        {filteredCanvases.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredCanvases.map((canvas) => (
              <CanvasCard
                key={canvas.id}
                canvas={canvas}
                viewMode={viewMode}
                onClick={() => setSelectedCanvas(canvas.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-12 h-12 text-indigo-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No canvases found</h3>
            <p className="text-slate-500 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? "Try adjusting your search or filters"
                : "Create your first canvas to get started with client management"
              }
            </p>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Canvas
            </Button>
          </div>
        )}
      </div>

      <CreateCanvasModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCanvas}
      />
    </div>
  );
};

export default Index;
