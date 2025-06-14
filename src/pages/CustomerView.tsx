import React, { useState } from 'react';
import { MessageSquare, User, Calendar, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CustomerView = () => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Array<{id: string, text: string, author: string, timestamp: string}>>([
    {
      id: '1',
      text: 'I love the design concept! Could we make the sleeves a bit longer?',
      author: 'Sarah Johnson',
      timestamp: '2024-06-14T10:30:00Z'
    },
    {
      id: '2', 
      text: 'The color palette looks perfect. When can we schedule a fitting?',
      author: 'Sarah Johnson',
      timestamp: '2024-06-14T11:15:00Z'
    }
  ]);

  // Mock canvas data
  const canvas = {
    title: 'Sarah Johnson - Wedding Dress',
    clientName: 'Sarah Johnson',
    status: 'In Progress',
    content: 'Custom wedding dress with detailed measurements and style preferences. Looking for an elegant A-line silhouette with lace details.',
    pricing: {
      baseCost: 800,
      materialCost: 200,
      laborCost: 400,
      totalCost: 1400
    }
  };

  const savedSections = [
    {
      id: '1',
      heading: 'Design Specifications',
      content: 'A-line silhouette with sweetheart neckline, chapel train, French lace overlay with pearl beading.',
      savedAt: '2024-06-14 09:30 AM'
    },
    {
      id: '2',
      heading: 'Fabric Details',
      content: 'Ivory silk mikado base with Alençon lace overlay. Covered buttons along the back.',
      savedAt: '2024-06-14 10:15 AM'
    }
  ];

  const addComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        text: newComment,
        author: canvas.clientName,
        timestamp: new Date().toISOString()
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">{canvas.title}</h1>
                <p className="text-sm text-slate-500">Client View</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {canvas.status}
              </span>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-700">{canvas.clientName}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
                <CardDescription>Details about your custom project</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">{canvas.content}</p>
              </CardContent>
            </Card>

            {/* Saved Sections */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Finalized specifications and requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {savedSections.map((section) => (
                  <div key={section.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-green-800">{section.heading}</h4>
                      <span className="text-xs text-green-600">Added: {section.savedAt}</span>
                    </div>
                    <p className="text-green-700 text-sm">{section.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Comments & Feedback
                </CardTitle>
                <CardDescription>Share your thoughts and feedback</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Comments */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm text-blue-800">{comment.author}</span>
                        <span className="text-xs text-blue-600">
                          {new Date(comment.timestamp).toLocaleDateString()} at {new Date(comment.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">{comment.text}</p>
                    </div>
                  ))}
                </div>

                {/* Add New Comment */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Add a comment
                  </label>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your feedback, questions, or suggestions..."
                    rows={3}
                    className="w-full resize-none mb-3"
                  />
                  <Button 
                    onClick={addComment}
                    disabled={!newComment.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Post Comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {canvas.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Comments</span>
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
                    {comments.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Project Sections</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    {savedSections.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Project Pricing</CardTitle>
                <CardDescription>Cost breakdown for your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Base Cost</span>
                  <span className="font-medium">${canvas.pricing.baseCost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Materials</span>
                  <span className="font-medium">${canvas.pricing.materialCost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Labor</span>
                  <span className="font-medium">${canvas.pricing.laborCost}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-slate-900">Total Cost</span>
                    <span className="text-slate-900">${canvas.pricing.totalCost}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Request Meeting
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Download Details
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Designer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerView;
