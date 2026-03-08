import type { APIRoute } from 'astro';
import { runAudit } from '../../lib/audit-engine/crawler';

export const POST: APIRoute = async ({ request }) => {
  console.log('[API] Audit Request Headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    const text = await request.text();
    console.log('[API] Request body length:', text.length);
    console.log('[API] Request body content:', text);
    
    if (!text) {
      return new Response(JSON.stringify({ error: 'Body is empty' }), { status: 400 });
    }

    const body = JSON.parse(text);
    const { url } = body;
    
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is missing in body' }), { status: 400 });
    }

    console.log('[API] Executing runAudit for:', url);
    const report = await runAudit(url);
    return new Response(JSON.stringify(report), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[API] Error:', error);
    return new Response(JSON.stringify({ error: 'Server error', details: String(error) }), { status: 500 });
  }
};
