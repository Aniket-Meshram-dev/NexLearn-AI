import { MindmapRawNode, MindmapNodeType } from './types';

/**
 * Robust parser that converts structured JSON or legacy Mermaid mindmap text
 * into a clean, hierarchical MindmapRawNode tree.
 */
export function parseMindmapData(
  rawInput: any,
  fallbackTitle = 'Core Module Concepts'
): MindmapRawNode {
  if (!rawInput) {
    return generateFallbackTree(fallbackTitle);
  }

  // 1. Direct Object input
  if (typeof rawInput === 'object') {
    if (rawInput.root && typeof rawInput.root === 'object') {
      return normalizeNode(rawInput.root, 0);
    }
    if (rawInput.label || rawInput.id) {
      return normalizeNode(rawInput, 0);
    }
  }

  // 2. String input
  if (typeof rawInput === 'string') {
    const trimmed = rawInput.trim();

    // Check if it is JSON
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.root) return normalizeNode(parsed.root, 0);
        if (parsed.label || parsed.id) return normalizeNode(parsed, 0);
      } catch {
        // Fall through to Mermaid parsing
      }
    }

    // Check if it is a Mermaid Mindmap diagram
    if (trimmed.toLowerCase().includes('mindmap')) {
      const mermaidTree = parseMermaidMindmap(trimmed, fallbackTitle);
      if (mermaidTree) return mermaidTree;
    }
  }

  return generateFallbackTree(fallbackTitle);
}

/**
 * Normalizes an arbitrary node into a strict MindmapRawNode with valid types and IDs.
 */
function normalizeNode(node: any, depth: number, parentId = 'root'): MindmapRawNode {
  const id = String(node.id || `${parentId}-node-${Math.random().toString(36).substring(2, 7)}`);
  const label = cleanNodeLabel(String(node.label || node.title || node.name || 'Concept'));
  
  let nodeType: MindmapNodeType = 'subconcept';
  if (depth === 0) {
    nodeType = 'root';
  } else if (depth === 1) {
    nodeType = 'concept';
  } else if (node.type && ['concept', 'subconcept', 'example', 'deepdive'].includes(node.type)) {
    nodeType = node.type as MindmapNodeType;
  } else {
    const lower = label.toLowerCase();
    if (lower.includes('example') || lower.includes('demo') || lower.includes('implementation') || lower.includes('code')) {
      nodeType = 'example';
    } else if (lower.includes('gotcha') || lower.includes('deep') || lower.includes('internal') || lower.includes('lifecycle') || lower.includes('mechanic')) {
      nodeType = 'deepdive';
    } else {
      nodeType = 'subconcept';
    }
  }

  const rawChildren = Array.isArray(node.children) ? node.children : [];
  const children = rawChildren.map((child: any, idx: number) =>
    normalizeNode(child, depth + 1, `${id}-${idx}`)
  );

  return {
    id,
    label,
    type: nodeType,
    description: node.description ? String(node.description) : undefined,
    category: node.category ? String(node.category) : undefined,
    codeSnippet: node.codeSnippet ? String(node.codeSnippet) : undefined,
    completed: Boolean(node.completed),
    children: children.length > 0 ? children : undefined,
  };
}

/**
 * Parses Mermaid mindmap syntax:
 * mindmap
 *   root(("Object-Oriented Foundations Refresher"))
 *     Conceptual Foundation
 *       Inheritance
 *       Polymorphism
 *     Internal Mechanics
 *       Execution Lifecycle
 */
function parseMermaidMindmap(mermaidText: string, fallbackTitle: string): MindmapRawNode | null {
  const lines = mermaidText
    .split('\n')
    .map((line) => line.replace(/\r$/, ''))
    .filter((line) => line.trim().length > 0 && !line.trim().startsWith('%%'));

  // Remove header line "mindmap"
  const contentLines = lines.filter((l) => l.trim().toLowerCase() !== 'mindmap');
  if (contentLines.length === 0) return null;

  interface StackItem {
    node: MindmapRawNode;
    indent: number;
  }

  let rootNode: MindmapRawNode | null = null;
  const stack: StackItem[] = [];

  for (let i = 0; i < contentLines.length; i++) {
    const rawLine = contentLines[i];
    // Calculate indentation level
    const match = rawLine.match(/^(\s*)/);
    const indent = match ? match[1].length : 0;
    const cleanText = cleanNodeLabel(rawLine);

    if (!cleanText) continue;

    const isRoot = i === 0 || rawLine.includes('root(') || rawLine.includes('root (');
    const depth = isRoot ? 0 : Math.max(1, Math.round(indent / 2));

    let nodeType: MindmapNodeType = 'subconcept';
    if (depth === 0) {
      nodeType = 'root';
    } else if (depth === 1) {
      nodeType = 'concept';
    } else {
      const lower = cleanText.toLowerCase();
      if (lower.includes('example') || lower.includes('demo') || lower.includes('code') || lower.includes('case')) {
        nodeType = 'example';
      } else if (lower.includes('internal') || lower.includes('gotcha') || lower.includes('memory') || lower.includes('deep') || lower.includes('lifecycle')) {
        nodeType = 'deepdive';
      } else {
        nodeType = 'subconcept';
      }
    }

    const newNode: MindmapRawNode = {
      id: isRoot ? 'root' : `node-${i}-${Math.random().toString(36).substring(2, 6)}`,
      label: cleanText,
      type: nodeType,
      children: [],
    };

    if (isRoot || stack.length === 0) {
      rootNode = newNode;
      stack.length = 0;
      stack.push({ node: newNode, indent });
    } else {
      // Find parent in stack with strictly smaller indentation
      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      if (stack.length > 0) {
        const parent = stack[stack.length - 1].node;
        if (!parent.children) parent.children = [];
        parent.children.push(newNode);
      } else if (rootNode) {
        if (!rootNode.children) rootNode.children = [];
        rootNode.children.push(newNode);
      }

      stack.push({ node: newNode, indent });
    }
  }

  if (rootNode) {
    if (!rootNode.label || rootNode.label === 'root') {
      rootNode.label = fallbackTitle;
    }
    return rootNode;
  }

  return null;
}

