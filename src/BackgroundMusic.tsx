import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

/* ========== Background music (YouTube) ==========
   Change the video ID to use a different song:
   https://youtu.be/3XqqkrJENB4  →  3XqqkrJENB4
*/
const YOUTUBE_VIDEO_ID = '3XqqkrJENB4'
const DEFAULT_VOLUME = 45

export type BackgroundMusicHandle = {
  play: () => void
}

type YTPlayer = {
  playVideo: () => void
  pauseVideo: () => void
  unMute: () => void
  mute: () => void
  setVolume: (volume: number) => void
}

type YTPlayerConstructor = new (
  elementId: string,
  options: {
    height: string
    width: string
    videoId: string
    playerVars: Record<string, number | string>
    events: {
      onReady: (event: { target: YTPlayer }) => void
    }
  },
) => YTPlayer

type YouTubeNamespace = {
  Player: YTPlayerConstructor
}

declare global {
  interface Window {
    YT?: YouTubeNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

function loadYouTubeIframeApi(): Promise<YouTubeNamespace> {
  return new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT)
      return
    }

    const existingScript = document.getElementById('youtube-iframe-api')
    if (existingScript) {
      const waitForApi = window.setInterval(() => {
        if (window.YT?.Player) {
          window.clearInterval(waitForApi)
          resolve(window.YT)
        }
      }, 100)
      return
    }

    const previousReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.()
      if (window.YT?.Player) resolve(window.YT)
    }

    const script = document.createElement('script')
    script.id = 'youtube-iframe-api'
    script.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(script)
  })
}

const BackgroundMusic = forwardRef<BackgroundMusicHandle>(function BackgroundMusic(_, ref) {
  const playerRef = useRef<YTPlayer | null>(null)
  const pendingPlayRef = useRef(false)

  const play = () => {
    const player = playerRef.current
    if (!player) {
      pendingPlayRef.current = true
      return
    }

    player.unMute()
    player.setVolume(DEFAULT_VOLUME)
    player.playVideo()
    pendingPlayRef.current = false
  }

  useImperativeHandle(ref, () => ({ play }), [])

  useEffect(() => {
    let isMounted = true

    const initPlayer = async () => {
      const YT = await loadYouTubeIframeApi()
      if (!isMounted) return

      new YT.Player('youtube-bg-player', {
        height: '1',
        width: '1',
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          autoplay: 0,
          loop: 1,
          playlist: YOUTUBE_VIDEO_ID,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            playerRef.current = event.target
            event.target.setVolume(DEFAULT_VOLUME)
            event.target.mute()

            if (pendingPlayRef.current) {
              play()
            }
          },
        },
      })
    }

    initPlayer()

    return () => {
      isMounted = false
      playerRef.current?.pauseVideo()
      playerRef.current = null
    }
  }, [])

  return <div id="youtube-bg-player" className="youtube-bg-player" aria-hidden="true" />
})

export default BackgroundMusic
