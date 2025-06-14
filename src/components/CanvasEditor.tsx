
import React, { useState } from 'react';
import { ArrowLeft, Save, Share, Upload, Type, Image, User, Calendar, Palette, Download, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ClientInfoPanel } from '@/components/ClientInfoPanel';
import { ShareModal } from '@/components/ShareModal';
import { exportToPDF } from '@/utils/pdfExport';

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

interface CanvasEditorProps {
  canvas?: Canvas;
  onBack: () => void;
  onSave: (canvas: any) => void;
}

interface TextSection {
  id: string;
  heading: string;
  content: string;
}

interface SavedSection {
  id: string;
  heading: string;
  content: string;
  savedAt: string;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({ canvas, onBack, onSave }) => {
  const [title, setTitle] = useState(canvas?.title || '');
  const [content, setContent] = useState(canvas?.content || '');
  const [activeTab, setActiveTab] = useState<'canvas' | 'client'>('canvas');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [textSections, setTextSections] = useState<TextSection[]>([]);
  const [savedSections, setSavedSections] = useState<SavedSection[]>([]);
  const [comments, setComments] = useState<Array<{id: string, text: string, author: string, timestamp: string}>>([]);

  const ownerName = "John Smith"; // This would come from user context

  const handleSave = () => {
    onSave({
      title,
      content,
      lastModified: 'Just now',
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(() => 
        'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=200&fit=crop'
      );
      setImages([...images, ...newImages]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const newImages = Array.from(files).map(() => 
        'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=200&fit=crop'
      );
      setImages([...images, ...newImages]);
    }
  };

  const addTextSection = () => {
    const newSection: TextSection = {
      id: Date.now().toString(),
      heading: `Section ${textSections.length + 1}`,
      content: ''
    };
    setTextSections([...textSections, newSection]);
  };

  const updateTextSection = (id: string, field: 'heading' | 'content', value: string) => {
    const updated = textSections.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    );
    setTextSections(updated);
  };

  const saveTextSection = (sectionId: string) => {
    const section = textSections.find(s => s.id === sectionId);
    if (section && section.heading && section.content) {
      const savedSection: SavedSection = {
        ...section,
        savedAt: new Date().toLocaleString()
      };
      setSavedSections([...savedSections, savedSection]);
      
      // Remove from draft sections
      setTextSections(textSections.filter(s => s.id !== sectionId));
    }
  };

  const handlePDFExport = () => {
    if (canvas) {
      exportToPDF({ ...canvas, title, content }, ownerName);
    }
  };

  const scheduleClientMeeting = () => {
    // Implementation for scheduling meetings
    alert('Meeting scheduling feature would be integrated with calendar apps');
  };

  const addComment = (commentText: string) => {
    const newComment = {
      id: Date.now().toString(),
      text: commentText,
      author: 'Client',
      timestamp: new Date().toISOString()
    };
    setComments([...comments, newComment]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="h-4 w-px bg-slate-300" />
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold bg-transparent border-none focus:ring-0 p-0 h-auto"
                placeholder="Canvas title..."
              />
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={handlePDFExport}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsShareModalOpen(true)}>
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button size="sm" onClick={handleSave} className="bg-gradient-to-r from-indigo-500 to-purple-600">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Main Canvas Area */}
          <div className="flex-1">
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6">
              <Button
                variant={activeTab === 'canvas' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('canvas')}
              >
                <Palette className="w-4 h-4 mr-2" />
                Canvas
              </Button>
              <Button
                variant={activeTab === 'client' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('client')}
              >
                <User className="w-4 h-4 mr-2" />
                Client Details
              </Button>
            </div>

            {activeTab === 'canvas' ? (
              <div className="bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl p-6">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={addTextSection}>
                      <Type className="w-4 h-4 mr-2" />
                      Add Text
                    </Button>
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <div>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </div>
                      </Button>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  <div className="text-sm text-slate-500">
                    Last saved: {canvas?.lastModified || 'Never'}
                  </div>
                </div>

                {/* Canvas Content */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Project Notes & Requirements
                    </label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Add project details, measurements, material preferences, design requirements..."
                      rows={8}
                      className="w-full resize-none"
                    />
                  </div>

                  {/* Saved Sections */}
                  {savedSections.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-4">
                        Saved Canvas Sections
                      </label>
                      <div className="space-y-4">
                        {savedSections.map((section) => (
                          <div key={section.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-green-800">{section.heading}</h4>
                              <span className="text-xs text-green-600">Saved: {section.savedAt}</span>
                            </div>
                            <p className="text-green-700 text-sm">{section.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Text Sections */}
                  {textSections.map((section) => (
                    <div key={section.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Section Heading
                        </label>
                        <Input
                          value={section.heading}
                          onChange={(e) => updateTextSection(section.id, 'heading', e.target.value)}
                          placeholder="Enter section heading..."
                          className="font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Content
                        </label>
                        <Textarea
                          value={section.content}
                          onChange={(e) => updateTextSection(section.id, 'content', e.target.value)}
                          placeholder="Add text content..."
                          rows={4}
                          className="w-full resize-none"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          onClick={() => saveTextSection(section.id)}
                          disabled={!section.heading || !section.content}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save to Canvas
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Image Gallery */}
                  {images.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Reference Images
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                            <img src={image} alt={`Reference ${index + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Drag and Drop Areas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      className="p-8 border-2 border-dashed border-slate-300 rounded-lg text-center hover:border-slate-400 transition-colors cursor-pointer"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <Image className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Drop images here or click to upload</p>
                    </div>
                    <div 
                      className="p-8 border-2 border-dashed border-slate-300 rounded-lg text-center hover:border-slate-400 transition-colors cursor-pointer"
                      onClick={addTextSection}
                    >
                      <Type className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Add text section</p>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Client Comments
                    </label>
                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <div key={comment.id} className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm">{comment.author}</span>
                            <span className="text-xs text-slate-500">{new Date(comment.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                      ))}
                      {comments.length === 0 && (
                        <p className="text-sm text-slate-500 italic">No comments yet from client</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <ClientInfoPanel canvas={canvas} />
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80">
            <div className="bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="font-medium text-slate-900 mb-4">Canvas Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                      {canvas?.status || 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Created</span>
                    <span className="text-slate-900">{canvas?.createdAt || 'Today'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Last Modified</span>
                    <span className="text-slate-900">{canvas?.lastModified || 'Never'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Comments</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {comments.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Saved Sections</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      {savedSections.length}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-slate-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setIsShareModalOpen(true)}>
                    <Share className="w-4 h-4 mr-2" />
                    Share with Client
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={scheduleClientMeeting}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={handlePDFExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Export as PDF
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View Comments ({comments.length})
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        canvas={canvas}
      />
    </div>
  );
};
