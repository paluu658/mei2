import { useEffect, useMemo, useRef, useState } from 'react'
import BackgroundMusic, { type BackgroundMusicHandle } from './BackgroundMusic'
import './App.css'

function App() {
  /* ========== GIF/Image section (easy single-URL edit) ========== */
  const CELEBRATION_IMAGE_URL =
    'https://media.giphy.com/media/MDJ9Ib6vE0a4yDMpDM/giphy.gif'

  /* ========== Button logic / funny text ========== */
  const noMessages = useMemo(
    () => [
      'Are you sure?',
      'Really sure?',
      'Last chance...',
      "You can't escape 😭",
      'The Yes button is getting ideas...',
      'Okay but what if you misclicked?',
      "I'm not crying, you're crying.",
      'Plot twist: resistance is futile.',
    ],
    [],
  )

  const [hasEntered, setHasEntered] = useState(false)
  const [noClickCount, setNoClickCount] = useState(0)
  const musicRef = useRef<BackgroundMusicHandle>(null)
  const [isCelebrating, setIsCelebrating] = useState(false)
  const [isLeavingLaunch, setIsLeavingLaunch] = useState(false)
  const [noPosition, setNoPosition] = useState({ x: 72, y: 60 })
  const [particles, setParticles] = useState<
    Array<{
      id: number
      type: 'heart' | 'confetti'
      left: number
      duration: number
      delay: number
      content?: string
      color?: string
    }>
  >([])

  const yesScale = Math.min(1 + noClickCount * 0.22, 6.5)
  const noScale = Math.max(1 - noClickCount * 0.08, 0.35)

  const questionText =
    noClickCount > 0
      ? noMessages[Math.min(noClickCount - 1, noMessages.length - 1)]
      : 'Will you be my Valentine?'

  const subtitleText =
    noClickCount >= noMessages.length
      ? 'There is no escape from the Yes button. 💘'
      : noClickCount > 0
        ? 'Still thinking? The universe is watching...'
        : 'Choose wisely... 💕'

  const moveNoButton = () => {
    // Keep "No" in an outer ring, away from center where "Yes" grows.
    const safeRadius = Math.min(38, 18 + noClickCount * 2.8)
    const angle = Math.random() * Math.PI * 2
    const randomRadius = safeRadius + Math.random() * (48 - safeRadius)

    let nextX = 50 + Math.cos(angle) * randomRadius
    let nextY = 50 + Math.sin(angle) * randomRadius * 0.72

    // Clamp to keep button fully inside launch area.
    nextX = Math.max(10, Math.min(90, nextX))
    nextY = Math.max(18, Math.min(84, nextY))

    setNoPosition({ x: nextX, y: nextY })
  }

  useEffect(() => {
    if (!isCelebrating) return

    let particleId = 0
    const hearts = ['💕', '💖', '💗', '✨', '💘']
    const confettiColors = ['#ff9ec7', '#c9b6ff', '#ffe08a', '#9ee4ff', '#ffb7d5']

    const addParticle = () => {
      const isHeart = Math.random() > 0.45
      const newParticle = isHeart
        ? {
            id: particleId++,
            type: 'heart' as const,
            left: Math.random() * 100,
            duration: 7 + Math.random() * 7,
            delay: Math.random() * 2,
            content: hearts[Math.floor(Math.random() * hearts.length)],
          }
        : {
            id: particleId++,
            type: 'confetti' as const,
            left: Math.random() * 100,
            duration: 5 + Math.random() * 4,
            delay: Math.random() * 1.5,
            color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          }

      setParticles((prev) => [...prev, newParticle])

      window.setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id))
      }, 16000)
    }

    for (let i = 0; i < 12; i += 1) {
      window.setTimeout(addParticle, i * 200)
    }

    const intervalId = window.setInterval(addParticle, 450)
    return () => {
      window.clearInterval(intervalId)
      setParticles([])
    }
  }, [isCelebrating])

  useEffect(() => {
    if (noClickCount === 0) return
    moveNoButton()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noClickCount])

  const handleEnterSite = () => {
    musicRef.current?.play()
    setHasEntered(true)
  }

  const handleNoClick = () => {
    setNoClickCount((prev) => prev + 1)
  }

  const handleYesClick = () => {
    setIsLeavingLaunch(true)
    window.setTimeout(() => {
      setIsCelebrating(true)
    }, 550)
  }

  return (
    <>
      <BackgroundMusic ref={musicRef} />

      {/* ========== Intro gate (tap to start music + site) ========== */}
      <section
        className={`intro-gate ${hasEntered ? 'is-hidden' : ''}`}
        aria-label="Welcome"
      >
        <div className="intro-card">
          <p className="intro-eyebrow">psst... something cute is waiting</p>
          <h1 className="intro-title">Ready for a little magic? ✨</h1>
          <p className="intro-subtitle">Music + surprises inside 💕</p>
          <button type="button" className="btn-enter" onClick={handleEnterSite}>
            Open my heart
          </button>
          <p className="intro-hint">tap to begin</p>
        </div>
        <span className="intro-float intro-float-a">💗</span>
        <span className="intro-float intro-float-b">💖</span>
        <span className="intro-float intro-float-c">✨</span>
      </section>

      <main
        className={`app-shell ${hasEntered ? 'is-ready' : ''} ${noClickCount > 0 ? 'shake' : ''}`}
        aria-hidden={!hasEntered}
      >
      {/* ========== Launch screen ========== */}
      <section
        id="launch-screen"
        className={`${isLeavingLaunch ? 'is-leaving' : ''} ${hasEntered ? 'is-visible' : ''}`}
        aria-label="Question"
      >
        <div className="launch-inner">
          <h1 id="question-header" className={noClickCount > 0 ? 'dramatic-wiggle' : ''}>
            {questionText}
          </h1>
          <p id="subtitle-hint" className="subtitle-hint">
            {subtitleText}
          </p>
          <div className="button-row">
            <button
              type="button"
              className="btn btn-yes"
              id="btn-yes"
              onClick={handleYesClick}
              style={{ transform: `scale(${yesScale})` }}
            >
              Yes
            </button>
            <button
              type="button"
              className="btn btn-no"
              id="btn-no"
              onClick={handleNoClick}
              onMouseEnter={moveNoButton}
              onTouchStart={moveNoButton}
              style={{
                left: `${noPosition.x}%`,
                top: `${noPosition.y}%`,
                transform: `translate(-50%, -50%) scale(${noScale})`,
              }}
            >
              No
            </button>
          </div>
        </div>
      </section>

      {/* ========== Second screen ========== */}
      <section
        id="celebration-screen"
        className={isCelebrating ? 'is-visible' : ''}
        aria-live="polite"
        aria-label="Celebration"
      >
        <article className="celebration-card">
          <h2>Yay! You said yes! 🎉</h2>

          {/* ========== GIF/Image section ========== */}
          <div
            id="celebration-media-wrap"
            className={`celebration-media ${CELEBRATION_IMAGE_URL ? '' : 'is-hidden'}`}
          >
            {CELEBRATION_IMAGE_URL ? (
              <img id="celebration-img" src={CELEBRATION_IMAGE_URL} alt="Celebration" />
            ) : null}
          </div>

          {/* ========== Custom message section ========== */}
          <div className="custom-message" id="custom-message-html">
            <p>Yayyyyyyyy.</p>
            <p>Now we can officially be extra cute together. ✨</p>
          </div>
        </article>
      </section>

      <div id="fx-layer" aria-hidden="true">
        {particles.map((particle) =>
          particle.type === 'heart' ? (
            <span
              key={particle.id}
              className="heart-bit"
              style={{
                left: `${particle.left}%`,
                animationDuration: `${particle.duration}s`,
                animationDelay: `${particle.delay}s`,
              }}
            >
              {particle.content}
            </span>
          ) : (
            <span
              key={particle.id}
              className="confetti-bit"
              style={{
                left: `${particle.left}%`,
                animationDuration: `${particle.duration}s`,
                animationDelay: `${particle.delay}s`,
                background: particle.color,
              }}
            />
          ),
        )}
      </div>
    </main>
    </>
  )
}

export default App
