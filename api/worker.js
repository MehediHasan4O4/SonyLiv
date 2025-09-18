addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Get the path from query parameter or default to master.m3u8
  const path = url.searchParams.get('path') || 'master.m3u8'
  
  // Base URL for the Google DAI stream
  const baseUrl = 'https://dai.google.com/ssai/event/UI4QFJ_uRk6aLxIcADqa_A/'
  const targetUrl = `${baseUrl}${path}`

  try {
    // Fetch from Google DAI
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Origin': 'https://example.com',
        'Referer': 'https://example.com/'
      }
    })

    if (!response.ok) {
      return new Response(`Upstream error: ${response.status}`, { status: response.status })
    }

    // Handle M3U8 playlists
    if (path.endsWith('.m3u8')) {
      let text = await response.text()
      
      // Rewrite all URLs in the playlist to go through our worker
      text = text.split('\n').map(line => {
        // Skip comments and empty lines
        if (line.startsWith('#') || line.trim() === '') {
          return line
        }
        
        // Handle different URL formats
        if (line.endsWith('.m3u8') || line.endsWith('.ts') || line.includes('.aac') || line.includes('.mp4')) {
          let newPath
          
          if (line.startsWith('http://') || line.startsWith('https://')) {
            // Absolute URL - extract the path after the base URL
            const lineUrl = new URL(line)
            newPath = lineUrl.pathname.substring(1) + lineUrl.search
          } else if (line.startsWith('/')) {
            // Absolute path
            newPath = line.substring(1)
          } else {
            // Relative path - resolve based on current directory
            const currentDir = path.substring(0, path.lastIndexOf('/') + 1)
            newPath = currentDir + line
          }
          
          return `${url.origin}/?path=${encodeURIComponent(newPath)}`
        }
        
        return line
      }).join('\n')

      return new Response(text, {
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache'
        }
      })
    }

    // For video segments and other files, pass through with CORS headers
    const newHeaders = new Headers(response.headers)
    newHeaders.set('Access-Control-Allow-Origin', '*')
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    })

  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 })
  }
        }
