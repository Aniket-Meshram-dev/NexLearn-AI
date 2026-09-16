'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Lock,
  BookOpen,
  HelpCircle,
  Mic,
  Network,
  Lightbulb,
  CheckCircle2,
  Brain,
  CornerDownRight,
  ArrowRight,
  ClipboardList,
  Sparkles,
  Layers,
  RotateCw,
  Compass,
  Code2,
  Zap,
  Check,
} from 'lucide-react';

interface PersonaAdvices {
  socrates: string;
  ada: string;
  maya: string;
  ethan: string;
}

interface FlashcardData {
  front: string;
  back: string;
  hint: string;
  interval: string;
}

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
  mentorAdvices: PersonaAdvices;
  mindmapNodes: string[];
  flashcard: FlashcardData;
}

const PERSONAS = [
  { id: 'ada', name: 'Ada', title: 'Code & Architecture', icon: Code2, color: '#38BDF8' },
  { id: 'socrates', name: 'Socrates', title: 'Critical Inquiry', icon: Compass, color: '#A5B4FC' },
  { id: 'maya', name: 'Maya', title: 'Conceptual Guide', icon: Sparkles, color: '#F472B6' },
  { id: 'ethan', name: 'Ethan', title: 'Production Velocity', icon: Zap, color: '#F59E0B' },
] as const;

