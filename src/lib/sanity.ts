import { createClient } from '@sanity/client';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';
const hasSanity = projectId && projectId !== 'placeholder';

const client = hasSanity
  ? createClient({ projectId, dataset, useCdn: false, apiVersion: '2024-01-01' })
  : null;

export const isSanityConfigured = () => !!hasSanity;

export async function getHero() {
  if (!client) return null;
  try {
    return await client.fetch(`*[_type == "hero"][0]`);
  } catch {
    return null;
  }
}

export async function getServices() {
  if (!client) return [];
  try {
    return await client.fetch(`*[_type == "service"] | order(order asc)`);
  } catch {
    return [];
  }
}

export async function getProjects() {
  if (!client) return [];
  try {
    return await client.fetch(`*[_type == "project"] | order(order asc)`);
  } catch {
    return [];
  }
}

export async function getSiteSettings() {
  if (!client) return null;
  try {
    return await client.fetch(`*[_type == "siteSettings"][0]`);
  } catch {
    return null;
  }
}
