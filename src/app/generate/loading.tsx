export default function GenerateLoading() {
  return (
    <div style={{ padding: '32px 24px', maxWidth: '720px', margin: '0 auto' }}>
      {/* Header skeleton */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'var(--surface-subtle, #F1F3F5)',
            margin: '0 auto 16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className="shimmer" />
        </div>
        <div style={{ width: '200px', height: '24px', borderRadius: '8px', background: 'var(--surface-subtle, #F1F3F5)', margin: '0 auto 8px', position: 'relative', overflow: 'hidden' }}>
          <div className="shimmer" />
        </div>
        <div style={{ width: '300px', height: '16px', borderRadius: '6px', background: 'var(--surface-subtle, #F1F3F5)', margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
          <div className="shimmer" />
        </div>
      </div>

      {/* Form skeleton */}
      <div
        style={{
          borderRadius: 'var(--radius-lg, 16px)',
          background: 'var(--surface-raised, #fff)',
          border: '1px solid var(--border-hairline, #E9ECEF)',
          padding: '24px',
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ marginBottom: '20px' }}>
            <div style={{ width: '80px', height: '14px', borderRadius: '4px', background: 'var(--surface-subtle, #F1F3F5)', marginBottom: '8px', position: 'relative', overflow: 'hidden' }}>
              <div className="shimmer" />
            </div>
            <div style={{ height: '44px', borderRadius: 'var(--radius, 12px)', background: 'var(--surface-subtle, #F1F3F5)', position: 'relative', overflow: 'hidden' }}>
              <div className="shimmer" />
            </div>
          </div>
        ))}
        <div style={{ height: '48px', borderRadius: 'var(--radius, 12px)', background: 'var(--surface-subtle, #F1F3F5)', position: 'relative', overflow: 'hidden' }}>
          <div className="shimmer" />
        </div>
      </div>

      <style>{`
        .shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.04) 40%, rgba(99,102,241,0.08) 50%, rgba(99,102,241,0.04) 60%, transparent 100%);
          animation: shimmer 1.8s infinite ease-in-out;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
