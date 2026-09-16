export type MindmapNodeType = 'root' | 'concept' | 'subconcept' | 'example' | 'deepdive';

export interface MindmapRawNode {
  id: string;
  label: string;
  type?: MindmapNodeType;
  description?: string;
  category?: string;
  icon?: string;
  codeSnippet?: string;
  completed?: boolean;
  children?: MindmapRawNode[];
}

export interface MindmapFlowData {
  root: MindmapRawNode;
}

export interface CustomNodeData extends Record<string, unknown> {
  id: string;
  label: string;
  nodeType: MindmapNodeType;
  description?: string;
  category?: string;
  icon?: string;
  codeSnippet?: string;
  childCount?: number;
  isCollapsed?: boolean;
  depth: number;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  isCompleted?: boolean;
  onToggleCollapse?: (id: string) => void;
  onSelectNode?: (data: CustomNodeData) => void;
  onToggleComplete?: (id: string) => void;
}
