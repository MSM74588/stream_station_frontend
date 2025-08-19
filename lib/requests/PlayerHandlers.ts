import { toast } from 'sonner';

/**
 * Sends a play command to the player service.
 *
 * @param {string | null} url - The media URL to play (can be `null` if not applicable).
 * @param {string | null} song_name - The media title (can be `null`). 
 *                                    If using MPD, title should match the song title in your Media Library.
 * @param {"playnow" | "playnext" | "playclearqueue"} command - The player command:
 *   - "playnow"       → Play immediately, interrupting current playback.
 *   - "playnext"      → Queue to play after the current track.
 *   - "playclearqueue"→ Clear the queue and then play.
 *
 * @returns {Promise<any>} - Resolves with the server's JSON response.
 *
 * @example
 * await HandlePlayCommand("https://example.com/song", "Song Title", "playnow");
 * await HandlePlayCommand(null, "Song Title", "playnext");
 * await HandlePlayCommand("https://example.com/song", null, "playnow");
 */
export async function HandlePlayCommand(
  url: string | null,
  song_name: string | null,
  command: 'playnow' | 'playnext' | 'playclearqueue'
) {
  // Prepare request body
  const payload = {
    command,
    url,
    song_name,
    server_url: process.env.NEXT_PUBLIC_SERVER_URL,
  };

  const playerURL = process.env.NEXT_PUBLIC_PLAYER_ENDPOINT;
//   const playerURL = process.env.NEXT_PUBLIC_PLAYER_ENDPOINT;


  if (!playerURL) {
    toast.error('Player endpoint is not configured.');
    throw new Error('Player endpoint URL is not defined in environment variables.');
  }

  const toastId = toast.loading(`Sending "${command}" command...`);

  try {
    const res = await fetch(playerURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    const data = await res.json();

    toast.success(`Command "${command}" sent successfully!`, { id: toastId });
    return data;
  } catch (err) {
    console.error('Error sending play command:', err);
    toast.error(`Failed to send "${command}" command.`, { id: toastId });
    throw err;
  }
}
