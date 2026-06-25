export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET environment variable must be set in production.');
  }
  return secret ?? 'dev-only-insecure-secret-replace-before-deploy';
}
