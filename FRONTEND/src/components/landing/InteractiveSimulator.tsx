'use client';
import { useState } from 'react';
import Link from 'next/link';

interface TopicData {
  title: string;
  duration: string;
  level: string;
  modules: string[];
  sampleNote: string;
  codeSnippet?: string;
  quizQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  mentorAdvice: string;
  mindmapNodes: string[];
}

const PRESET_TOPICS: Record<string, TopicData> = {
  'Full-Stack Next.js 15': {
    title: 'Modern Full-Stack Engineering with Next.js 15 & Turbopack',
    duration: '4 Weeks',
    level: 'Intermediate',
    modules: [
      '1. React 19 Server Components Architecture',
      '2. Server Actions & Mutations with Optimistic Updates',
      '3. Neon DB & Prisma ORM Data Pipelines',
      '4. Turbopack Build Optimizations & Streaming SSR',
    ],
    sampleNote:
      'Server Components execute exclusively on the Node/Edge runtime. By streaming HTML fragments via Suspense boundaries, Next.js 15 achieves sub-second First Contentful Paint while eliminating clientside JavaScript hydration overhead.',
    codeSnippet: `// app/courses/page.tsx (Server Component)
export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    include: { modules: true },
    orderBy: { createdAt: 'desc' }
  });
  return <CourseGrid data={courses} />;
}`,
    quizQuestion: {
      question: 'What is the primary architectural advantage of React 19 Server Components in Next.js 15?',
      options: [
        'They run in the browser to reduce server CPU load',
        'Zero bundle size footprint on the client while streaming HTML',
        'They automatically convert all SQL queries to REST endpoints',
        'They replace CSS stylesheets with JSON objects',
      ],
      correctIndex: 1,
      explanation: 'Correct! Server Components execute on the server, leaving 0kB of client JavaScript bundle size and streaming rendered HTML directly.',
    },
    mentorAdvice:
      '"Focus heavily on data colocation: fetch only what your Server Component requires, and push client interactivity to leaf components."',
    mindmapNodes: ['Root: Next.js 15', 'RSC Architecture', 'Streaming SSR', 'Neon PostgreSQL', 'Server Actions'],
  },

  'Quantum Computing': {
    title: 'Quantum Information & Qubit Architecture',
    duration: '6 Weeks',
    level: 'Advanced',
    modules: [
      '1. Superposition & Dirac Notation State Vectors',
      '2. Quantum Entanglement & Bell State Pairs',
      '3. Unitary Quantum Gates (Hadamard, CNOT, Phase)',
      '4. Shor & Grover Algorithm Foundations',
    ],
    sampleNote:
      'Unlike classical bits restricted to states |0⟩ or |1⟩, a qubit occupies a linear superposition |ψ⟩ = α|0⟩ + β|1⟩, where |α|² + |β|² = 1. Measurement collapses this probabilistic state onto a classical basis.',
    codeSnippet: `# Qiskit Circuit Construction
from qiskit import QuantumCircuit
qc = QuantumCircuit(2, 2)
qc.h(0)         # Hadamard gate -> Superposition
qc.cx(0, 1)     # CNOT gate -> Entanglement Bell state
qc.measure([0, 1], [0, 1])`,
    quizQuestion: {
      question: 'Applying a Hadamard (H) gate to a pure ground state |0⟩ results in which quantum state?',
      options: [
        'An absolute deterministic bit flip to |1⟩',
        'An equal superposition state (|0⟩ + |1⟩) / √2',
        'An irreversible quantum decoherence collapse',
        'A phase shift rotation of π/4 radians',
      ],
      correctIndex: 1,
      explanation: 'Exact! The Hadamard transformation creates the symmetric equal superposition state (|0⟩ + |1⟩) / √2.',
    },
    mentorAdvice:
      '"Visualize quantum states on the Bloch sphere! The Hadamard gate is simply a 180-degree rotation around the X+Z diagonal axis."',
    mindmapNodes: ['Root: Quantum Computing', 'Qubits & Superposition', 'Bloch Sphere', 'Entanglement', 'Quantum Algorithms'],
  },

  'System Design & Kafka': {
    title: 'High-Scale Distributed Architecture with Apache Kafka',
    duration: '5 Weeks',
    level: 'Advanced',
    modules: [
      '1. Event-Driven Architecture & Log Partitioning',
      '2. Producer Idempotence & Exactly-Once Semantics (EOS)',
      '3. Consumer Groups, Rebalancing & Backpressure',
      '4. Multi-Region Replication & Fault-Tolerant Storage',
    ],
    sampleNote:
      'Kafka treats data streams as immutable, partitioned append-only commit logs. Consumers maintain their own partition offsets, enabling non-blocking, multi-subscriber horizontal throughput exceeding millions of events per second.',
    codeSnippet: `// Kafka Producer with Idempotence
const producer = kafka.producer({
  idempotent: true,
  maxInFlightRequests: 1,
  transactionTimeout: 30000
});
await producer.send({
  topic: 'user-telemetry',
  messages: [{ key: userId, value: JSON.stringify(payload) }]
});`,
    quizQuestion: {
      question: 'How does Kafka guarantee strict message order across high-throughput workloads?',
      options: [
        'By enforcing a single consumer globally across all topics',
        'Messages are strictly ordered within an individual partition',
        'By running a distributed consensus vote on every single message',
        'Order is not guaranteed in Kafka under any configuration',
      ],
      correctIndex: 1,
      explanation: 'Right! Total ordering is strictly guaranteed within a specific partition using the partition key.',
    },
    mentorAdvice:
      '"Always partition your events by a high-cardinality business key like user_id to prevent partition skew and hot brokers."',
    mindmapNodes: ['Root: Distributed Systems', 'Immutable Commit Log', 'Partition Keys', 'Consumer Groups', 'Exactly-Once Semantics'],
  },
};

