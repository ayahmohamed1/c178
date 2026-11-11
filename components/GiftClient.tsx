'use client'

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import type { GiftData } from '@/lib/giftData'

interface Props {
  data: GiftData
}

type ScreenType = 
  | 'gift_intro' | 'cake_lit'
  | 'envelope' | 'letter' | 'moments' | 'song' | 'date' | 'invitation'

const screenOrder: ScreenType[] = [
  'invitation', 'gift_intro', 'cake_lit', 'envelope', 'letter', 'moments', 'song', 'date',
]

const nextLabels: Partial<Record<ScreenType, string>> = {
  invitation: 'Open your surprise ✨',
  gift_intro: 'Open your gift 🎁',
  cake_lit: 'Read your letter ✉️',
  envelope: 'Open letter ✉️',
  letter: 'See the next surprise →',
  moments: 'Hear our song 🎵',
  song: 'See your last surprise →',
}

export default function GiftClient({ data }: Props) {
  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState<ScreenType>('invitation')
  
  const [musicPlaying, setMusicPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  const [isSongPlaying, setIsSongPlaying] = useState(false)
  const [songProgress, setSongProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const songAudioRef = useRef<HTMLAudioElement | null>(null)

  const [noCount, setNoCount] = useState(0)
  const [candleLit, setCandleLit] = useState(true)
  const [yesAccepted, setYesAccepted] = useState(false)

  const confettiRef = useRef<HTMLCanvasElement | null>(null)
  const confettiAnimRef = useRef<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'

    return () => {
      window.history.scrollRestoration = previousScrollRestoration
    }
  }, [])

  useEffect(() => {
    if (data.musicUrl) {
      const audio = new Audio(data.musicUrl)
      audio.loop = true; audio.volume = 0.3
      audioRef.current = audio
    }
    return () => audioRef.current?.pause()
  }, [data.musicUrl])

  const navigateTo = useCallback((newScreen: ScreenType) => {
    window.history.pushState({ screen: newScreen }, '')
    setScreen(newScreen)
    
    if (newScreen !== 'song' && isSongPlaying && songAudioRef.current) {
      songAudioRef.current.pause()
      setIsSongPlaying(false)
    }
  }, [isSongPlaying])

  useEffect(() => {
    window.history.replaceState({ screen: 'invitation' }, '')
    const handlePopState = (event: PopStateEvent) => {
      const previousScreen = event.state?.screen as ScreenType | undefined
      const targetScreen = previousScreen || 'invitation'
      setScreen(targetScreen)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const toggleOurSong = () => {
    if (!songAudioRef.current) return
    if (isSongPlaying) {
      songAudioRef.current.pause()
      setIsSongPlaying(false)
    } else {
      if (musicPlaying && audioRef.current) {
        audioRef.current.pause()
        setMusicPlaying(false)
      }
      songAudioRef.current.play().then(() => {
        setIsSongPlaying(true)
      }).catch((error) => {
        console.error("Error playing the song:", error)
        alert("مش قادر أشغل الأغنية! تأكد إن مسار الأغنية صح (public/audio/our-song.mp3)")
      })
    }
  }

  const handleSongTimeUpdate = () => {
    if (songAudioRef.current) {
      setCurrentTime(songAudioRef.current.currentTime)
      if (songAudioRef.current.duration) {
        setSongProgress((songAudioRef.current.currentTime / songAudioRef.current.duration) * 100)
      }
    }
  }

  const handleSongLoadedMetadata = () => {
    if (songAudioRef.current) {
      setDuration(songAudioRef.current.duration)
    }
  }

  const handleSongSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (songAudioRef.current && songAudioRef.current.duration) {
      const newTime = (Number(e.target.value) / 100) * songAudioRef.current.duration
      songAudioRef.current.currentTime = newTime
      setCurrentTime(newTime)
      setSongProgress(Number(e.target.value))
    }
  }

  const skipForward = () => {
    if (songAudioRef.current) {
      songAudioRef.current.currentTime = Math.min(songAudioRef.current.currentTime + 10, duration)
    }
  }

  const skipBackward = () => {
    if (songAudioRef.current) {
      songAudioRef.current.currentTime = Math.max(songAudioRef.current.currentTime - 10, 0)
    }
  }

  // ورق زينة (Confetti) بدرجات البيبي بينك والفضي والأسود
  const launchConfetti = useCallback(() => {
    const canvas = confettiRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = window.innerWidth; canvas.height = window.innerHeight

    const pieces: any[] = []
    const colors = ['#f472b6', '#fbcfe8', '#db2777', '#fda4af', '#fff', '#e2e8f0']
    for (let i = 0; i < 150; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 5,
        vy: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 8,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      })
    }
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false
      for (const p of pieces) {
        p.x += p.vx; p.y += p.vy; p.rotation += p.rotationSpeed; p.vy += 0.05 
        if (p.y < canvas.height + 20) alive = true
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore()
      }
      if (alive) confettiAnimRef.current = requestAnimationFrame(animate)
      else ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    if (confettiAnimRef.current) cancelAnimationFrame(confettiAnimRef.current)
    confettiAnimRef.current = requestAnimationFrame(animate)
  }, [])

  return (
    <div className="gift-page">
      <div className="corners-overlay">
        <div className="corner tl"></div><div className="corner tr"></div>
        <div className="corner bl"></div><div className="corner br"></div>
      </div>
      <div className="side-text left">BIRTHDAY • CELEBRATION</div>
      <div className="side-text right">WITH LOVE • FOR YOU</div>

      <canvas ref={confettiRef} id="confetti-canvas" style={{ position: 'fixed', inset: 0, zIndex: 100, pointerEvents: 'none' }} />

      {/* ── SCREEN 1: BIRTHDAY INVITATION ── */}
      <div id="invitation" className={`screen ${screen === 'invitation' ? 'visible' : ''}`}>
        <div className="content-wrapper invitation-screen-content">
          <BirthdayInvitation
            birthdayImage={data.birthdayImage}
          />
          <button className="btn-primary invitation-button" onClick={() => navigateTo('gift_intro')}>
            Open your surprise ✨
          </button>
        </div>
      </div>

      {/* ── SCREEN 1: INTRO ── */}
      <div id="gift_intro" className={`screen ${screen === 'gift_intro' ? 'visible' : ''}`}>
        <BuntingSVG />
        <div className="content-wrapper intro-content">
          <p className="subtitle">✦ Something special is waiting ✦</p>
          <h1 className="gift-title">A Gift <br/><span>just for You</span></h1>
          <div className="crown-icon">👑</div>
          <div className="dots">• • •</div>
          <p className="description">
            "Today is a day as beautiful as you are. I've prepared a little digital surprise to celebrate your special moment."
          </p>
        </div>
      </div>

      {/* ── SCREEN 2: CAKE LIT ── */}
      <div id="cake_lit" className={`screen ${screen === 'cake_lit' ? 'visible' : ''}`}>
        <div className="content-wrapper">
          <div className="svg-container" style={{ opacity: candleLit ? 1 : 0.8 }}>
            <div className="cake-glow"></div>
            {candleLit ? <CakeLitSVG /> : <CakeBlownSVG />}
          </div>
          {candleLit ? (
            <>
              <h2 className="gift-title">Make a wish, <span>{data.name}</span> 👑</h2>
              <button className="btn-primary" onClick={() => { setCandleLit(false); setTimeout(launchConfetti, 100) }}>
                Blow the Candle 🎈
              </button>
            </>
          ) : (
            <>
              <h2 className="gift-title" style={{ marginBottom: '1.5rem' }}>Happy Birthday, Mimi! 🎂</h2>
              <button className="btn-secondary" onClick={() => setCandleLit(true)}>Light it Again ✨</button>
              <p className="subtitle" style={{ marginTop: '1rem' }}>You have a secret letter</p>
            </>
          )}
        </div>
      </div>

      {/* ── SCREEN 3: ENVELOPE ── */}
      <div id="envelope" className={`screen ${screen === 'envelope' ? 'visible' : ''}`}>
        <div className="content-wrapper">
          <button
            className="envelope-trigger"
            type="button"
            aria-label="Open your letter"
            onClick={() => navigateTo('letter')}
          >
            <div className="svg-container envelope">
              <EnvelopeSVG />
            </div>
            <p className="subtitle" style={{ letterSpacing: '0.2em' }}>✦ Click the envelope to open your letter ✦</p>
          </button>
        </div>
      </div>

      {/* ── SCREEN 5: LETTER ── */}
      <div id="letter" className={`screen ${screen === 'letter' ? 'visible' : ''}`}>
        <div className="content-wrapper">
          <div className="letter-card">
            <div className="top-accent-sq"></div>
            <h2 className="letter-title">To my favorite person,</h2>
            
            <div className="letter-scroll-area">
              <div className="letter-body">{data.message}</div>
            </div>
            <div className="letter-divider"><span>✦</span></div>
            <div className="signature">
              <p>With all my love,</p>
              <p>{data.senderName || 'Youssef'} ✨</p>
            </div>

          </div>
        </div>
      </div>

      {/* ── SCREEN 6: MOMENTS ── */}
      <div id="moments" className={`screen ${screen === 'moments' ? 'visible' : ''}`}>
        <div className="content-wrapper">
          <h2 className="gift-title" style={{ fontStyle: 'italic', marginBottom: '0.5rem' }}>Captured Moments</h2>
          <p className="subtitle" style={{ color: '#94a3b8', textTransform: 'lowercase' }}>tap a memory to reveal</p>
          
          <div className="moments-grid">
            <div className="polaroid-card">
               <div className="polaroid-pin"></div>
               <div className="polaroid-img-wrapper">
                  <Image src="/images/pic1.jpg" alt="Memory 1" fill style={{ objectFit: 'cover' }} unoptimized />
               </div>
            </div>
            <div className="polaroid-card">
               <div className="polaroid-pin"></div>
               <div className="polaroid-img-wrapper">
                  <Image src="/images/pic2.jpg" alt="Memory 2" fill style={{ objectFit: 'cover' }} unoptimized />
               </div>
            </div>
            <div className="polaroid-card">
               <div className="polaroid-pin"></div>
               <div className="polaroid-img-wrapper">
                  <Image src="/images/pic3.jpg" alt="Memory 3" fill style={{ objectFit: 'cover' }} unoptimized />
               </div>
            </div>
            <div className="polaroid-card">
               <div className="polaroid-pin"></div>
               <div className="polaroid-img-wrapper">
                  <Image src="/images/pic4.jpg" alt="Memory 4" fill style={{ objectFit: 'cover' }} unoptimized />
               </div>
            </div>
          </div>

          <p className="description" style={{ color: '#f472b6', marginBottom: '1.5rem' }}>"One of the best memories we've ever shared..."</p>
        </div>
      </div>

      {/* ── SCREEN: OUR SONG ── */}
      <div id="song" className={`screen ${screen === 'song' ? 'visible' : ''}`}>
        <div className="content-wrapper">
          
          <div className="player-container">
            <div className={`vinyl-record-container ${isSongPlaying ? 'vinyl-spin' : 'vinyl-paused'}`}>
              <VinylSVG />
            </div>

            <div className="music-player-card">
              <div className="player-cover">
                <Image src="/images/pic5.jpg" alt="Our Song Cover" fill style={{ objectFit: 'cover' }} unoptimized />
              </div>

              <div className="player-info">
                <div className="player-title">Our Song</div>
                <div className="player-artist">every word for you</div>
              </div>

              <div className="timeline-container">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={songProgress || 0} 
                  onChange={handleSongSeek} 
                  className="ios-slider"
                />
                <div className="time-labels">
                  <span>{formatTime(currentTime)}</span>
                  <span>-{formatTime(duration - currentTime)}</span>
                </div>
              </div>

              <div className="player-controls">
                <button className="control-btn" onClick={skipBackward}><BackwardIcon /></button>
                <button className="control-btn play-pause-circle" onClick={toggleOurSong}>
                  {isSongPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button className="control-btn" onClick={skipForward}><ForwardIcon /></button>
              </div>

              <div className="volume-container">
                <VolumeMinIcon />
                <input type="range" className="ios-slider" style={{ marginBottom: 0 }} defaultValue="80" />
                <VolumeMaxIcon />
              </div>
            </div>
          </div>

          <audio 
            ref={songAudioRef} 
            src="/audio/song.mp3" 
            preload="auto"
            onTimeUpdate={handleSongTimeUpdate}
            onLoadedMetadata={handleSongLoadedMetadata}
            onEnded={() => setIsSongPlaying(false)}
          />

        </div>
      </div>

      {/* ── SCREEN 7: DATE ── */}
      <div id="date" className={`screen ${screen === 'date' ? 'visible' : ''}`}>
        {yesAccepted && <Sparkles />}
        <div className="content-wrapper">
          {yesAccepted ? (
            <>
              <p className="subtitle">✦ IT IS A YES! ✦</p>
              <h1 className="gift-title">Knew you would say yes! ❤️</h1>
              <div className="svg-container">
                <Image src="/images/bear-hug.gif" alt="Yay!" fill style={{ objectFit: 'cover', borderRadius: '50%' }} unoptimized />
              </div>
            </>
          ) : (
            <>
              <p className="subtitle">✦ IMPORTANT QUESTION ✦</p>
              <h1 className="gift-title">Will you stay with me forever?</h1>
              <div className="svg-container">
                <Image src="/images/bear-ask.jpg" alt="Will you stay with me?" fill style={{ objectFit: 'cover', borderRadius: '50%' }} unoptimized />
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button className="btn-primary" style={{ fontSize: `${1 + noCount * 0.1}rem`, padding: `${0.8 + noCount * 0.1}rem ${2 + noCount * 0.1}rem` }} onClick={() => { setYesAccepted(true); setTimeout(launchConfetti, 300) }}>Yes!</button>
                <button className="secret-link" style={{ padding: '0.8rem 1.5rem', background: '#0d0407', borderRadius: '8px', border: '1px solid #451325', margin: 0 }} onClick={() => setNoCount(noCount + 1)}>
                  {['No', 'Please? 🥺', 'Really?!', 'Are you sure?', 'Knew you would say yes!'][Math.min(noCount, 4)]}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <nav
        className={`screen-navigation ${screen === 'gift_intro' ? 'screen-navigation-raised' : ''}`}
        aria-label="Page navigation"
      >
        {screen !== 'invitation' &&
          screen !== 'envelope' &&
          screen !== screenOrder[screenOrder.length - 1] &&
          (screen !== 'cake_lit' || !candleLit) && (
            <button
              className="btn-primary"
              type="button"
              onClick={() => navigateTo(screenOrder[screenOrder.indexOf(screen) + 1])}
            >
              {nextLabels[screen] || 'Next →'}
            </button>
          )}
      </nav>

    </div>
  )
}

// =============================================
// HELPER COMPONENTS & PURE SVGS (BABY PINK THEME)
// =============================================

function BirthdayInvitation({ birthdayImage }: { birthdayImage: string }) {
  return (
    <div className="invitation-card">
      <InvitationBunting />
      <div className="invitation-decoration" aria-hidden="true">♡　✦　♡</div>
      <h1 className="invitation-heading">I invite you to celebrate your birthday</h1>
      <div className="invitation-image">
        <Image src={birthdayImage} alt="Birthday celebration" fill style={{ objectFit: 'contain' }} unoptimized />
      </div>
      <div className="invitation-details">
        <p><CalendarIcon />12/11/2005</p>
      </div>
      <p className="invitation-footer">Can&apos;t wait to celebrate with you! 🎀</p>
    </div>
  )
}

function Sparkles() {
  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -1 }}>
      {Array.from({ length: 15 }).map((_, i) => (
        <span key={i} style={{
          position: 'absolute', width: '3px', height: '3px', background: '#fff', borderRadius: '50%',
          top: `${10 + (i * 12) % 80}%`, left: `${5 + (i * 13) % 90}%`,
          boxShadow: '0 0 10px #f472b6', opacity: 0.6
        }}/>
      ))}
    </div>
  )
}

