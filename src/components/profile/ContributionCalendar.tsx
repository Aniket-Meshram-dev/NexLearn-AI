'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Flame,
  Zap,
  Calendar as CalendarIcon,
  TrendingUp,
  Award,
  Info,
} from 'lucide-react';

interface DayActivity {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  studyMinutes: number;
  sessionsCount: number;
  quizzesCount: number;
  flashcardsCount: number;
  achievementsCount: number;
  coursesCount: number;
  details: string[];
}

interface CalendarResponse {
  success: boolean;
  requestedYear: string;
  availableYears: string[];
  startDate: string;
  endDate: string;
  totalContributions: number;
  activeDaysCount: number;
  currentStreak: number;
  longestStreak: number;
  peakDay: { date: string; count: number };
  days: Record<string, DayActivity>;
}

interface CalendarDay {
  dateStr: string;
  dayNum: number;
  isInRange: boolean;
  activity: DayActivity | null;
  level: 0 | 1 | 2 | 3 | 4;
  dayOfWeek: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
}

interface MonthBlock {
  key: string;
  label: string;
  year: number;
  monthIndex: number;
  columns: Array<Array<CalendarDay | null>>;
}

export default function ContributionCalendar() {
  const [data, setData] = useState<CalendarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('current');
  const [hoveredCell, setHoveredCell] = useState<{
    date: string;
    activity: DayActivity | null;
    x: number;
    y: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchCalendar = (year: string) => {
    setLoading(true);
    fetch(`/api/user/activity-calendar?year=${year}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setData(d);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load activity calendar:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCalendar(selectedYear);
  }, [selectedYear]);

  // Auto-scroll to current (latest) month when data loads or year changes
  useEffect(() => {
    if (!loading && scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [loading, selectedYear]);

  // Generate distinct month blocks separated from each other
  const monthsData = useMemo<MonthBlock[]>(() => {
    if (!data?.startDate || !data?.endDate) {
      return [];
    }

    const [startYear, startMonth, startDay] = data.startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = data.endDate.split('-').map(Number);

    const start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
    const end = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

    const monthNames = [
      'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb',
      'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
    ];
    const fullMonthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const blocks: MonthBlock[] = [];
    let curY = startYear;
    let curM = startMonth - 1;

    while (curY < endYear || (curY === endYear && curM <= endMonth - 1)) {
      const year = curY;
      const month = curM;
      const label = fullMonthNames[month];
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;

      // Total days in current month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      // Day of week of the 1st day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
      const firstDow = new Date(year, month, 1).getDay();

      const numCols = Math.ceil((firstDow + daysInMonth) / 7);
      const validColumns: Array<Array<CalendarDay | null>> = [];

      for (let c = 0; c < numCols; c++) {
        const colDays: Array<CalendarDay | null> = [];
        let hasInRangeDay = false;

        for (let r = 0; r < 7; r++) {
          const dayNum = c * 7 + r - firstDow + 1;
          if (dayNum < 1 || dayNum > daysInMonth) {
            colDays.push(null);
          } else {
            const dObj = new Date(year, month, dayNum);
            const isInRange = dObj >= start && dObj <= end;
            const pad = (n: number) => String(n).padStart(2, '0');
            const dateStr = `${year}-${pad(month + 1)}-${pad(dayNum)}`;
            const activity = data.days[dateStr] || null;
            const level = isInRange && activity ? activity.level : 0;

            if (isInRange) {
              hasInRangeDay = true;
            }

            colDays.push({
              dateStr,
              dayNum,
              isInRange,
              activity,
              level,
              dayOfWeek: r,
            });
          }
        }

        // Only render columns that have at least one day in the active range
        if (hasInRangeDay) {
          validColumns.push(colDays);
        }
      }

      if (validColumns.length > 0) {
        blocks.push({
          key,
          label,
          year,
          monthIndex: month,
          columns: validColumns,
        });
      }

      curM++;
      if (curM > 11) {
        curM = 0;
        curY++;
      }
    }

    return blocks;
  }, [data]);

  // Color mapper using CSS variables for dark/light mode consistency
  const getCellColor = (level: 0 | 1 | 2 | 3 | 4) => {
    switch (level) {
      case 1:
        return 'var(--calendar-l1)';
      case 2:
        return 'var(--calendar-l2)';
      case 3:
        return 'var(--calendar-l3)';
      case 4:
        return 'var(--calendar-l4)';
      case 0:
      default:
        return 'var(--calendar-empty)';
    }
  };

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    dateStr: string,
    activity: DayActivity | null
  ) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cellRect = e.currentTarget.getBoundingClientRect();

    setHoveredCell({
      date: dateStr,
      activity,
      x: cellRect.left - rect.left + cellRect.width / 2,
      y: cellRect.top - rect.top - 8,
    });
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  const formatDisplayDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      ref={containerRef}
      style={{
        background: 'var(--bg-white)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '28px',
        marginBottom: '32px',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <style>{`
        :root {
          --calendar-empty: #ebedf0;
          --calendar-empty-border: rgba(0, 0, 0, 0.06);
          --calendar-l1: #9be9a8;
          --calendar-l2: #40c463;
          --calendar-l3: #30a14e;
          --calendar-l4: #216e39;
        }
        .dark, [data-theme='dark'] {
          --calendar-empty: rgba(255, 255, 255, 0.08);
          --calendar-empty-border: rgba(255, 255, 255, 0.03);
          --calendar-l1: #0e4429;
          --calendar-l2: #006d32;
          --calendar-l3: #26a641;
          --calendar-l4: #39d353;
        }
        .calendar-cell {
          transition: transform 0.12s ease, outline 0.12s ease;
        }
        .calendar-cell:hover {
          transform: scale(1.35);
          outline: 2px solid var(--primary);
          z-index: 10;
        }
      `}</style>

      {/* Top Header: Title, Total, Year Selector Pills */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <CalendarIcon size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
              Learning Contribution Heatmap
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {data
              ? `${data.totalContributions} total learning contributions in ${
                  selectedYear === 'current' ? 'the past year' : selectedYear
                }`
              : 'Tracking your daily educational momentum'}
          </p>
        </div>

        {/* Year Selector Pills */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          {data?.availableYears?.map((year) => {
            const isSelected = selectedYear === year;
            const label = year === 'current' ? 'Last 12 Months' : year;
            return (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 800 : 600,
                  background: isSelected ? 'var(--primary)' : 'var(--bg)',
                  color: isSelected ? 'white' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Flame size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.1 }}>
              {data?.currentStreak || 0} {data?.currentStreak === 1 ? 'Day' : 'Days'}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Current Streak
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'rgba(234, 179, 8, 0.12)',
              color: '#eab308',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.1 }}>
              {data?.longestStreak || 0} {data?.longestStreak === 1 ? 'Day' : 'Days'}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Longest Streak
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.1 }}>
              {data?.activeDaysCount || 0} Days
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Active Learning Days
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.12)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.1 }}>
              {data?.peakDay?.count || 0} Points
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Peak Day Record
            </div>
          </div>
        </div>
      </div>

      {/* Main Heatmap Scroll Container */}
      <div
        ref={scrollRef}
        style={{
          overflowX: 'auto',
          paddingBottom: '12px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="spinner spinner-sm" style={{ margin: '0 auto 12px auto' }} />
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Calculating contribution telemetry...
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'flex-start',
              gap: '8px',
              paddingTop: '6px',
            }}
          >
            {/* Weekday indicators on the left aligned to each of the 7 rows */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: 'repeat(7, 12px)',
                  gap: '3px',
                  fontSize: '0.64rem',
                  lineHeight: '12px',
                  width: '28px',
                  textAlign: 'right',
                  paddingRight: '6px',
                  userSelect: 'none',
                }}
              >
                <span style={{ color: 'var(--text-muted)', opacity: 0.65 }}>Sun</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>Mon</span>
                <span style={{ color: 'var(--text-muted)', opacity: 0.65 }}>Tue</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>Wed</span>
                <span style={{ color: 'var(--text-muted)', opacity: 0.65 }}>Thu</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>Fri</span>
                <span style={{ color: 'var(--text-muted)', opacity: 0.65 }}>Sat</span>
              </div>
              {/* Spacer matching the month label height below */}
              <div style={{ height: '18px' }} />
            </div>

            {/* Separate, Distinct Month Blocks */}
            <div
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
              }}
            >
              {monthsData.map((month) => (
                <div
                  key={month.key}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {/* Grid of days for this specific month */}
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {month.columns.map((col, colIdx) => (
                      <div
                        key={colIdx}
                        style={{
                          display: 'grid',
                          gridTemplateRows: 'repeat(7, 12px)',
                          gap: '3px',
                        }}
                      >
                        {col.map((day, dayIdx) => {
                          if (!day || !day.isInRange) {
                            return (
                              <div
                                key={dayIdx}
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  visibility: 'hidden',
                                }}
                              />
                            );
                          }

                          const color = getCellColor(day.level);

                          return (
                            <div
                              key={dayIdx}
                              className="calendar-cell"
                              onMouseEnter={(e) =>
                                handleMouseEnter(e, day.dateStr, day.activity)
                              }
                              onMouseLeave={handleMouseLeave}
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '3px',
                                background: color,
                                border:
                                  day.level === 0
                                    ? '1px solid var(--calendar-empty-border)'
                                    : 'none',
                                cursor: 'pointer',
                                boxSizing: 'border-box',
                              }}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Month Label Centered Under Each Month Block */}
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      fontWeight: 700,
                      userSelect: 'none',
                      height: '18px',
                      lineHeight: '18px',
                    }}
                  >
                    {month.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginTop: '18px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={14} />
          <span>Contributions include study sessions, quiz scores, flashcards, and achievements.</span>
        </div>

        {/* Intensity scale */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>Less</span>
          <div
            style={{
              width: '11px',
              height: '11px',
              borderRadius: '2.5px',
              background: 'var(--calendar-empty)',
              border: '1px solid var(--calendar-empty-border)',
            }}
          />
          <div
            style={{
              width: '11px',
              height: '11px',
              borderRadius: '2.5px',
              background: 'var(--calendar-l1)',
            }}
          />
          <div
            style={{
              width: '11px',
              height: '11px',
              borderRadius: '2.5px',
              background: 'var(--calendar-l2)',
            }}
          />
          <div
            style={{
              width: '11px',
              height: '11px',
              borderRadius: '2.5px',
              background: 'var(--calendar-l3)',
            }}
          />
          <div
            style={{
              width: '11px',
              height: '11px',
              borderRadius: '2.5px',
              background: 'var(--calendar-l4)',
            }}
          />
          <span>More</span>
        </div>
      </div>

      {/* Floating Interactive Hover Tooltip */}
      {hoveredCell && (
        <div
          style={{
            position: 'absolute',
            left: `${hoveredCell.x}px`,
            top: `${hoveredCell.y}px`,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(12px)',
            color: 'white',
            borderRadius: '12px',
            padding: '10px 14px',
            fontSize: '0.78rem',
            lineHeight: 1.4,
            pointerEvents: 'none',
            zIndex: 1000,
            minWidth: '180px',
            maxWidth: '260px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            textAlign: 'left',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#f8fafc', marginBottom: '4px' }}>
            {formatDisplayDate(hoveredCell.date)}
          </div>
          <div style={{ color: '#93c5fd', fontWeight: 700, marginBottom: '6px' }}>
            {hoveredCell.activity?.count
              ? `${hoveredCell.activity.count} learning contribution${
                  hoveredCell.activity.count > 1 ? 's' : ''
                }`
              : 'No contributions recorded'}
          </div>

          {hoveredCell.activity && hoveredCell.activity.details.length > 0 && (
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                fontSize: '0.75rem',
                color: '#cbd5e1',
              }}
            >
              {hoveredCell.activity.details.map((item, i) => (
                <div key={i}>{item}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

