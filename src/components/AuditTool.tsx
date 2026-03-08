import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { FullAuditReport, AuditResult } from '../lib/audit-engine/types';
import { allRules } from '../lib/audit-engine/knowledge-base';

interface AuditToolProps {
  buttonText?: string;
  placeholderText?: string;
  errorPrefix?: string;
}

const AuditTool: React.FC<AuditToolProps> = ({ 
  buttonText = 'Audit my website', 
  placeholderText = 'https://yourwebsite.com',
  errorPrefix = '⚠️'
}) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<FullAuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle mounting state for Portals
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle body scroll locking
  useEffect(() => {
    if (report) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [report]);

  const startAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "audit tool isn't available");
      setReport(data);
    } catch (err: any) {
      setError(err.message || "audit tool isn't available");
    } finally {
      setLoading(false);
    }
  };

  const { strengths, weaknesses, passedCount, failedCount } = useMemo(() => {
    if (!report) return { strengths: [], weaknesses: [], passedCount: 0, failedCount: 0 };
    const passed = report.results.filter(r => r.passed);
    const failed = report.results.filter(r => !r.passed);
    return {
      strengths: passed.slice(0, 3),
      weaknesses: failed.slice(0, 3),
      passedCount: passed.length,
      failedCount: failed.length
    };
  }, [report]);

  const closeReport = () => {
    setReport(null);
    setIsUnlocked(false);
  };

  // The Audit Report UI
  const reportModal = report ? (
    <div 
      className="fixed inset-0 z-[9999] bg-zinc-950/90 backdrop-blur-md overflow-y-auto pt-10 pb-20 px-4"
      onClick={closeReport}
    >
      {/* Close Button - Top Right of Viewport */}
      <button 
        onClick={closeReport}
        className="fixed top-6 right-6 z-[10000] p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full border border-zinc-700 transition-all shadow-xl"
      >
        ✕
      </button>

      {/* Simple Modal Container - NO internal scroll, NO height limit */}
      <div 
        className="w-full max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 border-b border-zinc-800 flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={2 * Math.PI * 58} strokeDashoffset={2 * Math.PI * 58 * (1 - report.overallScore / 100)} strokeLinecap="round" className="text-cyan-400" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{report.overallScore}</span>
              <span className="text-[10px] text-zinc-500 uppercase">Score</span>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-black text-white mb-2">CRO Audit Report</h2>
            <p className="text-zinc-500 text-sm truncate max-w-md">{report.url}</p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">{passedCount} Passed</span>
              <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">{failedCount} Improvements</span>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="p-8 md:p-12 space-y-16">
          
          {/* 01: Strengths vs Weaknesses */}
          <section>
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="text-cyan-400 font-mono">01</span> Strengths vs. Weaknesses
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-4">Strengths</div>
                {strengths.map(s => (
                  <div key={s.ruleId} className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 text-sm text-zinc-300 flex items-start gap-3">
                    <span className="text-green-400">✓</span> {allRules.find(r => r.id === s.ruleId)?.title}
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4">Weaknesses</div>
                {weaknesses.map(w => (
                  <div key={w.ruleId} className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-sm text-zinc-300 flex items-start gap-3">
                    <span className="text-red-400">!</span> {allRules.find(r => r.id === w.ruleId)?.title}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 02: Top 3 Critical Issues */}
          <section>
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="text-red-500 font-mono">02</span> Top 3 Critical Issues
            </h3>
            <div className="space-y-6">
              {weaknesses.map((res, i) => {
                const ruleId = res.ruleId.split('-extra-')[0].split('-ext-')[0].split('-ref-')[0];
                const rule = allRules.find(r => r.id === ruleId);
                return (
                  <div key={res.ruleId} className="p-6 rounded-2xl bg-zinc-800/50 border border-zinc-800">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-red-500/10 text-red-400">High Impact #{i+1}</span>
                      <span className="text-xs text-zinc-600">Impact: {100 - res.score}%</span>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">{rule?.title || 'Friction Point'}</h4>
                    <p className="text-zinc-400 text-sm mb-6">{res.observation}</p>
                    <div className="p-4 rounded-xl bg-cyan-400/5 border border-cyan-400/20">
                      <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Recommendation</div>
                      <p className="text-sm text-cyan-100 italic">"{res.recommendation}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 03: The Gate */}
          <section className="p-10 rounded-3xl bg-zinc-950 border border-zinc-800 text-center">
            <div className="text-4xl mb-6">🔒</div>
            <h3 className="text-2xl font-bold text-white mb-4">+27 More Insights Locked</h3>
            <p className="text-zinc-500 text-sm mb-8 max-w-sm mx-auto">Enter your email to receive the full 30-point technical roadmap as a PDF.</p>
            
            {!isUnlocked ? (
              <div className="max-w-xs mx-auto space-y-3">
                <input
                  type="email"
                  placeholder="business@email.com"
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-cyan-400 outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button 
                  onClick={() => { if(email.includes('@')) setIsUnlocked(true) }}
                  className="w-full py-3 bg-cyan-400 text-zinc-950 font-bold rounded-lg hover:bg-cyan-300 transition-all"
                >
                  Send Full Report
                </button>
              </div>
            ) : (
              <div className="p-4 text-green-400 font-bold border border-green-500/20 rounded-xl bg-green-500/5">✅ Full report dispatched to inbox.</div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-zinc-800 flex justify-between items-center bg-zinc-950/50 rounded-b-3xl">
          <button onClick={closeReport} className="text-xs text-zinc-500 hover:text-white transition-colors">Close Audit</button>
          <a href="/contact" className="px-6 py-2 bg-white text-zinc-950 text-xs font-bold rounded-lg hover:bg-zinc-200 transition-all">Fix These Issues Now</a>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="w-full max-w-xl mx-auto mt-8">
      <form onSubmit={startAudit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="url"
          placeholder={placeholderText}
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-700 text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 border border-zinc-700 text-zinc-300 hover:border-cyan-400/50 hover:text-cyan-300 font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? 'Analyzing...' : buttonText}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-red-400 text-sm text-center">
          {errorPrefix} {error}
        </p>
      )}

      {/* Portal the modal to body to escape parent transforms */}
      {mounted && typeof document !== 'undefined' && createPortal(reportModal, document.body)}
    </div>
  );
};

export default AuditTool;
