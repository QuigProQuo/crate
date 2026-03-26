function required(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const env = {
  PORT: parseInt(optional('PORT', '3001')),
  ANTHROPIC_API_KEY: required('ANTHROPIC_API_KEY'),
  DISCOGS_CONSUMER_KEY: required('DISCOGS_CONSUMER_KEY'),
  DISCOGS_CONSUMER_SECRET: required('DISCOGS_CONSUMER_SECRET'),
  JWT_SECRET: required('JWT_SECRET'),
  CRATE_API_KEY: optional('CRATE_API_KEY', ''),
  RESEND_API_KEY: optional('RESEND_API_KEY', ''),
  DB_PATH: optional('DB_PATH', ''),
  PRICE_CHECK_INTERVAL_MS: parseInt(optional('PRICE_CHECK_INTERVAL_MS', '21600000')), // 6h
};
