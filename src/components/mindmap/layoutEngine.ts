import { Node, Edge, Position } from '@xyflow/react';
import { MindmapRawNode, CustomNodeData } from './types';

export interface LayoutResult {
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
}

/**
 * Calculates a balanced, two-sided mind map layout.
 * The Root node is placed in the center (0, 0).
 * Concept branches are evenly split: half to the Right, half to the Left.
 * Subtrees expand outwards in their respective direction with zero collision.
 */
export function calculateBalancedLayout(
  root: MindmapRawNode,
  collapsedIds: Set<string> = new Set(),
  highlightedBranchNodeIds?: Set<string>,
  selectedNodeId?: string,
  completedIds: Set<string> = new Set()
): LayoutResult {
  const nodes: Node<CustomNodeData>[] = [];
  const edges: Edge[] = [];

  const NODE_WIDTH = 240;
  const ROOT_WIDTH = 280;
  const LEVEL_SPACING_X = 90; // compact horizontal gap between levels
  const SIBLING_GAP_Y = 52; // generous vertical gap between sibling nodes guaranteeing zero overlap

  // Helper to accurately measure rendered card height based on depth and content
  function getNodeCardHeight(node: MindmapRawNode, depth = 1): number {
    if (node.type === 'root' || node.id === 'root') {
      return 140;
    }
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const hasDesc = Boolean(node.description && node.description.trim().length > 0);

    if (depth === 1) {
      if (hasChildren && hasDesc) return 215;
      if (hasChildren && !hasDesc) return 175;
      if (!hasChildren && hasDesc) return 165;
      return 130;
    } else {
      if (hasChildren && hasDesc) return 195;
      if (hasChildren && !hasDesc) return 155;
      if (!hasChildren && hasDesc) return 145;
      return 115;
    }
  }

  // 1. Determine leaf height needed for subtrees (recursive)
  function getSubtreeHeight(node: MindmapRawNode, depth: number): number {
    const selfHeight = getNodeCardHeight(node, depth);

    if (collapsedIds.has(node.id) || !node.children || node.children.length === 0) {
      return selfHeight;
    }

    const childrenHeight = node.children.reduce(
      (sum, child) => sum + getSubtreeHeight(child, depth + 1),
      0
    );
    const gaps = (node.children.length - 1) * SIBLING_GAP_Y;
    return Math.max(selfHeight, childrenHeight + gaps);
  }

  // 2. Position Root node centered at (0, 0)
  const isRootHighlighted = highlightedBranchNodeIds ? highlightedBranchNodeIds.has(root.id) : false;
  nodes.push({
    id: root.id,
    type: 'mindmapNode',
    position: { x: -ROOT_WIDTH / 2, y: -60 },
    data: {
      id: root.id,
      label: root.label,
      nodeType: 'root',
      description: root.description,
      category: root.category,
      depth: 0,
      childCount: root.children?.length || 0,
      isCollapsed: collapsedIds.has(root.id),
      isHighlighted: isRootHighlighted,
      isDimmed: highlightedBranchNodeIds ? !isRootHighlighted : false,
      isCompleted: completedIds.has(root.id),
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  });

  if (collapsedIds.has(root.id) || !root.children || root.children.length === 0) {
    return { nodes, edges };
  }

  // 3. Divide primary concept branches into Right (50%) and Left (50%)
  const children = root.children;
  const rightBranches: MindmapRawNode[] = [];
  const leftBranches: MindmapRawNode[] = [];

  children.forEach((child, idx) => {
    if (idx % 2 === 0) {
      rightBranches.push(child);
    } else {
      leftBranches.push(child);
    }
  });

  // If only 1 child, place it on the right
  if (children.length === 1 && leftBranches.length === 0) {
    rightBranches.push(children[0]);
  }

  // 4. Recursive layout for each branch
  function layoutSubtree(
    node: MindmapRawNode,
    parentId: string,
    depth: number,
    direction: 'right' | 'left',
    startX: number,
    startY: number
  ): number {
    const isCollapsed = collapsedIds.has(node.id);
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const totalHeight = getSubtreeHeight(node, depth);
    const selfHeight = getNodeCardHeight(node, depth);

    // X coordinate based on direction
    const currentX = direction === 'right' ? startX : startX - NODE_WIDTH;
    // Exactly center node vertically inside its allocated subtree band
    const currentY = startY + (totalHeight - selfHeight) / 2;

    const isNodeHighlighted = highlightedBranchNodeIds ? highlightedBranchNodeIds.has(node.id) : false;
    const isEdgeHighlighted =
      highlightedBranchNodeIds &&
      highlightedBranchNodeIds.has(parentId) &&
      highlightedBranchNodeIds.has(node.id);

    nodes.push({
      id: node.id,
      type: 'mindmapNode',
      position: { x: currentX, y: currentY },
      data: {
        id: node.id,
        label: node.label,
        nodeType: node.type || (depth === 1 ? 'concept' : 'subconcept'),
        description: node.description,
        category: node.category,
        codeSnippet: node.codeSnippet,
        depth,
        childCount: node.children?.length || 0,
        isCollapsed,
        isHighlighted: isNodeHighlighted,
        isDimmed: highlightedBranchNodeIds ? !isNodeHighlighted : false,
        isCompleted: completedIds.has(node.id),
      },
      sourcePosition: direction === 'right' ? Position.Right : Position.Left,
      targetPosition: direction === 'right' ? Position.Left : Position.Right,
    });

    // Create edge connecting parent to this node
    const edgeId = `e-${parentId}-${node.id}`;
    const branchColor = getBranchColor(node.category || node.type || 'concept');

    edges.push({
      id: edgeId,
      source: parentId,
      target: node.id,
      type: 'smoothstep',
      animated: isEdgeHighlighted,
      style: {
        stroke: isEdgeHighlighted
          ? 'var(--primary)'
          : isNodeHighlighted
          ? branchColor
          : 'var(--border-strong, #cbd5e1)',
        strokeWidth: isEdgeHighlighted ? 3 : 2,
        strokeDasharray: isEdgeHighlighted ? '4 4' : undefined,
        opacity: highlightedBranchNodeIds && !isEdgeHighlighted ? 0.35 : 0.85,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    });

    if (!isCollapsed && hasChildren && node.children) {
      const childrenHeight = node.children.reduce(
        (sum, child) => sum + getSubtreeHeight(child, depth + 1),
        0
      );
      const gaps = (node.children.length - 1) * SIBLING_GAP_Y;
      const childrenSpan = childrenHeight + gaps;
      let currentChildY = startY + (totalHeight - childrenSpan) / 2;
      const nextX = direction === 'right' ? currentX + NODE_WIDTH + LEVEL_SPACING_X : currentX - LEVEL_SPACING_X;

      for (const child of node.children) {
        const childHeight = getSubtreeHeight(child, depth + 1);
        layoutSubtree(child, node.id, depth + 1, direction, nextX, currentChildY);
        currentChildY += childHeight + SIBLING_GAP_Y;
      }
    }

    return totalHeight;
  }

  // 5. Layout Right side branches
  const totalRightHeight = rightBranches.reduce(
    (sum, b) => sum + getSubtreeHeight(b, 1),
    0
  ) + Math.max(0, rightBranches.length - 1) * SIBLING_GAP_Y;

  let rightY = -totalRightHeight / 2;
  const startRightX = ROOT_WIDTH / 2 + LEVEL_SPACING_X;

  for (const branch of rightBranches) {
    const h = layoutSubtree(branch, root.id, 1, 'right', startRightX, rightY);
    rightY += h + SIBLING_GAP_Y;
  }

  // 6. Layout Left side branches
  const totalLeftHeight = leftBranches.reduce(
    (sum, b) => sum + getSubtreeHeight(b, 1),
    0
  ) + Math.max(0, leftBranches.length - 1) * SIBLING_GAP_Y;

  let leftY = -totalLeftHeight / 2;
  const startLeftX = -ROOT_WIDTH / 2 - LEVEL_SPACING_X;

  for (const branch of leftBranches) {
    const h = layoutSubtree(branch, root.id, 1, 'left', startLeftX, leftY);
    leftY += h + SIBLING_GAP_Y;
  }

  return { nodes, edges };
}

/**
 * Returns dynamic theme accent colors for branches.
 */
function getBranchColor(category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes('theory') || cat.includes('concept')) return '#6366f1'; // Indigo
  if (cat.includes('mechanic') || cat.includes('arch') || cat.includes('deep')) return '#8b5cf6'; // Violet
  if (cat.includes('implement') || cat.includes('code') || cat.includes('example')) return '#f59e0b'; // Amber
  if (cat.includes('gotcha') || cat.includes('resilience') || cat.includes('edge')) return '#ec4899'; // Pink/Rose
  return '#3b82f6'; // Blue
}
