import * as jose from 'jose';

const APPLE_JWKS = jose.createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

export async function verifyAppleToken(identityToken: string): Promise<{ sub: string; email?: string }> {
  const { payload } = await jose.jwtVerify(identityToken, APPLE_JWKS, {
    issuer: 'https://appleid.apple.com',
  });
  return {
    sub: payload.sub!,
    email: payload.email as string | undefined,
  };
}
