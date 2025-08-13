export function getSiteUrl(): string {
  // Prioriza variáveis de ambiente
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (envUrl && /^https?:\/\//.test(envUrl)) return envUrl.replace(/\/$/, '');

  // Ambiente de desenvolvimento padrão
  return 'http://localhost:3002';
}

