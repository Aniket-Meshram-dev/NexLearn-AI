'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './mindmap.css';

import { parseMindmapData } from './parser';
import { calculateBalancedLayout } from './layoutEngine';
import { MindmapCustomNode } from './MindmapNodes';
import MindmapToolbar from './MindmapToolbar';
import ConceptDetailDrawer from './ConceptDetailDrawer';
import { MindmapRawNode, CustomNodeData } from './types';

const nodeTypes = {
  mindmapNode: MindmapCustomNode,
};

interface MindmapFlowProps {
  data: any;
  moduleTitle: string;
  courseTitle?: string;
  moduleId?: string;
  onJumpToNotes?: () => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

function MindmapCanvas({
  data,
  moduleTitle,
  courseTitle,
  moduleId,
  onJumpToNotes,
  onRegenerate,
  isRegenerating = false,
}: MindmapFlowProps) {
  const { zoomIn, zoomOut, fitView, setCenter, zoomTo } = useReactFlow();

  // 1. Parse raw data into hierarchical tree
  const rawTree = useMemo(() => {
    return parseMindmapData(data, moduleTitle);
  }, [data, moduleTitle]);

  // 2. Interaction state: progressive disclosure
  // Collapse nodes at depth >= 1 so the mind map initially opens in clean core overview
  // with Central Module and Core Concepts prominent, without overwhelming edge cutoff.
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    function traverse(node: MindmapRawNode, depth: number) {
      if (depth >= 1 && node.children && node.children.length > 0) {
        ids.add(node.id);
      }
      if (node.children) {
        node.children.forEach((c) => traverse(c, depth + 1));
      }
    }
    traverse(rawTree, 0);
    return ids;
  });

  const lastTreeIdRef = useRef(rawTree.id);
  useEffect(() => {
    if (lastTreeIdRef.current !== rawTree.id) {
      lastTreeIdRef.current = rawTree.id;
      const ids = new Set<string>();
      function traverse(node: MindmapRawNode, depth: number) {
        if (depth >= 1 && node.children && node.children.length > 0) {
          ids.add(node.id);
        }
        if (node.children) {
          node.children.forEach((c) => traverse(c, depth + 1));
        }
      }
      traverse(rawTree, 0);
      setCollapsedIds(ids);
    }
  }, [rawTree]);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<CustomNodeData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3. User mastery state persisted in localStorage
  const storageKey = `icm_mastered_nodes_${moduleId || moduleTitle}`;
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleCompleteNode = useCallback(
    (nodeId: string) => {
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (next.has(nodeId)) {
          next.delete(nodeId);
        } else {
          next.add(nodeId);
        }
        try {
          localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [storageKey]
  );

  // 4. Map parent-child and ancestor relationships for instant branch traversal
  const { nodeMap, parentMap, allNodeIds } = useMemo(() => {
    const nMap = new Map<string, MindmapRawNode>();
    const pMap = new Map<string, string>();
    const allIds: string[] = [];

    function traverse(curr: MindmapRawNode, parentId?: string) {
      nMap.set(curr.id, curr);
      allIds.push(curr.id);
      if (parentId) pMap.set(curr.id, parentId);

      if (curr.children) {
        for (const child of curr.children) {
          traverse(child, curr.id);
        }
      }
    }

    traverse(rawTree);
    return { nodeMap: nMap, parentMap: pMap, allNodeIds: allIds };
  }, [rawTree]);

  // 5. Compute Branch Highlights: when hovered or searched
  const highlightedBranchNodeIds = useMemo(() => {
    // Search query active
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const matching = new Set<string>();

      allNodeIds.forEach((id) => {
        const node = nodeMap.get(id);
        if (
          node &&
          (node.label.toLowerCase().includes(q) ||
            (node.description && node.description.toLowerCase().includes(q)) ||
            (node.category && node.category.toLowerCase().includes(q)))
        ) {
          matching.add(id);
          // Also add ancestors of matching node so path from root is illuminated
          let p = parentMap.get(id);
          while (p) {
            matching.add(p);
            p = parentMap.get(p);
          }
        }
      });

      return matching.size > 0 ? matching : undefined;
    }

    // Hovered node active: trace entire ancestor branch up to root + immediate descendants
    if (hoveredNodeId) {
      const branch = new Set<string>();
      branch.add(hoveredNodeId);

      // Add ancestors up to root
      let p = parentMap.get(hoveredNodeId);
      while (p) {
        branch.add(p);
        p = parentMap.get(p);
      }

      // Add all descendants of hovered node
      function addDescendants(id: string) {
        const n = nodeMap.get(id);
        if (n && n.children) {
          for (const c of n.children) {
            branch.add(c.id);
            addDescendants(c.id);
          }
        }
      }
      addDescendants(hoveredNodeId);

      return branch;
    }

    return undefined;
  }, [hoveredNodeId, searchQuery, nodeMap, parentMap, allNodeIds]);

  // 6. Toggle collapse for a single node
  const toggleCollapse = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // 7. Toggle collapse/expand all
  const allCollapsed = useMemo(() => {
    const branchNodesWithChildren = allNodeIds.filter((id) => {
      const n = nodeMap.get(id);
      return n && n.children && n.children.length > 0 && n.type !== 'root';
    });
    if (branchNodesWithChildren.length === 0) return false;
    return branchNodesWithChildren.every((id) => collapsedIds.has(id));
  }, [allNodeIds, nodeMap, collapsedIds]);

  const toggleCollapseAll = useCallback(() => {
    if (allCollapsed) {
      // Expand all
      setCollapsedIds(new Set());
    } else {
      // Collapse all level 1 concepts
      const toCollapse = new Set<string>();
      allNodeIds.forEach((id) => {
        const n = nodeMap.get(id);
        if (n && n.children && n.children.length > 0 && n.type !== 'root') {
          toCollapse.add(id);
        }
      });
      setCollapsedIds(toCollapse);
    }
  }, [allCollapsed, allNodeIds, nodeMap]);

  // 8. Node selection for detail drawer
  const handleSelectNode = useCallback((nodeData: CustomNodeData) => {
    setSelectedNode(nodeData);
  }, []);

  // 9. Calculate positioned nodes and edges
  const { nodes, edges } = useMemo(() => {
    const layout = calculateBalancedLayout(
      rawTree,
      collapsedIds,
      highlightedBranchNodeIds,
      selectedNode?.id,
      completedIds
    );

    // Inject handlers into node data
    const nodesWithHandlers = layout.nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        onToggleCollapse: toggleCollapse,
        onSelectNode: handleSelectNode,
        onToggleComplete: toggleCompleteNode,
      },
    }));

    return { nodes: nodesWithHandlers, edges: layout.edges };
  }, [
    rawTree,
    collapsedIds,
    highlightedBranchNodeIds,
    selectedNode?.id,
    completedIds,
    toggleCollapse,
    handleSelectNode,
    toggleCompleteNode,
  ]);

  // Auto fit-view on data or collapse change
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({
        padding: 0.16,
        maxZoom: 1.05,
        duration: 350,
      });
    }, 80);
    return () => clearTimeout(timer);
  }, [rawTree, collapsedIds, isFullscreen, fitView]);

  // Center camera directly onto Root node at 100% scale
  const handleFocusCenter = useCallback(() => {
    setCenter(0, 0, { zoom: 1.0, duration: 400 });
  }, [setCenter]);

  // Reset to exactly 100% zoom
  const handleResetZoom = useCallback(() => {
    zoomTo(1.0, { duration: 300 });
  }, [zoomTo]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Keyboard shortcut: Escape exits fullscreen or closes drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedNode) setSelectedNode(null);
        else if (isFullscreen) setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, isFullscreen]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Top HUD Toolbar */}
      <MindmapToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onZoomIn={() => zoomIn({ duration: 250 })}
        onZoomOut={() => zoomOut({ duration: 250 })}
        onFitView={() => fitView({ padding: 0.16, maxZoom: 1.05, duration: 300 })}
        onFocusCenter={handleFocusCenter}
        onResetZoom={handleResetZoom}
        onToggleCollapseAll={toggleCollapseAll}
        allCollapsed={allCollapsed}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onRegenerate={onRegenerate}
        isRegenerating={isRegenerating}
        totalConcepts={allNodeIds.length}
        completedConcepts={completedIds.size}
      />

      {/* Main Canvas Container */}
      <div
        ref={containerRef}
        className={`mindmap-canvas-wrapper ${isFullscreen ? 'fullscreen' : ''}`}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeMouseEnter={(_, node) => setHoveredNodeId(node.id)}
          onNodeMouseLeave={() => setHoveredNodeId(null)}
          onPaneClick={() => setSelectedNode(null)}
          minZoom={0.25}
          maxZoom={2.2}
          fitView
          fitViewOptions={{ padding: 0.16, maxZoom: 1.05 }}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            type: 'smoothstep',
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.5}
            color="var(--border-strong, #cbd5e1)"
          />
          <MiniMap
            zoomable
            pannable
            nodeStrokeWidth={3}
            nodeColor={(node) => {
              if (node.id === 'root') return '#6366f1';
              const type = (node.data as any)?.nodeType;
              if (type === 'example') return '#f59e0b';
              if (type === 'deepdive') return '#ec4899';
              return '#8b5cf6';
            }}
            position="bottom-left"
            style={{ width: 140, height: 95 }}
          />
        </ReactFlow>

        {/* Side Concept Detail Drawer */}
        <ConceptDetailDrawer
          selectedNode={selectedNode}
          onClose={() => setSelectedNode(null)}
          onToggleComplete={toggleCompleteNode}
          onJumpToNotes={onJumpToNotes}
        />
      </div>
    </div>
  );
}

export default function MindmapFlow(props: MindmapFlowProps) {
  return (
    <ReactFlowProvider>
      <MindmapCanvas {...props} />
    </ReactFlowProvider>
  );
}
