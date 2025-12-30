
export interface MindMapNode {
  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
  children: string[]; 
  assets: NodeAsset[];
  notes?: string;
  script?: string;
}

export interface NodeAsset {
  id: string;
  type: 'video' | 'image' | 'infographic';
  url: string;
  timestamp: number;
  prompt?: string;
}

export interface DrawingElement {
  id: string;
  type: 'pencil' | 'rect' | 'circle' | 'arrow' | 'text';
  points?: { x: number, y: number }[];
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
}

export interface Project {
  id: string;
  title: string;
  createdAt: number;
  nodes: Record<string, MindMapNode>;
  drawingElements: DrawingElement[];
  resources: Resource[];
}

export interface Resource {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'ppt' | 'image' | 'video' | 'link';
  url: string;
  content?: string; 
}

export enum ViewMode {
  HOME = 'home',
  WORKSPACE = 'workspace',
  EXPLORE = 'explore',
  PLAYLISTS = 'playlists'
}
