addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Block homepage/root access
  if (url.pathname === '/') {
    return new Response('Access Denied', { 
      status: 403,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  }
  
  // The single m3u8 stream URL
  const streamUrl = 'https://app24.jagobd.com.bd/c3VydmVyX8RpbEU9Mi8xNy8yMFDDEHGcfRgzQ6NTAgdEoaeFzbF92YWxIZTO0U0ezN1IzMyfvcEdsEfeDeKiNkVN3PTOmdFsaWRtaW51aiPhnPTI2/asian-test-sample-ok-d.stream/playlist.m3u8'
  
  // Only allow specific endpoints
  if (url.pathname === '/index.m3u8' || 
      url.pathname === '/stream.m3u8' || 
      url.pathname === '/playlist.m3u8') {
    
    try {
      // Fetch the m3u8 stream
      const response = await fetch(streamUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*'
        }
      })

      if (!response.ok) {
        return new Response(`Stream error: ${response.status}`, { status: response.status })
      }

      // Pass through with CORS headers
      const newHeaders = new Headers(response.headers)
      newHeaders.set('Access-Control-Allow-Origin', '*')
      newHeaders.set('Content-Type', 'application/vnd.apple.mpegurl')
      
      return new Response(response.body, {
        status: response.status,
        headers: newHeaders
      })

    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 })
    }
  }
  
  // Any other path returns 404
  return new Response('Not Found', { status: 404 })
}