type PersonaId = typeof PERSONAS[number]['id'];

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
    mentorAdvices: {
      ada: '"Focus strictly on data colocation: fetch exclusively inside your Server Component, stream via Suspense boundaries, and push DOM interactivity to leaf components."',
      socrates: '"Why should browser clients re-execute layout reconciliation for immutable data? Consider the fundamental boundary between server data and client state."',
      maya: '"Think of Server Components as a top-tier kitchen preparing ready-to-eat dishes, while client components are the utensils the diner uses to interact!"',
      ethan: '"Ship faster with Server Actions. Cut the boilerplate API routes, handle mutations directly, and let Turbopack power your rapid dev loop."',
    },
    mindmapNodes: ['Root: Next.js 15', 'RSC Architecture', 'Streaming SSR', 'Neon PostgreSQL', 'Server Actions'],
    flashcard: {
      front: 'What is the primary runtime difference between Server Components and Client Components?',
      back: 'Server Components execute only on the server, producing zero client JavaScript bundle overhead. Client Components ("use client") hydrate on the browser to attach event listeners and interactive state.',
      hint: 'Think about bundle weight vs interactivity.',
      interval: 'Next review in 3 days • Leitner Level 2',
    },
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
    mentorAdvices: {
      ada: '"Always trace your unitary transformations on the Bloch sphere. The Hadamard gate rotates 180 degrees around the X+Z diagonal axis."',
      socrates: '"Does a qubit exist in all states before observation, or does measurement force a probabilistic consensus onto reality?"',
      maya: '"Do not be intimidated by complex amplitudes! Superposition is simply waves creating constructive and destructive interference."',
      ethan: '"Focus on algorithmic speedups: Grover gives quadratic acceleration for unstructured search, while Shor gives exponential speedup on factoring."',
    },
    mindmapNodes: ['Root: Quantum Computing', 'Qubits & Superposition', 'Bloch Sphere', 'Entanglement', 'Quantum Algorithms'],
    flashcard: {
      front: 'What does applying a Hadamard (H) gate to the ground state |0⟩ achieve?',
      back: 'It creates an equal superposition state: (|0⟩ + |1⟩) / √2, where measuring the qubit yields |0⟩ or |1⟩ with exactly 50% probability each.',
      hint: 'Recall the normalized probability equation.',
      interval: 'Next review in 4 days • Leitner Level 3',
    },
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
    mentorAdvices: {
      ada: '"Partition by high-cardinality keys (like user_id). Never rely on default round-robin if message ordering between related states is critical."',
      socrates: '"When network partitions separate distributed replicas, which guarantees do you sacrifice: real-time availability or strict consistency?"',
      maya: '"Think of Kafka as a bookstore checkout line: each cashier processes one customer at a time in order, while multiple lines operate in parallel!"',
      ethan: '"Turn on idempotent producers and configure min.insync.replicas=2. That eliminates duplicate event retries in production with zero downtime."',
    },
    mindmapNodes: ['Root: Distributed Systems', 'Immutable Commit Log', 'Partition Keys', 'Consumer Groups', 'Exactly-Once Semantics'],
    flashcard: {
      front: 'How is message order guaranteed in Apache Kafka?',
      back: 'Ordering is guaranteed strictly within an individual partition. Messages with the same partition key always land in the same partition and are read sequentially by consumer offsets.',
      hint: 'Scope of ordering: topic-wide vs partition-wide.',
      interval: 'Next review in 5 days • Leitner Level 3',
    },
  },

  'Cybersecurity & Zero Trust': {
    title: 'Offensive Security, Zero-Trust Architecture & Cloud Defense',
    duration: '5 Weeks',
    level: 'Advanced',
    modules: [
      '1. Threat Modeling & OWASP Top 10 Exploitation',
      '2. Identity & Access Management (IAM) Least Privilege',
      '3. Network Packet Analysis & TLS Decryption Inspection',
      '4. Zero-Trust Microsegmentation & Incident Response',
    ],
    sampleNote:
      'Zero Trust architecture operates under the assumption that threats already exist inside the network perimeter. Every request must be explicitly authenticated, contextually authorized, and encrypted end-to-end with ephemeral tokens.',
    codeSnippet: `// Cryptographic Constant-Time Signature Validation
import crypto from 'crypto';

export function verifyHmac(payload: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}`,
    quizQuestion: {
      question: 'What is the primary security objective of using timingSafeEqual when verifying cryptographic signature hashes?',
      options: [
        'To speed up CPU processing using hardware SIMD registers',
        'To prevent timing side-channel attacks by maintaining constant execution time',
        'To automatically compress symmetric encryption keys in memory',
        'To enforce cross-origin resource sharing (CORS) rules',
      ],
      correctIndex: 1,
      explanation: 'Spot on! Regular string equality exits at the first mismatching byte, leaking timing clues to attackers. Constant-time comparison neutralizes timing attacks.',
    },
    mentorAdvices: {
      ada: '"Never use basic string comparisons for HMACs or session tokens. Timing side-channels can leak byte-by-byte secrets over network jitter."',
      socrates: '"If internal network perimeters can always be bypassed by compromised credentials, what does \'trust\' actually signify?"',
      maya: '"Security starts with consistent good habits: automated secret scanning, MFA enforcement, and least-privilege tokens before complex intrusion tools!"',
      ethan: '"Assume breach by default. Implement automated SIEM alerts, container microsegmentation, and ephemeral short-lived access credentials."',
    },
    mindmapNodes: ['Root: Zero Trust', 'Perimeter Elimination', 'Cryptographic Proofs', 'Least Privilege IAM', 'Continuous Telemetry'],
    flashcard: {
      front: 'What is the fundamental philosophy of Zero Trust Architecture (ZTA)?',
      back: '"Never Trust, Always Verify." Regardless of whether an access request originates inside or outside the corporate network, it must be explicitly authenticated, authorized, and encrypted.',
      hint: 'Perimeter defense vs continuous verification.',
      interval: 'Next review in 2 days • Leitner Level 1',
    },
  },
};

