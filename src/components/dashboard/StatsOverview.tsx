'use client';
import { useState, useEffect } from 'react';
import { Flame, BookOpenCheck, CheckCircle2, Award } from 'lucide-react';

export function AnimatedNumber({ value }: { value: number | string }) {
  const numeric = typeof value === 'number' ? value : parseFloat(value) || 0;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (numeric === 0) {
      setCurrent(0);
      return;
    }
    const duration = 850;
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCurrent(Math.round(numeric * ease));
      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };
    const animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [numeric]);

  return <span className="tabular-stat">{current}</span>;
}

interface StatsOverviewProps {
  stats: {
    streak: number;
    totalCourses: number;
    completedModules: number;
    totalModules: number;
    points: number;
  };
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid-4">
      <div className="stat-card">
        <div className="stat-icon yellow">
          <Flame size={24} strokeWidth={2.2} />
        </div>
        <div className="stat-info">
          <h3><AnimatedNumber value={stats.streak} /></h3>
          <p>Day Streak</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon blue">
          <BookOpenCheck size={24} strokeWidth={2.2} />
        </div>
        <div className="stat-info">
          <h3><AnimatedNumber value={stats.totalCourses} /></h3>
          <p>Total Courses</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon green">
          <CheckCircle2 size={24} strokeWidth={2.2} />
        </div>
        <div className="stat-info">
          <h3>
            <AnimatedNumber value={stats.completedModules} /> / <AnimatedNumber value={stats.totalModules} />
          </h3>
          <p>Modules Done</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon purple">
          <Award size={24} strokeWidth={2.2} />
        </div>
        <div className="stat-info">
          <h3><AnimatedNumber value={stats.points} /></h3>
          <p>Mastery Points</p>
        </div>
      </div>
    </div>
  );
}
