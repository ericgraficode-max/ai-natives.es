import type { APIRoute } from 'astro';
import { getBrowserContext } from '../../lib/audit-engine/core/browser';
import { runCroAudit } from '../../lib/audit-engine/jobs/cro-audit';
import { runAccessibilityAudit } from '../../lib/audit-engine/jobs/accessibility-audit';
import type { AuditType } from '../../lib/audit-engine/types';

export const POST: APIRoute = async ({ request }) => {
  let browser;
  try {
    const body = await request.json();
    const { url, type = 'cro', lang = 'en' } = body as { url: string, type: AuditType, lang: string };

    if (!url || !url.startsWith('http')) {
      return new Response(JSON.stringify({ error: 'Invalid URL provided.' }), { status: 400 });
    }

    const { browser: b, context } = await getBrowserContext();
    browser = b;
    const page = await context.newPage();

    let report;
    if (type === 'accessibility') {
      report = await runAccessibilityAudit(page, url, lang);
    } else {
      report = await runCroAudit(page, url, lang);
    }

    await browser.close();

    return new Response(JSON.stringify(report), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    if (browser) await browser.close();
    console.error('[API] Audit Error:', error);
    return new Response(JSON.stringify({ 
      error: 'The audit tool encountered an error.',
      details: error instanceof Error ? error.message : String(error)
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