export default function InteractiveSimulator() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [selectedTopic, setSelectedTopic] = useState('Full-Stack Next.js 15');
  const [activeTab, setActiveTab] = useState<'syllabus' | 'quiz' | 'flashcards' | 'mentor' | 'mindmap'>('syllabus');
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [activePersona, setActivePersona] = useState<PersonaId>('ada');
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [srsFeedback, setSrsFeedback] = useState<string | null>(null);

  const current = PRESET_TOPICS[selectedTopic];
  const courseUrl = `/generate?topic=${encodeURIComponent(selectedTopic)}`;
  const launchHref = isAuthenticated 
    ? courseUrl 
    : `/register?callbackUrl=${encodeURIComponent(courseUrl)}`;

  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
    setSelectedQuizAnswer(null);
    setFlashcardFlipped(false);
    setSrsFeedback(null);
  };

  const handleSrsRate = (label: string, days: number) => {
    setSrsFeedback(`Recorded as "${label}"! Next review scheduled in ${days} day${days > 1 ? 's' : ''}.`);
    setTimeout(() => setSrsFeedback(null), 4000);
  };

  const currentPersonaObj = PERSONAS.find((p) => p.id === activePersona) || PERSONAS[0];
  const PersonaIcon = currentPersonaObj.icon;

  return (
    <section id="simulator" className="lp-section">
      <div className="lp-section-header">
        <span className="lp-section-tag">Interactive Sandbox</span>
        <h2 className="lp-section-title">
          Experience Autonomous Course Synthesis in Real Time
        </h2>
        <p className="lp-section-desc">
          Click any preset topic below to watch how NexLearn instantly constructs an academic syllabus,
          generates theory notes, prepares adaptive quizzes, spaced flashcards, and engages your AI mentor.
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
              <Sparkles size={13} style={{ marginRight: 4, display: 'inline' }} />
              <span>{topic}</span>
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

            <div className="lp-window-title" style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              <Lock size={12} opacity={0.7} />
              <span>nexlearn.ai/courses/preview/{selectedTopic.toLowerCase().replace(/[^a-z0-9]/g, '-')}</span>
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
                href={launchHref}
                className="lp-btn lp-btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span>Launch Full Course</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--lp-card-border)', paddingBottom: '12px', marginBottom: '24px', overflowX: 'auto' }}>
              <button
                onClick={() => setActiveTab('syllabus')}
                className={`lp-chip ${activeTab === 'syllabus' ? 'active' : ''}`}
                style={{ borderRadius: '8px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <BookOpen size={15} />
                <span>Modules &amp; Theory</span>
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`lp-chip ${activeTab === 'quiz' ? 'active' : ''}`}
                style={{ borderRadius: '8px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <HelpCircle size={15} />
                <span>Smart Quiz</span>
              </button>
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`lp-chip ${activeTab === 'flashcards' ? 'active' : ''}`}
                style={{ borderRadius: '8px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Layers size={15} />
                <span>Active Recall Flashcards</span>
              </button>
              <button
                onClick={() => setActiveTab('mentor')}
                className={`lp-chip ${activeTab === 'mentor' ? 'active' : ''}`}
                style={{ borderRadius: '8px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Mic size={15} />
                <span>Multi-Persona AI Mentor</span>
              </button>
              <button
                onClick={() => setActiveTab('mindmap')}
                className={`lp-chip ${activeTab === 'mindmap' ? 'active' : ''}`}
                style={{ borderRadius: '8px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Network size={15} />
                <span>Concept Graph</span>
              </button>
            </div>

            {/* Tab 1: Syllabus & Theory */}
            {activeTab === 'syllabus' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', animation: 'fadeIn 0.3s ease-out' }}>
                <div style={{ background: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: '14px', border: '1px solid var(--lp-card-border)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', color: '#818CF8' }}>
                    <ClipboardList size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} /> Structured Syllabus Plan
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
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: '#10B981', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lightbulb size={17} />
                    <span>Synthesized Theory (Module 1)</span>
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
                    AI Knowledge Check &bull; +100 XP
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
                    <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {selectedQuizAnswer === current.quizQuestion.correctIndex ? (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Spot on!</span>
                        </>
                      ) : (
                        <>
                          <Lightbulb size={16} />
                          <span>Explanation:</span>
                        </>
                      )}
                    </strong>{' '}
                    {current.quizQuestion.explanation}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Active Recall Flashcards */}
            {activeTab === 'flashcards' && (
              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '24px', borderRadius: '16px', border: '1px solid var(--lp-card-border)', animation: 'fadeIn 0.3s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818CF8', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Layers size={14} />
                    <span>Spaced Repetition Flashcard &bull; Leitner SRS</span>
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--lp-text-muted)' }}>
                    {current.flashcard.interval}
                  </span>
                </div>

                {/* Flip Card Container */}
                <div
                  onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                  style={{
                    minHeight: '190px',
                    padding: '28px',
                    borderRadius: '14px',
                    background: flashcardFlipped ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${flashcardFlipped ? '#6366F1' : 'var(--lp-card-border)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                  }}
                >
                  <span style={{ position: 'absolute', top: 12, right: 16, fontSize: '0.75rem', color: 'var(--lp-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <RotateCw size={12} />
                    <span>Click to flip</span>
                  </span>

                  {!flashcardFlipped ? (
                    <div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>
                        Front &bull; Prompt
                      </span>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--lp-text-primary)', maxWidth: '580px', lineHeight: '1.5' }}>
                        {current.flashcard.front}
                      </h4>
                      <p style={{ marginTop: 12, fontSize: '0.82rem', color: 'var(--lp-text-muted)' }}>
                        Hint: {current.flashcard.hint}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>
                        Back &bull; Verified Solution
                      </span>
                      <p style={{ fontSize: '1rem', lineHeight: '1.65', color: 'var(--lp-text-primary)', maxWidth: '620px' }}>
                        {current.flashcard.back}
                      </p>
                    </div>
                  )}
                </div>

                {/* Rating Buttons */}
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleSrsRate('Again', 1)}
                      className="lp-chip"
                      style={{ borderRadius: '8px', padding: '6px 14px', fontSize: '0.8rem', borderColor: '#EF4444', color: '#EF4444' }}
                    >
                      Again &bull; 1d
                    </button>
                    <button
                      onClick={() => handleSrsRate('Hard', 2)}
                      className="lp-chip"
                      style={{ borderRadius: '8px', padding: '6px 14px', fontSize: '0.8rem', borderColor: '#F59E0B', color: '#F59E0B' }}
                    >
                      Hard &bull; 2d
                    </button>
                    <button
                      onClick={() => handleSrsRate('Good', 4)}
                      className="lp-chip"
                      style={{ borderRadius: '8px', padding: '6px 14px', fontSize: '0.8rem', borderColor: '#38BDF8', color: '#38BDF8' }}
                    >
                      Good &bull; 4d
                    </button>
                    <button
                      onClick={() => handleSrsRate('Easy', 7)}
                      className="lp-chip"
                      style={{ borderRadius: '8px', padding: '6px 14px', fontSize: '0.8rem', borderColor: '#10B981', color: '#10B981' }}
                    >
                      Easy &bull; 7d
                    </button>
                  </div>

                  {srsFeedback && (
                    <div style={{ fontSize: '0.84rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Check size={14} />
                      <span>{srsFeedback}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 4: AI Mentor with Multi-Persona Switcher */}
            {activeTab === 'mentor' && (
              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '24px', borderRadius: '16px', border: '1px solid var(--lp-card-border)', animation: 'fadeIn 0.3s ease-out' }}>
                {/* Persona Switcher Chips */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: '20px', borderBottom: '1px solid var(--lp-card-border)', paddingBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--lp-text-muted)', textTransform: 'uppercase' }}>
                      Select Mentor Persona
                    </span>
                    <h5 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--lp-text-primary)' }}>
                      Adaptive Teaching Voice
                    </h5>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {PERSONAS.map((p) => {
                      const Icon = p.icon;
                      const isActive = activePersona === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setActivePersona(p.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            border: isActive ? `1px solid ${p.color}` : '1px solid var(--lp-card-border)',
                            background: isActive ? `${p.color}22` : 'rgba(255,255,255,0.03)',
                            color: isActive ? p.color : 'var(--lp-text-secondary)',
                          }}
                        >
                          <Icon size={13} />
                          <span>{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Persona Advice Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${currentPersonaObj.color}, #4F46E5)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      flexShrink: 0,
                      boxShadow: `0 4px 20px ${currentPersonaObj.color}44`,
                    }}
                  >
                    <PersonaIcon size={28} />
                  </div>

                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--lp-text-primary)' }}>
                        {currentPersonaObj.name} &bull; <span style={{ fontSize: '0.85rem', color: currentPersonaObj.color }}>{currentPersonaObj.title}</span>
                      </span>
                      <div className="lp-soundwave">
                        <div className="lp-soundwave-bar" style={{ background: currentPersonaObj.color }} />
                        <div className="lp-soundwave-bar" style={{ background: currentPersonaObj.color }} />
                        <div className="lp-soundwave-bar" style={{ background: currentPersonaObj.color }} />
                        <div className="lp-soundwave-bar" style={{ background: currentPersonaObj.color }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>Active Voice TTS</span>
                    </div>

                    <p
                      style={{
                        fontSize: '0.95rem',
                        lineHeight: '1.65',
                        color: 'var(--lp-text-secondary)',
                        fontStyle: 'italic',
                        background: 'rgba(99, 102, 241, 0.08)',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        borderLeft: `4px solid ${currentPersonaObj.color}`,
                      }}
                    >
                      {current.mentorAdvices[activePersona]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Mind Map */}
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
                      {i === 0 ? <Brain size={16} /> : <CornerDownRight size={14} />}
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