export default function InteractiveSimulator() {
  const [selectedTopic, setSelectedTopic] = useState('Full-Stack Next.js 15');
  const [activeTab, setActiveTab] = useState<'syllabus' | 'quiz' | 'mentor' | 'mindmap'>('syllabus');
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);

  const current = PRESET_TOPICS[selectedTopic];

  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
    setSelectedQuizAnswer(null);
  };

  return (
    <section id="simulator" className="lp-section">
      <div className="lp-section-header">
        <span className="lp-section-tag">Interactive Sandbox</span>
        <h2 className="lp-section-title">
          Experience Autonomous Course Synthesis in Real Time
        </h2>
        <p className="lp-section-desc">
          Click any preset topic below to watch how NexLearn instantly constructs an academic syllabus,
          generates theory notes, prepares adaptive quizzes, and engages your AI mentor.
        </p>
      </div>

      <div className="lp-simulator-wrapper">
        {/* Preset Topic Chips */}
        <div className="lp-prompt-chips" style={{ justifyContent: 'center' }}>
          {Object.keys(PRESET_TOPICS).map((topic) => (
            <button
              key={topic}
              onClick={() => handleTopicChange(topic)}
              className={`lp-chip ${selectedTopic === topic ? 'active' : ''}`}
            >
              <span>✦ {topic}</span>
            </button>
          ))}
        </div>

        {/* macOS-style Window Frame */}
        <div className="lp-simulator-window">
          {/* Header Bar */}
          <div className="lp-window-header">
            <div className="lp-window-dots">
              <div className="lp-window-dot lp-dot-red" />
              <div className="lp-window-dot lp-dot-yellow" />
              <div className="lp-window-dot lp-dot-green" />
            </div>

            <div className="lp-window-title">
              <span>🔒 nexlearn.ai/courses/preview/{selectedTopic.toLowerCase().replace(/[^a-z0-9]/g, '-')}</span>
            </div>

            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>●</span> LIVE ENGINE
            </div>
          </div>

          {/* Simulator Content Area */}
          <div className="lp-simulator-body">
            {/* Course Title and Meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--lp-card-border)', paddingBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {current.level} Level &bull; {current.duration}
                </span>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--lp-text-primary)', marginTop: '4px' }}>
                  {current.title}
                </h3>
              </div>

              <Link
                href={`/generate?topic=${encodeURIComponent(selectedTopic)}`}
                className="lp-btn lp-btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                <span>Launch Full Course</span>
                <span>→</span>
              </Link>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--lp-card-border)', paddingBottom: '12px', marginBottom: '24px', overflowX: 'auto' }}>
              <button
                onClick={() => setActiveTab('syllabus')}
                className={`lp-chip ${activeTab === 'syllabus' ? 'active' : ''}`}
                style={{ borderRadius: '8px', padding: '8px 16px' }}
              >
                📖 Modules &amp; Theory
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`lp-chip ${activeTab === 'quiz' ? 'active' : ''}`}
                style={{ borderRadius: '8px', padding: '8px 16px' }}
              >
                ✍️ Smart Quiz Card
              </button>
              <button
                onClick={() => setActiveTab('mentor')}
                className={`lp-chip ${activeTab === 'mentor' ? 'active' : ''}`}
                style={{ borderRadius: '8px', padding: '8px 16px' }}
              >
                🎙️ AI Mentor Audio
              </button>
              <button
                onClick={() => setActiveTab('mindmap')}
                className={`lp-chip ${activeTab === 'mindmap' ? 'active' : ''}`}
                style={{ borderRadius: '8px', padding: '8px 16px' }}
              >
                🗺️ Concept Graph
              </button>
            </div>

            {/* Tab 1: Syllabus & Theory */}
            {activeTab === 'syllabus' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', animation: 'fadeIn 0.3s ease-out' }}>
                <div style={{ background: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: '14px', border: '1px solid var(--lp-card-border)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', color: '#818CF8' }}>
                    📑 Structured Syllabus Plan
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {current.modules.map((mod, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: i === 0 ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255,255,255,0.03)',
                          border: i === 0 ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--lp-card-border)',
                          fontSize: '0.88rem',
                          fontWeight: i === 0 ? 600 : 500,
                          color: i === 0 ? '#A5B4FC' : 'var(--lp-text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span>{i === 0 ? '▶' : '○'}</span>
                        <span>{mod}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: '14px', border: '1px solid var(--lp-card-border)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: '#10B981' }}>
                    💡 Synthesized Theory (Module 1)
                  </h4>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.65', color: 'var(--lp-text-secondary)', marginBottom: '16px' }}>
                    {current.sampleNote}
                  </p>

                  {current.codeSnippet && (
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--lp-text-muted)', textTransform: 'uppercase' }}>
                        Code Demonstration
                      </span>
                      <pre
                        style={{
                          background: '#0B0F17',
                          color: '#38BDF8',
                          padding: '14px',
                          borderRadius: '10px',
                          fontSize: '0.8rem',
                          overflowX: 'auto',
                          marginTop: '6px',
                          border: '1px solid rgba(255,255,255,0.06)',
                          fontFamily: 'monospace',
                        }}
                      >
                        {current.codeSnippet}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Smart Quiz */}
            {activeTab === 'quiz' && (
              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '24px', borderRadius: '16px', border: '1px solid var(--lp-card-border)', animation: 'fadeIn 0.3s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase' }}>
                    AI Knowledge Check &bull; 100 XP
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--lp-text-muted)' }}>Question 1 of 5</span>
                </div>

                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px', color: 'var(--lp-text-primary)' }}>
                  {current.quizQuestion.question}
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  {current.quizQuestion.options.map((opt, i) => {
                    const isSelected = selectedQuizAnswer === i;
                    const isCorrect = i === current.quizQuestion.correctIndex;
                    let bgColor = 'rgba(255,255,255,0.04)';
                    let borderColor = 'var(--lp-card-border)';
                    let textColor = 'var(--lp-text-primary)';

                    if (selectedQuizAnswer !== null) {
                      if (isCorrect) {
                        bgColor = 'rgba(16, 185, 129, 0.15)';
                        borderColor = '#10B981';
                        textColor = '#10B981';
                      } else if (isSelected) {
                        bgColor = 'rgba(239, 68, 68, 0.15)';
                        borderColor = '#EF4444';
                        textColor = '#EF4444';
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedQuizAnswer(i)}
                        style={{
                          padding: '14px 18px',
                          borderRadius: '12px',
                          background: bgColor,
                          border: `1px solid ${borderColor}`,
                          color: textColor,
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span style={{ fontWeight: 700, marginRight: '8px' }}>
                          {String.fromCharCode(65 + i)}.
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {selectedQuizAnswer !== null && (
                  <div
                    style={{
                      padding: '16px 20px',
                      borderRadius: '12px',
                      background: selectedQuizAnswer === current.quizQuestion.correctIndex ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      border: `1px solid ${selectedQuizAnswer === current.quizQuestion.correctIndex ? '#10B981' : '#F59E0B'}`,
                      fontSize: '0.9rem',
                      lineHeight: '1.6',
                      color: selectedQuizAnswer === current.quizQuestion.correctIndex ? '#10B981' : '#F59E0B',
                    }}
                  >
                    <strong>{selectedQuizAnswer === current.quizQuestion.correctIndex ? '🎯 Spot on!' : '💡 Explanation:'}</strong>{' '}
                    {current.quizQuestion.explanation}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: AI Mentor */}
            {activeTab === 'mentor' && (
              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '30px', borderRadius: '16px', border: '1px solid var(--lp-card-border)', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', animation: 'fadeIn 0.3s ease-out' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--lp-accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'white', flexShrink: 0 }}>
                  🤖
                </div>

                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--lp-text-primary)' }}>
                      NexLearn AI Mentor
                    </span>
                    <div className="lp-soundwave">
                      <div className="lp-soundwave-bar" />
                      <div className="lp-soundwave-bar" />
                      <div className="lp-soundwave-bar" />
                      <div className="lp-soundwave-bar" />
                      <div className="lp-soundwave-bar" />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>Active Speaking</span>
                  </div>

                  <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--lp-text-secondary)', fontStyle: 'italic', background: 'rgba(99, 102, 241, 0.08)', padding: '14px 18px', borderRadius: '12px', borderLeft: '4px solid #6366F1' }}>
                    {current.mentorAdvice}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 4: Mind Map */}
            {activeTab === 'mindmap' && (
              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '30px', borderRadius: '16px', border: '1px solid var(--lp-card-border)', textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#06B6D4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Neural Knowledge Graph
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '24px' }}>
                  {current.mindmapNodes.map((node, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px 20px',
                        borderRadius: '30px',
                        background: i === 0 ? 'var(--lp-accent-gradient)' : 'rgba(99, 102, 241, 0.1)',
                        border: i === 0 ? 'none' : '1px solid rgba(99, 102, 241, 0.3)',
                        color: i === 0 ? '#FFFFFF' : '#A5B4FC',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        boxShadow: i === 0 ? '0 4px 20px rgba(99, 102, 241, 0.4)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{i === 0 ? '🧠' : '↳'}</span>
                      <span>{node}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
