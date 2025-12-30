
import React from 'react';
import { ViewMode } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  projectsCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, projectsCount }) => {
  const navItems = [
    { id: ViewMode.HOME, icon: 'fa-house', label: 'Home' },
    { id: ViewMode.WORKSPACE, icon: 'fa-brain', label: 'Workspace' },
    { id: ViewMode.PLAYLISTS, icon: 'fa-list-ul', label: 'My Playlists' },
    { id: ViewMode.EXPLORE, icon: 'fa-compass', label: 'Explore' },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          MindList
        </h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">Study Workspace</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              currentView === item.id
                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <i className={`fas ${item.icon} w-5`}></i>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4">
          <p className="text-xs text-slate-500 font-medium">Projects</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-300">{projectsCount} Active</span>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <i className="fas fa-folder text-slate-400 text-xs"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
