/**
 * Cloudflare Realtime service
 * Replaces Agora for all real-time communication (video, voice, chat)
 * Uses Cloudflare Calls (SFU) + TURN servers + MoQ relay
 */

if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
  console.warn('Cloudflare credentials not configured');
}

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;
const CF_APP_ID = process.env.CLOUDFLARE_CALLS_APP_ID!;
const CF_APP_SECRET = process.env.CLOUDFLARE_CALLS_APP_SECRET!;

/**
 * Create a short-lived Cloudflare Realtime session token for a reading participant.
 * @param channelName - Unique channel name (e.g., reading_123)
 * @param participantId - User ID of the participant
 */
export async function createCloudflareSession(
  channelName: string,
  participantId: string
): Promise<{ sessionId: string; sessionToken: string; turnCredentials: object }> {
  // Create a new Cloudflare Calls session
  const response = await fetch(
    `https://rtc.live.cloudflare.com/v1/apps/${CF_APP_ID}/sessions/new`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CF_APP_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionDescription: {
          type: 'offer',
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudflare session creation failed: ${error}`);
  }

  const data = await response.json() as { sessionId: string; sessionDescription: object };

  // Get TURN credentials
  const turnResponse = await fetch(
    `https://rtc.live.cloudflare.com/v1/apps/${CF_APP_ID}/turn/credentials`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CF_APP_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ttl: 3600 }),
    }
  );

  const turnData = turnResponse.ok ? await turnResponse.json() : {};

  return {
    sessionId: data.sessionId,
    sessionToken: CF_APP_SECRET, // Client uses this to authenticate with CF
    turnCredentials: turnData,
  };
}

/**
 * Get Cloudflare app configuration for client SDK initialization
 */
export function getCloudflareConfig() {
  return {
    appId: CF_APP_ID,
    accountId: CF_ACCOUNT_ID,
  };
}
