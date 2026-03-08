import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { FullAuditReport, AuditResult, AuditType } from '../lib/audit-engine/types';
import { allCroRules } from '../lib/audit-engine/knowledge-base/cro';
import { allAccessibilityRules } from '../lib/audit-engine/knowledge-base/accessibility';

interface AuditToolProps {
  buttonText?: string;
  placeholderText?: string;
  errorPrefix?: string;
  auditType?: AuditType;
}

const AuditTool: React.FC<AuditToolProps> = ({ 
  buttonText = 'Audit my website', 
  placeholderText = 'https://yourwebsite.com',
  errorPrefix = '⚠️',
  auditType = 'cro'
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

  const currentLang = useMemo(() => {
    if (typeof window === 'undefined') return 'en';
    const path = window.location.pathname;
    if (path.includes('/es/')) return 'es';
    if (path.includes('/de/')) return 'de';
    return 'en';
  }, [mounted]);

  const labels = {
    title: auditType === 'accessibility' 
      ? (currentLang === 'es' ? 'Reporte de Incumplimiento EAA' : currentLang === 'de' ? 'EAA-Compliance-Bericht' : 'EAA Non-Compliance Report')
      : (currentLang === 'es' ? 'Reporte de Auditoría CRO' : currentLang === 'de' ? 'CRO-Audit-Bericht' : 'Conversion Audit Report'),
    failLabel: auditType === 'accessibility' 
      ? (currentLang === 'es' ? 'Violaciones Detectadas' : currentLang === 'de' ? 'Gefundene Verstöße' : 'Violations Found')
      : (currentLang === 'es' ? 'Mejoras' : currentLang === 'de' ? 'Optimierung' : 'Improvements'),
    summaryTitle: auditType === 'accessibility' 
      ? (currentLang === 'es' ? 'Paisaje de Cumplimiento Legal' : currentLang === 'de' ? 'Rechtliche Compliance-Übersicht' : 'Compliance Landscape')
      : (currentLang === 'es' ? 'Fortalezas vs. Debilidades' : currentLang === 'de' ? 'Stärken vs. Schwächen' : 'Strengths vs. Weaknesses'),
    summaryFail: auditType === 'accessibility' 
      ? (currentLang === 'es' ? 'Riesgos de Demanda' : currentLang === 'de' ? 'Haftungsrisiken' : 'Litigation Risks')
      : (currentLang === 'es' ? 'Debilidades' : currentLang === 'de' ? 'Schwächen' : 'Weaknesses'),
    deepDiveTitle: auditType === 'accessibility'
      ? (currentLang === 'es' ? 'Evidencia Visual de Incumplimiento' : currentLang === 'de' ? 'Visueller Nachweis von Barrieren' : 'Visual Proof of Non-Compliance')
      : (currentLang === 'es' ? '3 Problemas Críticos' : currentLang === 'de' ? '3 kritische Probleme' : 'Top 3 Critical Issues'),
    gateTitle: auditType === 'accessibility' 
      ? (currentLang === 'es' ? 'Plan de Remediación EAA' : currentLang === 'de' ? 'EAA-Maßnahmenplan' : 'Technical Remediation Roadmap')
      : (currentLang === 'es' ? 'Plan Maestro de Optimización' : currentLang === 'de' ? 'Umsatz-Optimierungsprogramm' : 'Revenue-Optimization Playbook'),
  };

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
        body: JSON.stringify({ url, type: auditType, lang: currentLang })
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

  const activeRules = auditType === 'accessibility' ? allAccessibilityRules : allCroRules;

  const { strengths, weaknesses, passedCount, failedCount } = useMemo(() => {
    if (!report) return { strengths: [], weaknesses: [], passedCount: 0, failedCount: 0 };
    const passed = report.results.filter(r => r.passed);
    const failed = report.results.filter(r => !r.passed);
    return {
      strengths: auditType === 'accessibility' ? [] : passed.slice(0, 3),
      weaknesses: failed.slice(0, 3),
      passedCount: passed.length,
      failedCount: failed.length
    };
  }, [report, auditType]);

  const closeReport = () => {
    setReport(null);
    setIsUnlocked(false);
  };

  const getRiskStatus = () => {
    if (!report || auditType !== 'accessibility') return null;
    const score = report.overallScore;
    if (score < 30) return {
      label: currentLang === 'es' ? 'RIESGO CRÍTICO' : currentLang === 'de' ? 'KRITISCHES RISIKO' : 'CRITICAL RISK',
      color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/50', animate: 'animate-pulse'
    };
    if (score < 60) return {
      label: currentLang === 'es' ? 'RIESGO ALTO' : currentLang === 'de' ? 'HOHES RISIKO' : 'HIGH RISK',
      color: 'text-orange-500', bg: 'bg-orange-500/20', border: 'border-orange-500/50', animate: ''
    };
    return {
      label: currentLang === 'es' ? 'RIESGO MODERADO' : currentLang === 'de' ? 'MODERATES RISIKO' : 'MODERATE RISK',
      color: 'text-yellow-500', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', animate: ''
    };
  };

  const riskStatus = getRiskStatus();

  const reportModal = report ? (
    <div key={report.timestamp} className="fixed inset-0 z-[9999] bg-zinc-950/90 backdrop-blur-md overflow-y-auto pt-10 pb-20 px-4" onClick={closeReport}>
      <button onClick={closeReport} className="fixed top-6 right-6 z-[10000] p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full border border-zinc-700 transition-all shadow-xl">✕</button>

      <div className="w-full max-w-5xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-8 border-b border-zinc-800 flex flex-col md:flex-row items-center gap-8 bg-zinc-950/20">
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={2 * Math.PI * 58} strokeDashoffset={2 * Math.PI * 58 * (1 - report.overallScore / 100)} strokeLinecap="round" className={auditType === 'accessibility' ? (report.overallScore < 40 ? "text-red-600" : "text-orange-500") : "text-cyan-400"} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-black ${auditType === 'accessibility' ? 'text-red-500' : 'text-white'}`}>{report.overallScore}</span>
              <span className="text-[10px] text-zinc-500 uppercase font-bold">{auditType === 'accessibility' ? 'Risk' : 'Score'}</span>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
              <h2 className="text-3xl font-black text-white tracking-tight">{labels.title}</h2>
              {riskStatus && <div className={`${riskStatus.bg} ${riskStatus.color} ${riskStatus.border} ${riskStatus.animate} border px-3 py-1 rounded text-[10px] font-black tracking-widest`}>{riskStatus.label}</div>}
            </div>
            <p className="text-zinc-500 font-mono text-xs truncate max-w-md">{report.url}</p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
              {auditType !== 'accessibility' && <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-500/20">{passedCount} Passed</span>}
              <span className={`px-3 py-1 rounded-full ${auditType === 'accessibility' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'} text-[10px] font-black uppercase tracking-widest`}>
                {failedCount >= 50 ? '50+' : failedCount} {labels.failLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-20">
          {/* 01: Summary */}
          <section>
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <span className={auditType === 'accessibility' ? "text-red-500 font-mono" : "text-cyan-400 font-mono"}>01</span> {labels.summaryTitle}
            </h3>
            
            {auditType === 'accessibility' ? (
              <div className="grid md:grid-cols-3 gap-8 items-stretch">
                <div className="md:col-span-2 space-y-4">
                  <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4 opacity-60">{labels.summaryFail}</div>
                  <div className="flex flex-col gap-3">
                    {weaknesses.map(w => (
                      <div key={w.ruleId} className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-sm text-zinc-300 flex items-start gap-3">
                        <span className="text-red-400 font-bold">!</span> {w.observation.split(':')[0]}
                      </div>
                    ))}
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-3 animate-pulse">
                      <span className="text-lg">⚠</span> 
                      <span>{currentLang === 'es' ? `Más de 50 violaciones encontradas...` : currentLang === 'de' ? `Über 50 Verstöße gefunden...` : `More than 50 violations found...`}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 h-full flex flex-col justify-center">
                  <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4">Legal Consequences</div>
                  <div className="space-y-4 text-xs leading-relaxed">
                    <p className="text-zinc-300"><strong className="text-white">Fines:</strong> Up to €100,000 or 5% of annual turnover for EAA non-compliance.</p>
                    <p className="text-zinc-300"><strong className="text-white">Netflix:</strong> Settled major lawsuit over accessibility failures.</p>
                    <p className="text-zinc-300"><strong className="text-white">Domino's:</strong> Lost landmark battle over website accessibility standards.</p>
                    <div className="pt-2 text-red-400 font-bold uppercase tracking-tighter">Deadline: June 28, 2025</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <div className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-4 opacity-60">{currentLang === 'es' ? 'Fortalezas' : currentLang === 'de' ? 'Stärken' : 'Strengths'}</div>
                  {strengths.map(s => (
                    <div key={s.ruleId} className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 text-sm text-zinc-300 flex items-start gap-3">
                      <span className="text-green-400 font-bold">✓</span> {activeRules.find(r => r.id === s.ruleId.split('-ref-')[0])?.title}
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4 opacity-60">{currentLang === 'es' ? 'Debilidades' : currentLang === 'de' ? 'Schwächen' : 'Weaknesses'}</div>
                  {weaknesses.map(w => (
                    <div key={w.ruleId} className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-sm text-zinc-300 flex items-start gap-3">
                      <span className="text-red-400 font-bold">!</span> {activeRules.find(r => r.id === w.ruleId.split('-ref-')[0])?.title}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 02: Visual Proof */}
          <section>
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="text-red-500 font-mono">02</span> {labels.deepDiveTitle}
            </h3>
            <div className="space-y-12">
              {weaknesses.map((res, i) => (
                <div key={res.ruleId} className="grid md:grid-cols-2 gap-8 items-center bg-zinc-800/30 rounded-3xl overflow-hidden border border-zinc-800">
                  <div className="relative aspect-video bg-zinc-950 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-zinc-800">
                    {res.screenshot ? (
                      <img src={`data:image/jpeg;base64,${res.screenshot}`} alt="Audit Evidence" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-zinc-700 text-[10px] font-black uppercase tracking-widest animate-pulse">Analyzing Pattern...</div>
                    )}
                    <div className="absolute top-4 left-4 px-2 py-1 bg-red-500 text-white text-[10px] font-black uppercase rounded shadow-lg">{auditType === 'accessibility' ? 'WCAG VIOLATION' : 'Friction Snapshot'}</div>
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-red-500/10 text-red-400 tracking-tighter">{auditType === 'accessibility' ? 'Risk Level: High' : `Critical Rank #${i+1}`}</span>
                      <span className="text-xs font-black text-zinc-600 uppercase">Impact: {100 - res.score}%</span>
                    </div>
                    <h4 className="text-xl font-black text-white mb-2 leading-tight">
                      {auditType === 'accessibility' ? res.observation : (activeRules.find(r => r.id === res.ruleId.split('-ref-')[0])?.title || 'Diagnostic Point')}
                    </h4>
                    <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                      {auditType === 'accessibility' ? res.recommendation : res.observation}
                    </p>
                    <div className="p-4 rounded-xl bg-cyan-400/5 border border-cyan-400/20">
                      <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">HOUND Proposed Action</div>
                      <p className="text-sm text-cyan-100 italic leading-relaxed">
                        {auditType === 'accessibility' ? 'Immediate remediation required to meet EAA standards.' : `"${res.recommendation}"`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 03: The Gate */}
          <section className="relative p-12 rounded-[2.5rem] bg-zinc-950 border-2 border-dashed border-zinc-800 text-center overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center justify-center gap-3">
                <span className={auditType === 'accessibility' ? "text-red-500 font-mono" : "text-cyan-400 font-mono"}>03</span> {labels.gateTitle}
              </h3>
              <div className="text-5xl mb-8">🔒</div>
              <h3 className="text-3xl font-black text-white mb-4 tracking-tight">
                {auditType === 'accessibility' ? (currentLang === 'es' ? `+50 Violaciones Críticas Detectadas` : currentLang === 'de' ? `+50 Kritische Verstöße gefunden` : `+50 Critical Violations Found`) : labels.gateTitle}
              </h3>
              <p className="text-zinc-500 text-base mb-10 max-w-lg mx-auto leading-relaxed">
                {auditType === 'accessibility' 
                  ? (currentLang === 'es' ? `Nuestro escaneo detectó más de 50 violaciones en su sitio. Desbloquee la hoja de ruta completa para evitar sanciones legales bajo la EAA.` : currentLang === 'de' ? `Unser Scan hat über 50 Barrieren gefunden. Schalten Sie den Plan frei, um EAA-Sanktionen zu vermeiden.` : `Our scan found more than 50 violations. Unlock the full roadmap to avoid EAA legal sanctions.`)
                  : (currentLang === 'es' ? 'Nuestro escaneo detectó 27 oportunidades granulares para elevar su tasa de conversión. Ingrese su email para recibir la hoja de ruta completa.' : currentLang === 'de' ? 'Unser Scan hat 27 gezielte Möglichkeiten zur Steigerung Ihrer Conversion-Rate identifiziert.' : 'Our initial scan revealed 27 granular opportunities to lift your conversion rate.')}
              </p>
              
              {!isUnlocked ? (
                <div className="max-w-md mx-auto space-y-4">
                  <input type="email" placeholder="business@email.com" className="w-full px-6 py-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:border-cyan-400 outline-none transition-all text-lg" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <button onClick={() => { if(email.includes('@')) setIsUnlocked(true) }} className={auditType === 'accessibility' ? "w-full py-4 bg-red-500 text-white font-black rounded-xl hover:bg-red-400 transition-all text-lg shadow-lg shadow-red-500/20 active:scale-[0.98]" : "w-full py-4 bg-cyan-400 text-zinc-950 font-black rounded-xl hover:bg-cyan-300 transition-all text-lg shadow-lg shadow-cyan-400/20 active:scale-[0.98]"}>
                    {auditType === 'accessibility' ? (currentLang === 'es' ? 'Recibir Plan de Cumplimiento' : currentLang === 'de' ? 'Compliance-Plan erhalten' : 'Get Compliance Plan') : 'Receive Full Optimization Playbook'}
                  </button>
                </div>
              ) : (
                <div className="p-8 text-green-400 font-black border border-green-500/20 rounded-2xl bg-green-500/5 animate-pulse text-xl">✅ Roadmap Dispatched to Inbox</div>
              )}
            </div>
          </section>
        </div>

        <div className="p-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-6 bg-zinc-950/50 rounded-b-3xl">
          <button onClick={closeReport} className="text-xs font-bold text-zinc-500 hover:text-white transition-colors">← Exit Audit</button>
          <a href="/contact" className="px-10 py-4 bg-white text-zinc-950 text-sm font-black rounded-xl hover:bg-zinc-200 transition-all">Talk to a Senior Expert</a>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="w-full max-w-xl mx-auto mt-8">
      <form onSubmit={startAudit} className="flex flex-col sm:flex-row gap-3">
        <input type="url" placeholder={placeholderText} required value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1 px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-700 text-white focus:outline-none focus:border-cyan-400/50 transition-colors" />
        <button type="submit" disabled={loading} className="px-6 py-3 border border-zinc-700 text-zinc-300 hover:border-cyan-400/50 hover:text-cyan-300 font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Analyzing...</span>
            </>
          ) : buttonText}
        </button>
      </form>
      {error && <p className="mt-3 text-red-400 text-sm text-center">{errorPrefix} {error}</p>}
      {mounted && typeof document !== 'undefined' && createPortal(reportModal, document.body)}
    </div>
  );
};

export default AuditTool;
