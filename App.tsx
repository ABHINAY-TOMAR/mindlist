
import React, { useState, useEffect } from 'react';
import { ViewMode, Project, Resource, MindMapNode } from './types';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Workspace from './components/Workspace';
import Explore from './components/Explore';
import { generateMindMap } from './geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.HOME);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mindlist_v2_projects');
    if (saved) setProjects(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('mindlist_v2_projects', JSON.stringify(projects));
  }, [projects]);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const handleStartStudy = async (prompt: string, files: FileList | null) => {
    setLoading(true);
    try {
      const nodes = await generateMindMap(prompt);
      const newProject: Project = {
        id: Math.random().toString(36).substr(2, 9),
        title: prompt,
        createdAt: Date.now(),
        nodes,
        drawingElements: [],
        resources: []
      };
      setProjects(prev => [newProject, ...prev]);
      setActiveProjectId(newProject.id);
      setCurrentView(ViewMode.WORKSPACE);
    } catch (error) {
      alert("Study plan generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        projectsCount={projects.length}
      />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 space-y-6">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-2xl font-bold text-white">Building your workspace...</h2>
          </div>
        ) : (
          <>
            {currentView === ViewMode.HOME && <Home onStartStudy={handleStartStudy} recentProjects={projects.slice(0, 3)} onSelectProject={(p) => { setActiveProjectId(p.id); setCurrentView(ViewMode.WORKSPACE); }} />}
            {currentView === ViewMode.WORKSPACE && activeProject && <Workspace project={activeProject} onUpdateProject={handleUpdateProject} />}
            {currentView === ViewMode.EXPLORE && <Explore />}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
