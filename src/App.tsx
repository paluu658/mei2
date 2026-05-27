import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import BackgroundMusic, { type BackgroundMusicHandle } from './BackgroundMusic'
import './App.css'

function App() {
  /* ========== GIF/Image section (easy single-URL edit) ========== */
  /* ========== Intro GIF section (easy single-URL edit) ========== */
  const INTRO_GIF_URL = 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeDkxMHM2MTBrOThmZmNzc3U1bTdubGptbHQxOWZlOTN0OTZ0N2ZsNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/93mS3A87wfmOySC29W/giphy.gif'
  // ↑ Replace with your own GIF URL. Set to '' to hide the GIF.

  const CELEBRATION_IMAGE_URL =
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTd3ZDIxMm5iNGdqbTQ5dzZrZXpjcXp5YzRtNzZmYnIxc2t0cWpqOCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/A0Zt7yuDULiy4ofmVD/giphy.gif'

  /* ========== Button logic / funny text ========== */
  const noMessages = useMemo(
    () => [
      'no m hnate pr nk',
      'tgl htet hnate dr lr',
      'yk sk dll',
      "yes hnate lo ya thy dl nw",
      'yes lyy hnate lyk prrr',
      'mhrr hnate mi dr m lrr',
      "hrrr",
      'yes lyk pr tot',
      'pls say yes :(',
      'yes m pyw m chin m pee buu nw',
      'nel" lyy tg m chik bu lr :(',
      'last chance... :(((',
      'noooo...',
      'no pay m hnate bu kwr kyay nk lr :p',
      ':p',
      'mei m chik ll ako chik dl',
      'yes bl kyn tot dl xD',
    ],
    [],
  )

  const [hasEntered, setHasEntered] = useState(false)
  const [noClickCount, setNoClickCount] = useState(0)
  const musicRef = useRef<BackgroundMusicHandle>(null)
  const [isCelebrating, setIsCelebrating] = useState(false)
  const [isLeavingLaunch, setIsLeavingLaunch] = useState(false)
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

  /* ========== Intro falling hearts (until user enters site) ========== */
  const [introHearts, setIntroHearts] = useState<
    Array<{ id: number; left: number; duration: number; emoji: string; sizeRem: number; drift: number }>
  >([])
  const introHeartIdRef = useRef(0)

  /* Yes covers No only after 17 clicks (tune YES_MAX_SCALE if needed) */
  const NO_CLICKS_UNTIL_COVER = 17
  const YES_MAX_SCALE = 1.94
  const YES_SCALE_STEP = (YES_MAX_SCALE - 1) / NO_CLICKS_UNTIL_COVER
  const yesScale = Math.min(1 + noClickCount * YES_SCALE_STEP, YES_MAX_SCALE)
  const noScale = Math.max(1 - noClickCount * 0.05, 0.5)
  const showNoButton = noClickCount < NO_CLICKS_UNTIL_COVER

  const questionText =
    noClickCount > 0
      ? noMessages[Math.min(noClickCount - 1, noMessages.length - 1)]
      : 'Will you be my Valentine in upcoming February after your semester? 💕'

  const subtitleText =
    noClickCount >= noMessages.length
      ? 'Yes m hnate m chin pyy m hwt bu. 😛'
      : noClickCount > 0
        ? 'Still thinking? Take your time...  The universe is watching... 💕'
        : 'I dare you to say no :P'

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
    if (hasEntered) {
      setIntroHearts([])
      return
    }

    const heartEmojis = ['💕', '💖', '💗', '💘', '❤️', '🩷', '💝', '♥️']

    const spawnBatch = () => {
      const batchSize = 5
      const newHearts: Array<{
        id: number
        left: number
        duration: number
        emoji: string
        sizeRem: number
        drift: number
      }> = []

      for (let i = 0; i < batchSize; i += 1) {
        const id = introHeartIdRef.current++
        const duration = 3.8 + Math.random() * 4.2
        newHearts.push({
          id,
          left: Math.random() * 100,
          duration,
          emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)] ?? '💕',
          sizeRem: 0.75 + Math.random() * 0.85,
          drift: (Math.random() - 0.5) * 36,
        })
      }

      setIntroHearts((prev) => {
        const next = [...prev, ...newHearts]
        return next.length > 140 ? next.slice(-120) : next
      })

      newHearts.forEach((h) => {
        window.setTimeout(() => {
          setIntroHearts((prev) => prev.filter((p) => p.id !== h.id))
        }, (h.duration + 0.5) * 1000)
      })
    }

    spawnBatch()
    const intervalId = window.setInterval(spawnBatch, 160)

    return () => {
      window.clearInterval(intervalId)
      setIntroHearts([])
    }
  }, [hasEntered])

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
        <div className="intro-hearts-layer" aria-hidden="true">
          {introHearts.map((h) => (
            <span
              key={h.id}
              className="intro-falling-heart"
              style={
                {
                  left: `${h.left}%`,
                  fontSize: `${h.sizeRem}rem`,
                  animationDuration: `${h.duration}s`,
                  ['--heart-drift' as string]: `${h.drift}px`,
                } as CSSProperties
              }
            >
              {h.emoji}
            </span>
          ))}
        </div>
        <div className="intro-card">
          {/* ========== GIF/Image section (intro) ========== */}
          {INTRO_GIF_URL ? (
            <div className="intro-media">
              <img src={INTRO_GIF_URL} alt="Intro" />
            </div>
          ) : null}

          <p className="intro-eyebrow">psst... something cute is waiting hehe</p>
          <h1 className="intro-title">Ready for a little surprise? ✨</h1>
          <p className="intro-subtitle">click to see what's inside 💕</p>
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
            {showNoButton ? (
              <button
                type="button"
                className="btn btn-no"
                id="btn-no"
                onClick={handleNoClick}
                style={{ transform: `scale(${noScale})` }}
              >
                No
              </button>
            ) : null}
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
            <p className="message-line">Thank you for saying yes! 💕 I promise to make you happy everyday and always ❤️</p>
            <p className="message-line">Look forward to our Valentine's Day together! And don't forget me during those 9 months apart✨</p>
            <p className="message-line">I could've done this better but I'll save it for later for more surprises hehe 🤭</p>
            <p className="message-line">Myrr g chik dl Mei 🖤</p>
            <p className="message-line">Feb hti lwnn yinn sount ny ml a myn pyn lr khae pyy pr 😔</p>
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