function InvitationBunting() {
  return (
    <svg className="invitation-bunting" viewBox="0 0 360 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <path d="M22 18 Q180 106 338 18" fill="none" stroke="#f9a8d4" strokeWidth="2" />
      <path d="M58 34 L82 41 L68 64 Z" fill="#db2777" />
      <path d="M103 51 L127 57 L112 79 Z" fill="#fbcfe8" />
      <path d="M149 63 L173 66 L158 88 Z" fill="#f472b6" />
      <path d="M196 65 L220 62 L209 86 Z" fill="#fbcfe8" />
      <path d="M242 55 L265 48 L258 74 Z" fill="#db2777" />
      <path d="M285 36 L307 27 L304 53 Z" fill="#f472b6" />
      <g fill="#f9a8d4" stroke="#fbcfe8" strokeWidth="1.5">
        <ellipse cx="38" cy="27" rx="10" ry="13" transform="rotate(-20 38 27)" />
        <ellipse cx="322" cy="27" rx="10" ry="13" transform="rotate(20 322 27)" />
      </g>
      <g fill="none" stroke="#f9a8d4" strokeWidth="1">
        <path d="M38 40 Q34 48 40 54" />
        <path d="M322 40 Q326 48 320 54" />
      </g>
    </svg>
  )
}

