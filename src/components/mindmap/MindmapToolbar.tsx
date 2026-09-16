import React from 'react';
import { useViewport } from '@xyflow/react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Search,
  RotateCcw,
  FoldHorizontal,
  UnfoldHorizontal,
  Sparkles,
  CheckCircle2,
  Target,
} from 'lucide-react';

interface MindmapToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onFocusCenter: () => void;
  onResetZoom: () => void;
  onToggleCollapseAll: () => void;
  allCollapsed: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  totalConcepts: number;
  completedConcepts: number;
}

export default function MindmapToolbar({
  searchQuery,
  onSearchChange,
  onZoomIn,
  onZoomOut,
  onFitView,
  onFocusCenter,
  onResetZoom,
  onToggleCollapseAll,
  allCollapsed,
  isFullscreen,
  onToggleFullscreen,
  onRegenerate,
  isRegenerating = false,
  totalConcepts,
  completedConcepts,
}: MindmapToolbarProps) {
  const { zoom } = useViewport();
  const zoomPercent = Math.round(zoom * 100);

  const masteryPercentage =
    totalConcepts > 0 ? Math.round((completedConcepts / totalConcepts) * 100) : 0;

  return (
    <div
      className="mindmap-hud-toolbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '10px 16px',
        background: 'var(--bg-white, #ffffff)',
        border: '1px solid var(--border, #e2e8f0)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-md, 0 4px 16px rgba(0,0,0,0.06))',
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 10,
        marginBottom: '16px',
      }}
    >
      {/* Left side: Search filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 240px', maxWidth: '320px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg, #f8fafc)',
            border: '1px solid var(--border, #e2e8f0)',
            borderRadius: '10px',
            padding: '6px 12px',
            width: '100%',
          }}
        >
          <Search size={15} style={{ color: 'var(--text-muted, #94a3b8)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search concepts or keywords..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '0.84rem',
              color: 'var(--text, #0f172a)',
              width: '100%',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted, #94a3b8)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                padding: '0 4px',
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Center: Progress & Mastery Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 12px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}
        >
          <CheckCircle2 size={15} color="#10b981" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#047857' }}>
            {completedConcepts} / {totalConcepts} Mastered ({masteryPercentage}%)
          </span>
          <div
            style={{
              width: '48px',
              height: '5px',
              borderRadius: '3px',
              background: 'rgba(16, 185, 129, 0.2)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${masteryPercentage}%`,
                height: '100%',
                background: '#10b981',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Right side: Interactive Zoom Pill, Center, Fit, Collapse & Fullscreen Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Zoom Controls Pill with Live Percentage */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--bg, #f8fafc)',
            border: '1px solid var(--border, #e2e8f0)',
            borderRadius: '10px',
            padding: '2px',
            gap: '1px',
          }}
        >
          <button
            onClick={onZoomOut}
            title="Zoom Out"
            style={{
              ...hudBtnStyle,
              border: 'none',
              background: 'transparent',
              padding: '5px 8px',
              borderRadius: '8px',
            }}
          >
            <ZoomOut size={14} />
          </button>

          <button
            onClick={onResetZoom}
            title="Click to reset to 100% Zoom"
            style={{
              ...hudBtnStyle,
              border: 'none',
              background: 'rgba(99, 102, 241, 0.08)',
              padding: '4px 8px',
              fontWeight: 700,
              fontSize: '0.78rem',
              color: 'var(--primary, #4f46e5)',
              minWidth: '48px',
              justifyContent: 'center',
              borderRadius: '8px',
            }}
          >
            {zoomPercent}%
          </button>

          <button
            onClick={onZoomIn}
            title="Zoom In"
            style={{
              ...hudBtnStyle,
              border: 'none',
              background: 'transparent',
              padding: '5px 8px',
              borderRadius: '8px',
            }}
          >
            <ZoomIn size={14} />
          </button>
        </div>

        {/* Focus Center Root Node */}
        <button
          onClick={onFocusCenter}
          title="Focus on Central Module (100% scale)"
          style={hudBtnStyle}
        >
          <Target size={14} color="#6366f1" />
          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Center</span>
        </button>

        {/* Fit to View with readability constraint */}
        <button
          onClick={onFitView}
          title="Fit diagram comfortably to screen"
          style={hudBtnStyle}
        >
          <RotateCcw size={14} />
          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Fit</span>
        </button>

        {/* Collapse to Core Concepts vs Expand All Details */}
        <button
          onClick={onToggleCollapseAll}
          title={allCollapsed ? 'Expand All Branches' : 'Collapse to Core Concepts'}
          style={hudBtnStyle}
        >
          {allCollapsed ? <UnfoldHorizontal size={14} /> : <FoldHorizontal size={14} />}
          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
            {allCollapsed ? 'Expand All' : 'Collapse'}
          </span>
        </button>

        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mind Map'}
          style={hudBtnStyle}
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>

        {onRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            title="Regenerate structured mind map from latest notes"
            style={{
              ...hudBtnStyle,
              background: 'rgba(99, 102, 241, 0.08)',
              borderColor: 'rgba(99, 102, 241, 0.3)',
              color: 'var(--primary, #4f46e5)',
              fontWeight: 700,
            }}
          >
            <Sparkles size={14} />
            <span style={{ fontSize: '0.78rem' }}>
              {isRegenerating ? 'Regenerating...' : 'Regenerate'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

const hudBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  padding: '6px 11px',
  borderRadius: '9px',
  background: 'var(--bg, #f8fafc)',
  border: '1px solid var(--border, #e2e8f0)',
  color: 'var(--text, #0f172a)',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};
