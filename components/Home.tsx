
import React, { useState } from 'react';
import { Project } from '../types';

interface HomeProps {
  onStartStudy: (prompt: string, files: FileList | null) => void;
  recentProjects: Project[];
  onSelectProject: (p: Project) => void;
}

const Home: React.FC<HomeProps> = ({ onStartStudy, recentProjects, onSelectProject }) => {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onStartStudy(prompt, files);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-8 space-y-12 max-w-6xl mx-auto">
      {/* Top Creation Section */}
      <section className="mt-12 text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-extrabold text-white">What are we studying today?</h2>
          <p className="text-slate-400 text-lg">Upload resources or describe your topic to build your workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative group">
          <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-2xl focus-within:border-blue-500/50 transition-all">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Quantum Computing Fundamentals or Photosynthesis process..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-white p-4 text-lg"
            />
            
            <div className="flex items-center gap-2 px-2">
              <label className="cursor-pointer hover:bg-slate-800 p-3 rounded-xl transition-colors text-slate-400">
                <i className="fas fa-plus-circle text-xl"></i>
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  onChange={(e) => setFiles(e.target.files)} 
                />
              </label>
              
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
              >
                Create Map
              </button>
            </div>
          </div>
          {files && files.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {/* Cast Array.from result to File[] to fix type errors */}
              {(Array.from(files) as File[]).map((f, i) => (
                <span key={i} className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
                  <i className="fas fa-file-alt mr-1"></i> {f.name}
                </span>
              ))}
            </div>
          )}
        </form>
      </section>

      {/* Middle: Recent Projects */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-100">Resume Recent Projects</h3>
          <button className="text-blue-400 text-sm font-medium hover:underline">View All</button>
        </div>
        
        {recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="group bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left hover:border-slate-700 transition-all hover:shadow-xl"
              >
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <i className="fas fa-project-diagram text-indigo-400"></i>
                </div>
                <h4 className="font-bold text-slate-200 text-lg line-clamp-1">{project.title}</h4>
                <p className="text-slate-500 text-sm mt-1">Created {new Date(project.createdAt).toLocaleDateString()}</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">
                    {Object.keys(project.nodes).length} Nodes
                  </span>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">
                    {project.resources.length} Resources
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-600">
            <i className="fas fa-folder-open text-3xl mb-2"></i>
            <p>No projects yet. Start by describing a topic above!</p>
          </div>
        )}
      </section>

      {/* Bottom: Explore Teaser */}
      <section className="space-y-6 pb-12">
        <h3 className="text-xl font-bold text-slate-100">Explore Educational Playlists</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: "Neuroscience 101", author: "Dr. Brain", color: "bg-purple-900/20" },
            { title: "Economic Models", author: "MarketWatch", color: "bg-green-900/20" },
            { title: "Astrophysics", author: "Cosmos Academy", color: "bg-blue-900/20" },
            { title: "Web Dev Roadmap", author: "Stack Masters", color: "bg-orange-900/20" },
          ].map((item, i) => (
            <div key={i} className={`aspect-video rounded-2xl ${item.color} border border-slate-800 flex flex-col justify-end p-4 hover:scale-[1.02] cursor-pointer transition-transform`}>
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                   <i className="fas fa-play text-[8px] text-white"></i>
                </div>
                <p className="text-xs text-slate-400">{item.author}</p>
              </div>
              <h4 className="text-white font-bold text-sm truncate">{item.title}</h4>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