function BuntingSVG() {
  return (
    <svg className="intro-bunting" width="100%" height="80" viewBox="0 0 800 80" preserveAspectRatio="none" aria-hidden="true">
      <line x1="0" y1="20" x2="800" y2="20" stroke="#50152d" strokeWidth="2" />
      {[...Array(10)].map((_, i) => (
        <polygon key={i} points={`${30 + i * 80},20 ${60 + i * 80},20 ${45 + i * 80},60`} fill={i % 2 === 0 ? "#db2777" : "#f472b6"} />
      ))}
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="invitation-detail-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 3.5v3M16.5 3.5v3M4 9.5h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 13h2v2H8zM14 13h2v2h-2zM8 17h2v1H8z" fill="currentColor" />
    </svg>
  )
}

function CakeLitSVG() {
  return (
    <svg viewBox="0 0 200 200" fill="none" style={{ width: '100%', height: '100%' }}>
      <ellipse cx="100" cy="180" rx="75" ry="10" fill="#0d0407"/>
      <path d="M40 130 H160 V175 C160 178 150 180 100 180 C50 180 40 178 40 175 V130 Z" fill="#381322"/>
      <rect x="55" y="90" width="90" height="40" rx="4" fill="#831843"/>
      <rect x="70" y="55" width="60" height="35" rx="4" fill="#db2777"/>
      <circle cx="50" cy="130" r="5" fill="#f472b6"/><circle cx="80" cy="130" r="5" fill="#f472b6"/><circle cx="110" cy="130" r="5" fill="#f472b6"/><circle cx="140" cy="130" r="5" fill="#f472b6"/>
      <rect x="96" y="25" width="8" height="30" rx="1" fill="#fbcfe8"/>
      <line x1="96" y1="35" x2="104" y2="30" stroke="#f472b6" strokeWidth="2"/>
      <g style={{ animation: 'pulse 1s infinite alternate', transformOrigin: '100px 22px' }}>
        <path d="M100 8 C92 18 92 26 100 30 C108 26 108 18 100 8 Z" fill="#facc15"/>
      </g>
    </svg>
  )
}

