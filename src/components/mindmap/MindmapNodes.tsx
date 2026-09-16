import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { CustomNodeData } from './types';
import {
  BookOpen,
  Sparkles,
  Terminal,
  Cpu,
  Layers,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Info,
} from 'lucide-react';

export const MindmapCustomNode = memo(function MindmapCustomNode({
  data,
  sourcePosition = Position.Right,
  targetPosition = Position.Left,
}: NodeProps<any>) {
  const nodeData = data as CustomNodeData;
  const {
    id,
    label,
    nodeType,
    description,
    category,
    childCount = 0,
    isCollapsed = false,
    isHighlighted = false,
    isDimmed = false,
    isCompleted = false,
    depth = 0,
    onToggleCollapse,
    onSelectNode,
    onToggleComplete,
  } = nodeData;

  const hasChildren = childCount > 0;

  // Icon selector based on category and type
  const renderIcon = () => {
    if (nodeType === 'root') return <BookOpen size={18} className="text-white" />;
    if (nodeType === 'example') return <Terminal size={14} className="text-amber-500" />;
    if (nodeType === 'deepdive') return <Sparkles size={14} className="text-pink-500" />;
    if (category?.toLowerCase().includes('arch') || category?.toLowerCase().includes('mechanic')) {
      return <Cpu size={14} className="text-violet-500" />;
    }
    return <Layers size={14} className="text-indigo-500" />;
  };

  // 1. Root Node Design
  if (nodeType === 'root') {
    return (
      <div
        className={`mindmap-node-root ${isHighlighted ? 'highlighted' : ''}`}
        onClick={() => onSelectNode?.(nodeData)}
        style={{
          minWidth: '250px',
          maxWidth: '290px',
          padding: '16px 20px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          border: isHighlighted
            ? '2.5px solid #818cf8'
            : '1.5px solid rgba(129, 140, 248, 0.4)',
          color: '#ffffff',
          boxShadow: isHighlighted
            ? '0 0 35px rgba(99, 102, 241, 0.6), 0 10px 30px rgba(0, 0, 0, 0.3)'
            : '0 12px 36px rgba(15, 23, 42, 0.25), 0 0 20px rgba(79, 70, 229, 0.2)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Handles on both sides for balanced branch emergence */}
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#818cf8', width: 8, height: 8, border: '2px solid #fff' }}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: '#818cf8', width: 8, height: 8, border: '2px solid #fff' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '3px 9px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#c7d2fe',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {renderIcon()}
            <span>Central Module</span>
          </span>
          {isCompleted && (
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '0.74rem',
                color: '#4ade80',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={13} />
              <span>Completed</span>
            </span>
          )}
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: '1.18rem',
            fontWeight: 800,
            lineHeight: 1.35,
            letterSpacing: '-0.01em',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          {label}
        </h3>

        {description && (
          <p
            style={{
              margin: '8px 0 0',
              fontSize: '0.84rem',
              color: 'rgba(224, 231, 255, 0.88)',
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </p>
        )}
      </div>
    );
  }

  // Visual Theme per Node Type
  const typeStyles = {
    concept: {
      borderColor: 'rgba(99, 102, 241, 0.45)',
      activeBorder: '#6366f1',
      bgGlow: 'rgba(99, 102, 241, 0.05)',
      badgeBg: 'rgba(99, 102, 241, 0.12)',
      badgeColor: '#4f46e5',
      accentBar: '#6366f1',
    },
    subconcept: {
      borderColor: 'rgba(148, 163, 184, 0.35)',
      activeBorder: '#8b5cf6',
      bgGlow: 'rgba(139, 92, 246, 0.04)',
      badgeBg: 'rgba(148, 163, 184, 0.1)',
      badgeColor: 'var(--text-secondary, #64748b)',
      accentBar: '#8b5cf6',
    },
    example: {
      borderColor: 'rgba(245, 158, 11, 0.4)',
      activeBorder: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.06)',
      badgeBg: 'rgba(245, 158, 11, 0.12)',
      badgeColor: '#d97706',
      accentBar: '#f59e0b',
    },
    deepdive: {
      borderColor: 'rgba(236, 72, 153, 0.4)',
      activeBorder: '#ec4899',
      bgGlow: 'rgba(236, 72, 153, 0.06)',
      badgeBg: 'rgba(236, 72, 153, 0.12)',
      badgeColor: '#db2777',
      accentBar: '#ec4899',
    },
  }[nodeType] || {
    borderColor: 'rgba(148, 163, 184, 0.35)',
    activeBorder: '#6366f1',
    bgGlow: 'transparent',
    badgeBg: 'rgba(99, 102, 241, 0.1)',
    badgeColor: '#4f46e5',
    accentBar: '#6366f1',
  };

  return (
    <div
      className={`mindmap-node-card mindmap-type-${nodeType} ${isHighlighted ? 'highlighted' : ''} ${
        isDimmed ? 'dimmed' : ''
      }`}
      onClick={() => onSelectNode?.(nodeData)}
      style={{
        boxSizing: 'border-box',
        width: depth === 1 ? '240px' : '220px',
        padding: depth === 1 ? '14px 16px' : '11px 14px',
        borderRadius: '14px',
        background: 'var(--bg-white, #ffffff)',
        border: `1.5px solid ${isHighlighted ? typeStyles.activeBorder : typeStyles.borderColor}`,
        boxShadow: isHighlighted
          ? `0 0 24px ${typeStyles.activeBorder}44, var(--shadow-md, 0 8px 24px rgba(0,0,0,0.08))`
          : 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.04))',
        opacity: isDimmed ? 0.32 : 1,
        transform: isHighlighted ? 'scale(1.03)' : 'scale(1)',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'pointer',
        position: 'relative',
        filter: isDimmed ? 'grayscale(40%)' : 'none',
        userSelect: 'none',
      }}
    >
      <Handle
        type="target"
        position={targetPosition}
        style={{
          background: isHighlighted ? typeStyles.activeBorder : '#94a3b8',
          width: 7,
          height: 7,
          border: '1.5px solid var(--bg-white, #fff)',
        }}
      />
      <Handle
        type="source"
        position={sourcePosition}
        style={{
          background: isHighlighted ? typeStyles.activeBorder : '#94a3b8',
          width: 7,
          height: 7,
          border: '1.5px solid var(--bg-white, #fff)',
        }}
      />

      {/* Accent Left Pill */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '12px',
          bottom: '12px',
          width: '4px',
          borderRadius: '0 4px 4px 0',
          background: typeStyles.accentBar,
        }}
      />

      {/* Header Row: Category Badge + Icon + Mastery */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '6px',
          gap: '6px',
        }}
      >
        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            padding: '3px 8px',
            borderRadius: '6px',
            background: typeStyles.badgeBg,
            color: typeStyles.badgeColor,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            maxWidth: '140px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {renderIcon()}
          <span>
            {category || (nodeType === 'example' ? 'Example' : nodeType === 'deepdive' ? 'Deep Dive' : 'Concept')}
          </span>
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {/* Mastery checkmark toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete?.(id);
            }}
            title={isCompleted ? 'Marked as Mastered' : 'Mark Concept as Mastered'}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 2,
              cursor: 'pointer',
              color: isCompleted ? '#10b981' : 'var(--text-muted, #94a3b8)',
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.15s ease',
            }}
          >
            <CheckCircle2 size={16} fill={isCompleted ? '#dcfce7' : 'none'} />
          </button>

          {/* Quick info icon */}
          <span
            style={{ color: 'var(--text-muted, #94a3b8)', display: 'flex', alignItems: 'center' }}
            title="Click node to inspect notes & details"
          >
            <Info size={14} />
          </span>
        </div>
      </div>

      {/* Node Title */}
      <h4
        style={{
          margin: 0,
          fontSize: depth === 1 ? '1.02rem' : '0.92rem',
          fontWeight: depth === 1 ? 750 : 650,
          color: 'var(--text, #0f172a)',
          lineHeight: 1.35,
          wordBreak: 'break-word',
          letterSpacing: '-0.01em',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        title={label}
      >
        {label}
      </h4>

      {/* Description Snippet */}
      {description && (
        <p
          style={{
            margin: '6px 0 0',
            fontSize: '0.80rem',
            color: 'var(--text-secondary, #64748b)',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={description}
        >
          {description}
        </p>
      )}

      {/* Collapse/Expand Footer Pill if has children */}
      {hasChildren && (
        <div
          style={{
            marginTop: '10px',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-light, #f1f5f9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
            {childCount} {childCount === 1 ? 'subtopic' : 'subtopics'}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse?.(id);
            }}
            title={isCollapsed ? `Expand ${childCount} subtopics` : 'Collapse subtopics'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '8px',
              background: isCollapsed ? 'var(--primary-bg, #e0e7ff)' : 'var(--bg, #f1f5f9)',
              color: isCollapsed ? 'var(--primary, #4f46e5)' : 'var(--text, #1e293b)',
              border: isCollapsed
                ? '1px solid rgba(99, 102, 241, 0.4)'
                : '1px solid var(--border, #cbd5e1)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            {isCollapsed ? (
              <>
                <span>Expand</span>
                <ChevronRight size={13} />
              </>
            ) : (
              <>
                <span>Collapse</span>
                <ChevronDown size={13} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
});
