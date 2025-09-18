import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Replace this with your real HLS link
  const url = 'https://dai.google.com/linear/hls/event/daYZdmQGR6CnlLWkjW7MhQ/master.m3u8';

  try {
    const response = await fetch(url);
    const data = await response.text();

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl'); // HLS MIME type
    res.send(data);
  } catch (error) {
    res.status(500).send('Failed to fetch HLS stream');
  }
}
