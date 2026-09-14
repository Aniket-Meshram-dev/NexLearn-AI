'use client';
import { useState } from 'react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does NexLearn generate personalized courses?',
      a: 'NexLearn integrates high-performance Groq Llama 3.3 (70B) and Google Gemini AI architectures. When you submit a topic and constraints (such as beginner, intermediate, or advanced), our pipelines construct an academic syllabus, generate comprehensive theory notes, embed code examples, formulate quizzes, and create visual concept graphs in seconds.',
    },
    {
      q: 'Is NexLearn free to get started?',
      a: 'Yes! You can create an account and generate full interactive courses completely free of charge. You get full access to interactive quizzes, flashcards, mindmaps, and voice mentorship.',
    },
    {
      q: 'How do the verified certificates work?',
      a: 'When you complete all modules in a course and achieve passing scores on all associated quizzes, NexLearn generates an official Certificate of Achievement featuring a cryptographic ID and tamper-proof validation metadata that you can download as a high-resolution PDF or share on LinkedIn.',
    },
    {
      q: 'Can I use NexLearn for non-programming topics?',
      a: 'Absolutely. While NexLearn excels at engineering and software concepts, it generates stellar courses in mathematics, physics, biology, history, philosophy, finance, language linguistics, and more.',
    },
    {
      q: 'How does the AI Mentor Voice feature work?',
      a: 'The AI Mentor leverages standard Web Speech APIs and custom conversational prompts to allow you to talk directly to an expert tutor while reading your module notes, receiving verbal analogies and real-time guidance.',
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="lp-section">
      <div className="lp-section-header">
        <span className="lp-section-tag">Common Inquiries</span>
        <h2 className="lp-section-title">Frequently Asked Questions</h2>
        <p className="lp-section-desc">
          Everything you need to know about NexLearn's architecture, intelligence engines, and certifications.
        </p>
      </div>

      <div className="lp-faq-container">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="lp-glass lp-faq-item"
              onClick={() => toggleFaq(i)}
              style={{
                borderColor: isOpen ? '#6366F1' : 'var(--lp-card-border)',
                background: isOpen ? 'rgba(99, 102, 241, 0.06)' : 'var(--lp-card-bg)',
              }}
            >
              <div className="lp-faq-question">
                <span>{faq.q}</span>
                <span className={`lp-faq-chevron ${isOpen ? 'open' : ''}`}>▼</span>
              </div>
              {isOpen && <div className="lp-faq-answer">{faq.a}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
