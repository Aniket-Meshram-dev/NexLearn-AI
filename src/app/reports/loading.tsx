export default function ReportsLoading() {
  return (
    <div style={{ padding: '32px 24px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ width: '140px', height: '24px', borderRadius: '8px', background: 'var(--surface-subtle, #F1F3F5)', marginBottom: '8px', position: 'relative', overflow: 'hidden' }}>
          <div className="shimmer" />
        </div>
        <div style={{ width: '280px', height: '14px', borderRadius: '6px', background: 'var(--surface-subtle, #F1F3F5)', position: 'relative', overflow: 'hidden' }}>
          <div className="shimmer" />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              height: '100px',
              borderRadius: 'var(--radius, 12px)',
              background: 'var(--surface-raised, #fff)',
              border: '1px solid var(--border-hairline, #E9ECEF)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="shimmer" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            style={{
              height: '300px',
              borderRadius: 'var(--radius, 12px)',
              background: 'var(--surface-raised, #fff)',
              border: '1px solid var(--border-hairline, #E9ECEF)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="shimmer" />
          </div>
        ))}
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