/**
 * Strips Mermaid syntax brackets like root(("Title")), ("Title"), ["Title"], etc.
 */
function cleanNodeLabel(raw: string): string {
  let text = raw.trim();

  // Strip root(("..."))
  text = text.replace(/^root\s*\(\(\s*["']?(.*?)["']?\s*\)\)$/i, '$1');
  // Strip (("..."))
  text = text.replace(/^\(\(\s*["']?(.*?)["']?\s*\)\)$/, '$1');
  // Strip ("...")
  text = text.replace(/^\(\s*["']?(.*?)["']?\s*\)$/, '$1');
  // Strip ["..."]
  text = text.replace(/^\[\s*["']?(.*?)["']?\s*\]$/, '$1');
  // Strip {{"..."}}
  text = text.replace(/^\{\{\s*["']?(.*?)["']?\s*\}\}$/, '$1');
  // Strip quotes
  text = text.replace(/^["'](.*)["']$/, '$1');

  return text.trim();
}

/**
 * Generates an educational fallback tree if mindmap data is missing or corrupted.
 */
export function generateFallbackTree(moduleTitle: string): MindmapRawNode {
  return {
    id: 'root',
    label: moduleTitle || 'Core Module Foundations',
    type: 'root',
    description: `Foundational learning map for ${moduleTitle}`,
    children: [
      {
        id: 'c-1',
        label: 'Conceptual Foundations',
        type: 'concept',
        category: 'Theory',
        description: 'Core theoretical mental models, abstractions, and principles.',
        children: [
          {
            id: 'sc-1-1',
            label: 'Core Mental Model',
            type: 'subconcept',
            description: 'Foundational paradigm shift and conceptual definitions.',
          },
          {
            id: 'sc-1-2',
            label: 'Interface Contracts',
            type: 'subconcept',
            description: 'Decoupling responsibilities with explicit boundary contracts.',
          },
        ],
      },
      {
        id: 'c-2',
        label: 'Internal Mechanics',
        type: 'concept',
        category: 'Architecture',
        description: 'Execution lifecycle, runtime scheduling, and memory organization.',
        children: [
          {
            id: 'sc-2-1',
            label: 'Execution Lifecycle',
            type: 'subconcept',
            description: 'Initialization, hydration, and runtime event loops.',
          },
          {
            id: 'dd-2-2',
            label: 'Memory & State Domains',
            type: 'deepdive',
            description: 'Under-the-hood reference management and garbage collection.',
          },
        ],
      },
      {
        id: 'c-3',
        label: 'Applied Implementation',
        type: 'concept',
        category: 'Engineering',
        description: 'Production patterns, concrete implementations, and workflows.',
        children: [
          {
            id: 'ex-3-1',
            label: 'Production Architecture Example',
            type: 'example',
            description: 'End-to-end implementation with error boundaries and telemetry.',
          },
          {
            id: 'sc-3-2',
            label: 'Best Practices',
            type: 'subconcept',
            description: 'Idiomatic patterns and high-throughput architectural conventions.',
          },
        ],
      },
      {
        id: 'c-4',
        label: 'Edge Cases & Gotchas',
        type: 'concept',
        category: 'Resilience',
        description: 'Defensive safeguards, performance traps, and debugging wisdom.',
        children: [
          {
            id: 'dd-4-1',
            label: 'State Mutation Pitfalls',
            type: 'deepdive',
            description: 'Preventing race conditions and unhandled lifecycle bugs.',
          },
          {
            id: 'sc-4-2',
            label: 'Resource Management',
            type: 'subconcept',
            description: 'Avoiding silent memory leaks and unreleased connection handles.',
          },
        ],
      },
    ],
  };
}
