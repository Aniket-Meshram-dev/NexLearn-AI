import React from 'react';
import { CustomNodeData } from './types';
import {
  X,
  CheckCircle2,
  BookOpen,
  Terminal,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface ConceptDetailDrawerProps {
  selectedNode: CustomNodeData | null;
  onClose: () => void;
  onToggleComplete?: (id: string) => void;
  onJumpToNotes?: () => void;
}

export default function ConceptDetailDrawer({
  selectedNode,
  onClose,
  onToggleComplete,
  onJumpToNotes,
}: ConceptDetailDrawerProps) {
  if (!selectedNode) return null;

  const {
    id,
    label,
    nodeType,
    description,
    category,
    codeSnippet,
    isCompleted = false,
  } = selectedNode;

  return (
    <div
      className="concept-detail-drawer"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '380px',
        background: 'var(--bg-white, #ffffff)',
        borderLeft: '1px solid var(--border, #e2e8f0)',
        boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.12)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border-light, #f1f5f9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '3px 9px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--primary, #4f46e5)',
            }}
          >
            {category || nodeType.toUpperCase()}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)' }}>
            Concept Breakdown
          </span>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted, #94a3b8)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            borderRadius: '6px',
          }}
          title="Close details"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '1.25rem',
            fontWeight: 800,
            lineHeight: 1.35,
            color: 'var(--text, #0f172a)',
          }}
        >
          {label}
        </h3>

        {/* Description Section */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '12px',
            background: 'var(--bg, #f8fafc)',
            border: '1px solid var(--border-light, #f1f5f9)',
            marginBottom: '20px',
          }}
        >
          <h4
            style={{
              margin: '0 0 6px 0',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text-muted, #94a3b8)',
            }}
          >
            Concept Overview
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: '0.88rem',
              lineHeight: 1.55,
              color: 'var(--text-secondary, #475569)',
            }}
          >
            {description ||
              `A key structural building block in this module. Master this concept to understand high-throughput architectural patterns and system contracts.`}
          </p>
        </div>

        {/* Code Snippet if applicable */}
        {codeSnippet && (
          <div style={{ marginBottom: '20px' }}>
            <h4
              style={{
                margin: '0 0 8px 0',
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--text-muted, #94a3b8)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Terminal size={14} />
              <span>Applied Demonstration</span>
            </h4>
            <pre
              style={{
                margin: 0,
                padding: '12px 14px',
                borderRadius: '10px',
                background: '#0f172a',
                color: '#e2e8f0',
                fontSize: '0.78rem',
                fontFamily: 'monospace',
                overflowX: 'auto',
                lineHeight: 1.5,
              }}
            >
              <code>{codeSnippet}</code>
            </pre>
          </div>
        )}

        {/* Mastery Status Toggle */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '12px',
            background: isCompleted ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg, #f8fafc)',
            border: `1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.25)' : 'var(--border, #e2e8f0)'}`,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: isCompleted ? '#065f46' : 'var(--text, #0f172a)' }}>
              {isCompleted ? 'Concept Mastered!' : 'Mark as Mastered'}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted, #94a3b8)', marginTop: '2px' }}>
              Track your learning roadmap mastery
            </div>
          </div>

          <button
            onClick={() => onToggleComplete?.(id)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: isCompleted ? '#10b981' : 'var(--primary, #4f46e5)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <CheckCircle2 size={14} />
            <span>{isCompleted ? 'Mastered' : 'Check Off'}</span>
          </button>
        </div>

        {/* Jump to Notes button */}
        {onJumpToNotes && (
          <button
            onClick={() => {
              onClose();
              onJumpToNotes();
            }}
            className="btn btn-outline"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.86rem',
            }}
          >
            <BookOpen size={15} />
            <span>Read in Lecture Notes</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
