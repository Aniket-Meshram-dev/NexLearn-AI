'use client';
import { Star } from 'lucide-react';

export default function TestimonialsSection() {
  const reviews = [
    {
      name: 'Aarav Sharma',
      role: 'Staff Software Engineer @ FinTech',
      text: 'NexLearn generated a Distributed Systems & Consensus course that was crisper and more accurate than a $2,000 corporate bootcamp. The interactive mind maps alone saved me weeks.',
      avatar: 'AS',
    },
    {
      name: 'Elena Rostova',
      role: 'AI Researcher & Data Scientist',
      text: 'The voice AI mentor is brilliant. Being able to verbally ask "Why does transformer attention scale quadratically?" while debugging code and get concise mathematical analogies is magical.',
      avatar: 'ER',
    },
    {
      name: 'Priyanka Patel',
      role: 'Full-Stack Developer & CS Student',
      text: 'I used NexLearn to prepare for technical interviews. The instant quizzes with deep explanations gave me the exact mental clarity I needed. Earned two verified certificates already!',
      avatar: 'PP',
    },
  ];

  return (
    <section id="testimonials" className="lp-section">
      <div className="lp-section-header">
        <span className="lp-section-tag">Wall of Love</span>
        <h2 className="lp-section-title">Endorsed by Ambitious Learners Globally</h2>
        <p className="lp-section-desc">
          See why thousands of developers, researchers, and university scholars rely on NexLearn every single day.
        </p>
      </div>

      <div className="lp-testimonials-grid">
        {reviews.map((r, i) => (
          <div key={i} className="lp-glass lp-glass-hover lp-testimonial-card">
            <div>
              <div className="lp-stars" style={{ display: 'flex', gap: '3px', color: '#f59e0b', marginBottom: '12px' }}>
                {[...Array(5)].map((_, starIdx) => (
                  <Star key={starIdx} size={15} fill="currentColor" />
                ))}
              </div>
              <p className="lp-testimonial-text">"{r.text}"</p>
            </div>

            <div className="lp-author">
              <div className="lp-author-avatar">{r.avatar}</div>
              <div>
                <div className="lp-author-name">{r.name}</div>
                <div className="lp-author-role">{r.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
