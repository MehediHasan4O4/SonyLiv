export default async function handler(req, res) {
  const url = 'https://tiger-hub.vercel.app/SONY/SAB /tracks-v1a1/mono.ts.m3u8';

  try {
    const response = await fetch(url, {
      headers: {
        // Optional: some HLS feeds require a user-agent
        'User-Agent': 'Mozilla/5.0 (compatible; VLC/3.0)',
        'Accept': '*/*'
      }
    });

    if (!response.ok) {
      throw new Error(`Upstream returned ${response.status}`);
    }

    const data = await response.text();

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.status(200).send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch HLS stream');
  }
}
