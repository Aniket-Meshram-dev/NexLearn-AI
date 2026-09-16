export default function DashboardLoading() {
  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Stats row skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="skeleton-card"
            style={{
              height: '120px',
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

      {/* Chart + courses skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            style={{
              height: '280px',
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

      {/* Course cards skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              height: '200px',
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
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(99, 102, 241, 0.04) 40%,
            rgba(99, 102, 241, 0.08) 50%,
            rgba(99, 102, 241, 0.04) 60%,
            transparent 100%
          );
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