function CakeBlownSVG() {
  return (
    <svg viewBox="0 0 200 200" fill="none" style={{ width: '100%', height: '100%' }}>
      <ellipse cx="100" cy="180" rx="75" ry="10" fill="#0d0407"/>
      <path d="M40 130 H160 V175 C160 178 150 180 100 180 C50 180 40 178 40 175 V130 Z" fill="#381322"/>
      <rect x="55" y="90" width="90" height="40" rx="4" fill="#831843"/>
      <rect x="70" y="55" width="60" height="35" rx="4" fill="#db2777"/>
      <rect x="96" y="25" width="8" height="30" rx="1" fill="#fbcfe8"/>
      <path d="M100 20 Q 95 10 100 0 T 100 -10" stroke="#94a3b8" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function EnvelopeSVG() {
  return (
    <svg viewBox="0 0 280 180" fill="none" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="180" rx="12" fill="#0d0407" stroke="#50152d" strokeWidth="1.5"/>
      <rect x="25" y="15" width="230" height="90" rx="6" fill="#f4f4f5"/>
      <line x1="45" y1="35" x2="235" y2="35" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="45" y1="55" x2="190" y2="55" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="45" y1="75" x2="140" y2="75" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M0 180 L140 85 L280 180 Z" fill="#1f0a13"/>
      <path d="M0 0 L140 85 L0 180 Z" fill="#14040a"/>
      <path d="M280 0 L140 85 L280 180 Z" fill="#14040a"/>
      <path d="M0 0 L140 105 L280 0 Z" fill="#381322"/>
      <circle cx="140" cy="105" r="22" fill="#0d0407" stroke="#f472b6" strokeWidth="1.5"/>
      <circle cx="140" cy="105" r="18" fill="#f472b6"/>
      <path d="M140 112 C140 112 131 102 127 106 C123 110 128 118 140 125 C152 118 157 110 153 106 C149 102 140 112 140 112 Z" fill="#ffffff"/>
    </svg>
  )
}

function VinylSVG() {
  return (
    <svg viewBox="0 0 200 200" fill="none" style={{ width: '100%', height: '100%' }}>
      <circle cx="100" cy="100" r="100" fill="#030102" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="#12060b" strokeWidth="2" />
      <circle cx="100" cy="100" r="76" fill="none" stroke="#12060b" strokeWidth="2" />
      <circle cx="100" cy="100" r="64" fill="none" stroke="#12060b" strokeWidth="2" />
      <circle cx="100" cy="100" r="52" fill="none" stroke="#12060b" strokeWidth="2" />
      <circle cx="100" cy="100" r="35" fill="#381322" />
      <circle cx="100" cy="100" r="30" fill="#db2777" />
      <circle cx="100" cy="100" r="5" fill="#030102" />
    </svg>
  )
}

function PlayIcon() { return <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> }
function PauseIcon() { return <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> }
function ForwardIcon() { return <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg> }
function BackwardIcon() { return <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg> }
function VolumeMinIcon() { return <svg viewBox="0 0 24 24"><path d="M7 9v6h4l5 5V4l-5 5H7z"/></svg> }
function VolumeMaxIcon() { return <svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg> }