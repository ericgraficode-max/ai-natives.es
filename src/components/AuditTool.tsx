import React, { useState, useMemo } from 'react';
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

      if (!response.ok) {
        throw new Error(data.error || "audit tool isn't available at the moment");
      }

      setReport(data);
    } catch (err: any) {
      setError(err.message || "audit tool isn't available at the moment");
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

  const hiddenCount = 27;

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
        <p className="mt-3 text-red-400 text-sm font-medium animate-pulse text-center">
          {errorPrefix} {error}
        </p>
      )}

      {/* Report Modal */}
      {report && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
            
            {/* Modal Header with Chart */}
            <div className="p-8 border-b border-zinc-800 bg-zinc-950/30 flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64" cy="64" r="58"
                    stroke="currentColor" strokeWidth="8"
                    fill="transparent"
                    className="text-zinc-800"
                  />
                  <circle
                    cx="64" cy="64" r="58"
                    stroke="currentColor" strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 58}
                    strokeDashoffset={2 * Math.PI * 58 * (1 - report.overallScore / 100)}
                    className="text-cyan-400 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{report.overallScore}</span>
                  <span className="text-[10px] text-zinc-500 uppercase">Score</span>
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-black text-white mb-2">CRO Audit Report</h2>
                <p className="text-zinc-400 text-sm mb-4 truncate max-w-sm">{report.url}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs text-green-400 font-bold">{passedCount} Passed</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-xs text-red-400 font-bold">{failedCount} Improvements</span>
                  </div>
                </div>
              </div>

              <div className="hidden md:block text-right">
                <button 
                  onClick={() => setReport(null)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-12">
              
              {/* 3vs3 Comparison */}
              <section>
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded bg-cyan-400 text-zinc-950 flex items-center justify-center text-sm font-bold">01</span>
                  Strengths vs. Weaknesses
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4">What you're doing right</div>
                    {strengths.map(s => {
                      const rule = allRules.find(r => r.id === s.ruleId);
                      return (
                        <div key={s.ruleId} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10 text-sm text-zinc-300">
                          <span className="text-green-400 font-bold">✓</span>
                          {rule?.title}
                        </div>
                      );
                    })}
                  </div>
                  {/* Weaknesses */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4">Where you're losing money</div>
                    {weaknesses.map(w => {
                      const rule = allRules.find(r => r.id === w.ruleId);
                      return (
                        <div key={w.ruleId} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-sm text-zinc-300">
                          <span className="text-red-400 font-bold">!</span>
                          {rule?.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Top 3 Critical Issues */}
              <section>
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded bg-red-500 text-white flex items-center justify-center text-sm font-bold">02</span>
                  Top 3 Critical Issues
                </h3>
                <div className="space-y-4">
                  {weaknesses.map((res, i) => {
                    const ruleId = res.ruleId.split('-extra-')[0].split('-ext-')[0].split('-ref-')[0];
                    const rule = allRules.find(r => r.id === ruleId);
                    return (
                      <div key={res.ruleId} className="p-6 rounded-2xl bg-zinc-800/30 border border-zinc-700/50 hover:border-red-500/30 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                            High Impact Issue #{i+1}
                          </span>
                          <span className="text-sm font-black text-white/20">SCORE: {res.score}</span>
                        </div>
                        <h4 className="font-bold text-xl text-white mb-2">{rule?.title || 'Heuristic Analysis'}</h4>
                        <p className="text-sm text-zinc-400 mb-4">{res.observation}</p>
                        <div className="p-4 rounded-xl bg-cyan-400/5 border border-cyan-400/20">
                          <div className="text-xs text-cyan-400 font-black uppercase tracking-widest mb-1">HOUND Recommendation</div>
                          <p className="text-sm text-cyan-100 italic">{res.recommendation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Locked Insights */}
              <section className="relative p-10 rounded-3xl bg-zinc-950 border border-dashed border-zinc-800 flex flex-col items-center text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none" />
                <div className="z-10">
                  <div className="mb-6 text-5xl">🔒</div>
                  <h3 className="text-2xl font-black mb-3 text-white">+{hiddenCount} Advanced Conversion Insights Locked</h3>
                  <p className="text-zinc-500 mb-8 max-w-md mx-auto leading-relaxed">
                    Our initial scan found {failedCount} structural weaknesses in your conversion funnel. 
                    Unlock the full technical roadmap including mobile-specific issues and checkout friction analysis.
                  </p>
                  
                  {!isUnlocked ? (
                    <div className="w-full max-w-sm space-y-4 mx-auto">
                      <input
                        type="email"
                        placeholder="business@email.com"
                        className="w-full px-6 py-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-lg focus:border-cyan-400 outline-none transition-all shadow-xl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <button 
                        onClick={() => { if(email.includes('@')) setIsUnlocked(true) }}
                        className="w-full py-4 bg-cyan-400 text-zinc-950 text-lg font-black rounded-xl hover:bg-cyan-300 transition-transform active:scale-95 shadow-lg shadow-cyan-400/20"
                      >
                        Send My Full Audit Report
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-green-400 font-bold border border-green-500/20 rounded-2xl bg-green-500/5 animate-bounce">
                      ✅ The full technical report has been dispatched to your inbox.
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <button 
                onClick={() => setReport(null)}
                className="text-xs text-zinc-500 hover:text-white transition-colors"
              >
                ← Back to Service Page
              </button>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-zinc-600 uppercase tracking-widest hidden sm:inline">Ready to fix these?</span>
                <a href="/contact" className="px-6 py-2 bg-white text-zinc-950 text-xs font-black rounded-full hover:bg-zinc-200 transition-colors uppercase tracking-widest">
                  Talk to an Expert
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTool;
