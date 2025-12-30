
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Project, MindMapNode, NodeAsset, DrawingElement } from '../types';
import { generateNodeImage, generateNodeVideo, generateNodeContent } from '../geminiService';

interface WorkspaceProps {
  project: Project;
  onUpdateProject: (p: Project) => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ project, onUpdateProject }) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<'select' | 'pencil' | 'rect' | 'arrow'>('select');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [currentDrawing, setCurrentDrawing] = useState<DrawingElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  const screenToWorld = (x: number, y: number) => {
    const rect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
    return {
      x: (x - rect.left - rect.width / 2 - offset.x) / scale,
      y: (y - rect.top - rect.height / 2 - offset.y) / scale
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (tool === 'select') {
      if ((e.target as HTMLElement).closest('.node-element')) return;
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    } else {
      const pos = screenToWorld(e.clientX, e.clientY);
      const newEl: DrawingElement = {
        id: Math.random().toString(36).substr(2, 9),
        type: tool,
        x: pos.x,
        y: pos.y,
        color: '#3b82f6',
        points: tool === 'pencil' ? [{ x: pos.x, y: pos.y }] : undefined,
        width: 0,
        height: 0
      };
      setCurrentDrawing(newEl);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    } else if (currentDrawing) {
      const pos = screenToWorld(e.clientX, e.clientY);
      setCurrentDrawing(prev => {
        if (!prev) return null;
        if (prev.type === 'pencil') {
          return { ...prev, points: [...(prev.points || []), { x: pos.x, y: pos.y }] };
        } else {
          return { ...prev, width: pos.x - prev.x, height: pos.y - prev.y };
        }
      });
    }
  };

  const handleMouseUp = () => {
    if (currentDrawing) {
      onUpdateProject({ ...project, drawingElements: [...project.drawingElements, currentDrawing] });
      setCurrentDrawing(null);
    }
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      const zoom = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(prev => Math.min(Math.max(0.1, prev * zoom), 3));
    } else {
      setOffset(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  const runGeneration = async (nodeId: string, type: 'video' | 'image' | 'infographic' | 'content') => {
    // Check for API key selection if video
    if (type === 'video') {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
        // Proceeding as per rules assume success after triggering openSelectKey
      }
    }

    setIsGenerating(nodeId);
    const node = project.nodes[nodeId];
    try {
      if (type === 'content') {
        const data = await generateNodeContent(node.label, node.description);
        const updated = { ...project.nodes };
        updated[nodeId] = { ...updated[nodeId], ...data };
        onUpdateProject({ ...project, nodes: updated });
      } else {
        const url = type === 'video' ? await generateNodeVideo(node.label, node.description) : await generateNodeImage(node.label, node.description);
        if (url) {
          const updated = { ...project.nodes };
          updated[nodeId].assets = [...updated[nodeId].assets, { id: Date.now().toString(), type, url, timestamp: Date.now() }];
          onUpdateProject({ ...project, nodes: updated });
        }
      }
    } finally {
      setIsGenerating(null);
    }
  };

  const selectedNode = selectedNodeId ? project.nodes[selectedNodeId] : null;

  return (
    <div className="flex flex-1 h-full overflow-hidden bg-slate-950 relative">
      {/* Toolbar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center bg-slate-900/90 backdrop-blur border border-slate-800 p-1.5 rounded-2xl shadow-2xl z-50">
        {[
          { id: 'select', icon: 'fa-mouse-pointer' },
          { id: 'pencil', icon: 'fa-pencil-alt' },
          { id: 'rect', icon: 'fa-square' },
          { id: 'arrow', icon: 'fa-arrow-right' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTool(t.id as any)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${tool === t.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className={`fas ${t.icon}`}></i>
          </button>
        ))}
      </div>

      {/* Infinite Canvas */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: tool === 'select' ? (isDragging ? 'grabbing' : 'grab') : 'crosshair' }}
      >
        <svg className="absolute inset-0 pointer-events-none w-full h-full">
          <g transform={`translate(${containerRef.current?.offsetWidth! / 2 + offset.x}, ${containerRef.current?.offsetHeight! / 2 + offset.y}) scale(${scale})`}>
            {/* Connections - Cast Object.values to MindMapNode[] to fix type errors */}
            {(Object.values(project.nodes) as MindMapNode[]).flatMap(n => n.children.map(cid => {
              const child = project.nodes[cid];
              if (!child) return null;
              return <line key={`${n.id}-${cid}`} x1={n.x} y1={n.y} x2={child.x} y2={child.y} stroke="#334155" strokeWidth={2 / scale} strokeDasharray="5,5" />;
            }))}

            {/* Drawings */}
            {[...project.drawingElements, ...(currentDrawing ? [currentDrawing] : [])].map(el => {
              if (el.type === 'pencil' && el.points) {
                const d = el.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                return <path key={el.id} d={d} fill="none" stroke={el.color} strokeWidth={3 / scale} strokeLinecap="round" />;
              }
              if (el.type === 'rect') {
                return <rect key={el.id} x={el.x} y={el.y} width={el.width} height={el.height} fill="none" stroke={el.color} strokeWidth={3 / scale} />;
              }
              if (el.type === 'arrow') {
                return <line key={el.id} x1={el.x} y1={el.y} x2={el.x + (el.width || 0)} y2={el.y + (el.height || 0)} stroke={el.color} strokeWidth={3 / scale} />;
              }
              return null;
            })}
          </g>
        </svg>

        {/* Node Components - Cast Object.values to MindMapNode[] to fix type errors */}
        {(Object.values(project.nodes) as MindMapNode[]).map(node => (
          <div
            key={node.id}
            className={`node-element absolute p-4 rounded-2xl shadow-xl border-2 transition-all ${selectedNodeId === node.id ? 'border-blue-500 bg-slate-800 scale-105 z-40' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}
            style={{
              left: `calc(50% + ${node.x * scale}px + ${offset.x}px)`,
              top: `calc(50% + ${node.y * scale}px + ${offset.y}px)`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              width: '280px'
            }}
            onClick={(e) => { e.stopPropagation(); setSelectedNodeId(node.id); }}
          >
            <h4 className="font-bold text-white text-sm mb-1">{node.label}</h4>
            <p className="text-slate-500 text-[10px] line-clamp-2 mb-3">{node.description}</p>
            <div className="flex gap-2">
              <button onClick={() => runGeneration(node.id, 'video')} className="flex-1 py-1.5 bg-slate-800 rounded-lg text-[9px] font-bold text-slate-300 hover:bg-slate-750">
                <i className="fas fa-video mr-1"></i> VIDEO
              </button>
              <button onClick={() => runGeneration(node.id, 'content')} className="flex-1 py-1.5 bg-blue-600 rounded-lg text-[9px] font-bold text-white hover:bg-blue-500">
                <i className="fas fa-brain mr-1"></i> LEARN
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Right Sidebar - Selection Context */}
      <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full z-50">
        <div className="p-6 border-b border-slate-800">
          <h2 className="font-bold text-lg text-white">Study Inspector</h2>
          <p className="text-slate-500 text-xs">Dive deep into selected concepts</p>
        </div>

        {selectedNode ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <section>
              <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4">Study Notes</h3>
              {selectedNode.notes ? (
                <div className="prose prose-invert prose-xs text-slate-300 bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                  {selectedNode.notes}
                </div>
              ) : (
                <button onClick={() => runGeneration(selectedNode.id, 'content')} className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-slate-600 hover:text-slate-400 hover:border-slate-700 transition-all text-xs">
                  Generate Study Notes
                </button>
              )}
            </section>

            <section>
              <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4">Node Assets</h3>
              <div className="grid grid-cols-1 gap-4">
                {selectedNode.assets.map(asset => (
                  <div key={asset.id} className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-800/50">
                    {asset.type === 'video' ? <video src={asset.url} controls className="w-full aspect-video" /> : <img src={asset.url} className="w-full" />}
                  </div>
                ))}
              </div>
            </section>

            {selectedNode.script && (
              <section>
                <h3 className="text-xs font-black text-purple-500 uppercase tracking-widest mb-4">Video Script</h3>
                <div className="text-[11px] font-mono p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 italic">
                  {selectedNode.script}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-600 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
              <i className="fas fa-hand-pointer text-xl"></i>
            </div>
            <p className="text-sm">Select a node to inspect its materials, notes, and generated media.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workspace;
