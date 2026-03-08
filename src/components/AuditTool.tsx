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

  useEffect(() => {
    setMounted(true);
  }, []);

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
    setIsUnlocked(false);

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

  const reportModal = report ? (
    <div 
      key={report.timestamp}
      className="fixed inset-0 z-[9999] bg-zinc-950/90 backdrop-blur-md overflow-y-auto pt-10 pb-20 px-4"
      onClick={closeReport}
    >
      <button 
        onClick={closeReport}
        className="fixed top-6 right-6 z-[10000] p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full border border-zinc-700 transition-all shadow-xl"
      >
        ✕
      </button>

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
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Score</span>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Conversion Diagnostic</h2>
            <p className="text-zinc-500 font-mono text-xs truncate max-w-md">{report.url}</p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-500/20">{passedCount} Passed</span>
              <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-500/20">{failedCount} Potential Risks</span>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-20">
          
          {/* 01: Summary */}
          <section>
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="text-cyan-400 font-mono">01</span> Performance Overview
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-4 opacity-60">Competitive Strengths</div>
                {strengths.map(s => (
                  <div key={s.ruleId} className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 text-sm text-zinc-300 flex items-start gap-3">
                    <span className="text-green-400">✓</span> {allRules.find(r => r.id === (s.ruleId.split('-ref-')[0]))?.title}
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4 opacity-60">Conversion Leakage</div>
                {weaknesses.map(w => (
                  <div key={w.ruleId} className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-sm text-zinc-300 flex items-start gap-3">
                    <span className="text-red-400">!</span> {allRules.find(r => r.id === (w.ruleId.split('-ref-')[0]))?.title}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 02: Visual Proof */}
          <section>
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="text-red-500 font-mono">02</span> Visual Proof: High-Impact Risks
            </h3>
            <div className="space-y-12">
              {weaknesses.map((res, i) => {
                const ruleId = res.ruleId.split('-ref-')[0];
                const rule = allRules.find(r => r.id === ruleId);
                return (
                  <div key={res.ruleId} className="grid md:grid-cols-2 gap-8 items-center bg-zinc-800/30 rounded-3xl overflow-hidden border border-zinc-800">
                    {/* The Screenshot Side */}
                    <div className="relative aspect-video bg-zinc-950 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-zinc-800">
                      {res.screenshot ? (
                        <img 
                          src={`data:image/jpeg;base64,${res.screenshot}`} 
                          alt="Audit Evidence" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-zinc-700 text-[10px] font-black uppercase tracking-widest animate-pulse">Analyzing Visual Patterns...</div>
                      )}
                      <div className="absolute top-4 left-4 px-2 py-1 bg-red-500 text-white text-[10px] font-black uppercase rounded shadow-lg">Friction Snapshot</div>
                    </div>

                    {/* The Logic Side */}
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-red-500/10 text-red-400 tracking-tighter">Critical Rank #{i+1}</span>
                        <span className="text-xs font-black text-zinc-600 uppercase">Impact: {100 - res.score}%</span>
                      </div>
                      <h4 className="text-xl font-black text-white mb-2 leading-tight">{rule?.title || 'Heuristic Failure'}</h4>
                      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{res.observation}</p>
                      <div className="p-4 rounded-xl bg-cyan-400/5 border border-cyan-400/20">
                        <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">HOUND Proposed Action</div>
                        <p className="text-sm text-cyan-100 italic leading-relaxed">"{res.recommendation}"</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 03: The Gate */}
          <section className="relative p-12 rounded-[2.5rem] bg-zinc-950 border-2 border-dashed border-zinc-800 text-center overflow-hidden">
            <div className="relative z-10">
              <div className="text-5xl mb-8">🔒</div>
              <h3 className="text-3xl font-black text-white mb-4 tracking-tight">+27 More Targeted Conversion Insights Locked</h3>
              <p className="text-zinc-500 text-base mb-10 max-w-lg mx-auto leading-relaxed">
                Our scan analyzed 30+ e-commerce heuristics on your site. Unlock the full technical roadmap including mobile performance and checkout leak analysis.
              </p>
              
              {!isUnlocked ? (
                <div className="max-w-md mx-auto space-y-4">
                  <input
                    type="email"
                    placeholder="Enter your business email"
                    className="w-full px-6 py-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:border-cyan-400 outline-none transition-all text-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button 
                    onClick={() => { if(email.includes('@')) setIsUnlocked(true) }}
                    className="w-full py-4 bg-cyan-400 text-zinc-950 font-black rounded-xl hover:bg-cyan-300 transition-all text-lg shadow-lg shadow-cyan-400/20 active:scale-[0.98]"
                  >
                    Receive Full Visual Roadmap
                  </button>
                </div>
              ) : (
                <div className="p-8 text-green-400 font-black border border-green-500/20 rounded-2xl bg-green-500/5 animate-pulse text-xl">
                  ✅ Complete Diagnostic Dispatched to Inbox
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="p-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-6 bg-zinc-950/50 rounded-b-3xl">
          <button onClick={closeReport} className="text-xs font-bold text-zinc-500 hover:text-white transition-colors">← Exit Audit</button>
          <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
            <span className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] hidden lg:block">Build a higher-converting experience</span>
            <a href="/contact" className="w-full md:w-auto text-center px-10 py-4 bg-white text-zinc-950 text-sm font-black rounded-xl hover:bg-zinc-200 transition-all">
              Talk to a Senior Expert
            </a>
          </div>
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
      {error && <p className="mt-3 text-red-400 text-sm text-center">{errorPrefix} {error}</p>}
      {mounted && typeof document !== 'undefined' && createPortal(reportModal, document.body)}
    </div>
  );
};

export default AuditTool;
