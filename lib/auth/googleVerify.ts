import { OAuth2Client } from "google-auth-library";

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
}

let client: OAuth2Client | null = null;

function getClientId(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID is not set");
  return clientId;
}

function getClient(): OAuth2Client {
  if (!client) {
    client = new OAuth2Client(getClientId());
  }
  return client;
}

/**
 * Verifies a Google Identity Services ID token (a signed JWT credential
 * from the frontend's One Tap / button sign-in) and returns the verified
 * profile. Throws if the token is missing, expired, or was issued for a
 * different Google OAuth client.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  if (!idToken) throw new Error("Missing Google ID token");

  const ticket = await getClient().verifyIdToken({
    idToken,
    audience: getClientId(),
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new Error("Invalid Google token payload");
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name?.trim() || payload.email.split("@")[0],
    picture: payload.picture,
    emailVerified: !!payload.email_verified,
  };
}
