import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

interface RecommendationItem {
  title: string;
  desc: string;
  link: string;
}

interface RecommendationsSectionProps {
  recommendations: RecommendationItem[];
}

export default function RecommendationsSection({ recommendations = [] }: RecommendationsSectionProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(168, 85, 247, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#A855F7',
            }}
          >
            <Sparkles size={18} />
          </div>
          <h3 className="card-title">AI Smart Recommendations</h3>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="empty-state" style={{ padding: '28px 0' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Complete activities to unlock personalized curriculum suggestions!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recommendations.map((rec, i) => (
            <Link
              key={i}
              href={rec.link}
              className="recommendation-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'var(--primary-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '0.92rem', fontWeight: 600 }}>
                  {rec.title}
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {rec.desc}
                </p>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
