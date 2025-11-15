import { useEffect, useRef } from 'react'
import Reveal from 'reveal.js'

/**
 * Presentation wrapper component that initializes Reveal.js
 * @param {Object} props
 * @param {React.ReactNode} props.children - Slide components
 * @param {string} [props.theme='dark'] - Theme ('dark' | 'light')
 * @param {string} [props.transition='slide'] - Slide transition type
 * @param {boolean} [props.controls=true] - Show navigation controls
 * @param {boolean} [props.progress=true] - Show progress bar
 * @param {boolean} [props.center=true] - Center slides vertically
 */
export default function Presentation({
  children,
  theme = 'dark',
  transition = 'slide',
  controls = true,
  progress = true,
  center = true,
}) {
  const revealDivRef = useRef(null)
  const deckRef = useRef(null)

  useEffect(() => {
    if (revealDivRef.current && !deckRef.current) {
      deckRef.current = new Reveal(revealDivRef.current, {
        transition,
        controls,
        progress,
        center,
        hash: true,
        slideNumber: 'c/t',
        showSlideNumber: 'all',
        controlsLayout: 'bottom-right',
        controlsBackArrows: 'faded',
        navigationMode: 'linear',
        embedded: false,
        width: 1920,
        height: 1080,
        margin: 0.04,
        minScale: 0.2,
        maxScale: 2.0,
      })

      deckRef.current.initialize().then(() => {
        console.log('Reveal.js initialized successfully')
      }).catch((err) => {
        console.error('Reveal.js initialization failed:', err)
      })
    }

    return () => {
      if (deckRef.current) {
        try {
          deckRef.current.destroy()
        } catch (err) {
          console.error('Error destroying Reveal:', err)
        }
        deckRef.current = null
      }
    }
  }, [transition, controls, progress, center])

  return (
    <div className={`reveal-viewport ${theme}`}>
      <div className="reveal" ref={revealDivRef}>
        <div className="slides">{children}</div>
      </div>
    </div>
  )
}
