
import React from 'react';
import { Calendar, User, Clock, Share, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface CanvasCardProps {
  canvas: Canvas;
  viewMode: 'grid' | 'list';
  onClick: () => void;
}

const statusColors = {
  'Draft': 'bg-slate-100 text-slate-700',
  'In Progress': 'bg-yellow-100 text-yellow-700',
  'Completed': 'bg-green-100 text-green-700'
};

export const CanvasCard: React.FC<CanvasCardProps> = ({ canvas, viewMode, onClick }) => {
  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white/70 backdrop-blur-sm border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-indigo-300"
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100">
              <img 
                src={canvas.previewImage} 
                alt={canvas.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">{canvas.title}</h3>
              <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{canvas.clientName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{canvas.lastModified}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{canvas.createdAt}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[canvas.status]}`}>
              {canvas.status}
            </span>
            <Button variant="ghost" size="sm">
              <Share className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-indigo-300 hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
        <img 
          src={canvas.previewImage} 
          alt={canvas.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{canvas.title}</h3>
            <div className="flex items-center space-x-1 mt-1 text-sm text-slate-500">
              <User className="w-3 h-3" />
              <span>{canvas.clientName}</span>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[canvas.status]} ml-2`}>
            {canvas.status}
          </span>
        </div>
        
        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
          {canvas.content}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            <span>{canvas.lastModified}</span>
          </div>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Share className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
