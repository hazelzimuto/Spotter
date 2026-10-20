'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Common props for the outline motion illustrations.
 */
interface IllustrationProps {
  className?: string
}

/**
 * STEP 1 OUTLINE MOTION ILLUSTRATION: Check In With Daily Whiteboard Code
 * Depicts an outline whiteboard on an easel, an outline animated marker writing the 4-digit code,
 * an outline smartphone logging attendance, and a 4-hour suppression window indicator.
 */
export function StepOneIllustration({ className }: IllustrationProps) {
  const containerRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return

      // Animate marker writing
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 })

      // Initial state
      gsap.set('.digit', { opacity: 0, scale: 0.8, transformOrigin: 'center' })
      gsap.set('.marker', { x: 90, y: 75, rotation: -15, transformOrigin: 'bottom right' })
      gsap.set('.signal-wave', { opacity: 0, scale: 0.8, transformOrigin: 'center' })
      gsap.set('.check-indicator', { scale: 0, transformOrigin: 'center' })
      gsap.set('.clock-hand', { rotation: 0, transformOrigin: '12px 12px' })

      // Marker moves & digits appear sequentially
      tl.to('.marker', { x: 105, y: 70, duration: 0.4, ease: 'power1.inOut' })
        .to('#digit-4', { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(1.7)' }, '-=0.1')
        .to('.marker', { x: 125, y: 72, duration: 0.35, ease: 'power1.inOut' })
        .to('#digit-8', { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(1.7)' }, '-=0.1')
        .to('.marker', { x: 145, y: 70, duration: 0.35, ease: 'power1.inOut' })
        .to('#digit-2', { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(1.7)' }, '-=0.1')
        .to('.marker', { x: 165, y: 72, duration: 0.35, ease: 'power1.inOut' })
        .to('#digit-1', { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(1.7)' }, '-=0.1')
        .to('.marker', { x: 185, y: 95, rotation: 10, duration: 0.4, ease: 'power2.out' })

      // Signal waves emit from whiteboard to phone
      tl.to('.signal-wave', {
        opacity: 1,
        scale: 1.15,
        stagger: 0.15,
        duration: 0.5,
        ease: 'power1.out',
      })
      .to('.signal-wave', { opacity: 0, duration: 0.3, stagger: 0.1 }, '-=0.2')

      // Phone confirms check-in
      tl.to('.check-indicator', {
        scale: 1,
        duration: 0.4,
        ease: 'elastic.out(1, 0.5)',
      }, '-=0.2')

      // Clock hand turns to indicate 4-hour window
      tl.to('.clock-hand', {
        rotation: 120,
        duration: 0.8,
        ease: 'power2.out',
      }, '-=0.3')

      // Rest interval
      tl.to({}, { duration: 1.2 })

      // Fade out for loop
      tl.to('.check-indicator', { scale: 0, opacity: 0, duration: 0.3 })
      tl.to('.digit', { opacity: 0, duration: 0.3 }, '<')
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <svg
      ref={containerRef}
      viewBox="0 0 380 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* ── Whiteboard Stand & Frame ── */}
      {/* Easel legs */}
      <line x1="60" y1="180" x2="85" y2="40" stroke="var(--color-outline)" strokeWidth="2" strokeLinecap="round" />
      <line x1="210" y1="180" x2="185" y2="40" stroke="var(--color-outline)" strokeWidth="2" strokeLinecap="round" />
      <line x1="135" y1="40" x2="135" y2="25" stroke="var(--color-outline)" strokeWidth="2" strokeLinecap="round" />
      <line x1="68" y1="140" x2="202" y2="140" stroke="var(--color-outline-variant)" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Board frame */}
      <rect
        x="65"
        y="35"
        width="140"
        height="90"
        rx="8"
        stroke="var(--color-on-surface)"
        strokeWidth="2"
        fill="var(--color-surface-container-lowest)"
      />
      {/* Marker tray */}
      <rect x="80" y="125" width="110" height="4" rx="2" stroke="var(--color-primary)" strokeWidth="1.5" />

      {/* Board Header text */}
      <text
        x="135"
        y="54"
        textAnchor="middle"
        fontSize="9"
        fontWeight="600"
        letterSpacing="0.08em"
        fill="var(--color-text-secondary)"
        fontFamily="sans-serif"
      >
        DAILY DESK CODE
      </text>
      <line x1="85" y1="60" x2="185" y2="60" stroke="var(--color-outline-variant)" strokeWidth="1" />

      {/* 4-Digit Code in Outline Style */}
      <g id="code-digits" transform="translate(0, 10)">
        {/* Digit 4 */}
        <g id="digit-4" className="digit">
          <rect x="85" y="65" width="22" height="28" rx="4" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
          <path d="M100 71 L94 82 H103 M100 71 V89" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {/* Digit 8 */}
        <g id="digit-8" className="digit">
          <rect x="111" y="65" width="22" height="28" rx="4" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
          <path d="M122 72 A3.5 3.5 0 0 1 122 79 A4 4 0 0 1 122 87 A4 4 0 0 1 122 79 A3.5 3.5 0 0 1 122 72 Z" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {/* Digit 2 */}
        <g id="digit-2" className="digit">
          <rect x="137" y="65" width="22" height="28" rx="4" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
          <path d="M143 75 A4 4 0 0 1 151 75 C151 79 143 83 143 87 H153" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {/* Digit 1 */}
        <g id="digit-1" className="digit">
          <rect x="163" y="65" width="22" height="28" rx="4" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
          <path d="M170 74 L174 71 V87 M169 87 H179" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* Floating Outline Marker */}
      <g className="marker" style={{ pointerEvents: 'none' }}>
        <path d="M0 0 L14 -14 L18 -10 L4 4 Z" stroke="var(--color-on-surface)" strokeWidth="1.5" fill="var(--color-surface-container-high)" />
        <path d="M0 0 L-3 3 L-1 5 L4 4 Z" stroke="var(--color-primary)" strokeWidth="1.5" fill="var(--color-primary)" />
        <line x1="14" y1="-14" x2="20" y2="-20" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* ── Communication Wave Arcs ── */}
      <path className="signal-wave" d="M215 70 A30 30 0 0 1 215 100" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
      <path className="signal-wave" d="M225 60 A45 45 0 0 1 225 110" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 3" />
      <path className="signal-wave" d="M235 50 A60 60 0 0 1 235 120" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" />

      {/* ── Member Smartphone Outline ── */}
      <rect
        x="255"
        y="45"
        width="65"
        height="115"
        rx="10"
        stroke="var(--color-on-surface)"
        strokeWidth="2"
        fill="var(--color-surface-container-lowest)"
      />
      {/* Phone screen bezel & speaker notch */}
      <line x1="275" y1="52" x2="300" y2="52" stroke="var(--color-outline-variant)" strokeWidth="2" strokeLinecap="round" />
      <rect x="261" y="58" width="53" height="92" rx="4" stroke="var(--color-outline-variant)" strokeWidth="1" fill="var(--color-surface-container-low)" />

      {/* Phone Screen Check-In Card */}
      <rect x="266" y="66" width="43" height="50" rx="4" stroke="var(--color-primary-container)" strokeWidth="1" fill="var(--color-surface-container-lowest)" />
      <text x="287" y="76" textAnchor="middle" fontSize="6" fontWeight="700" fill="var(--color-primary)" fontFamily="sans-serif">CHECK-IN</text>
      
      {/* Dynamic Success Checkmark Indicator */}
      <g className="check-indicator" transform="translate(287, 95)">
        <circle cx="0" cy="0" r="10" stroke="var(--color-success, #2E9E5B)" strokeWidth="1.5" fill="var(--color-success-container, #C8ECD3)" />
        <path d="M-4 0 L-1 3 L4 -3" stroke="var(--color-on-success-container, #15492B)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* 4-Hour Suppression Clock Ring */}
      <g transform="translate(270, 128)">
        <circle cx="8" cy="8" r="7" stroke="var(--color-outline)" strokeWidth="1.2" fill="none" />
        <g className="clock-hand" transform="translate(8, 8)">
          <line x1="0" y1="0" x2="0" y2="-4" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        <text x="18" y="11" fontSize="7" fontWeight="600" fill="var(--color-text-secondary)" fontFamily="sans-serif">4h lock</text>
      </g>
    </svg>
  )
}

/**
 * STEP 2 OUTLINE MOTION ILLUSTRATION: Ask Spotter Gym Rules & Verified Hours
 * Features a glowing outline conversational AI core, surrounded by floating outline gym badges
 * (dumbbell, sauna towel/steam, facility clock, verified record badge) with orbiting dashed trajectories.
 */
export function StepTwoIllustration({ className }: IllustrationProps) {
  const containerRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return

      // Continuous gentle bobbing for the floating outline badges
      gsap.to('.badge-dumbbell', { y: -6, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to('.badge-clock', { y: 6, duration: 2.6, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.3 })
      gsap.to('.badge-sauna', { y: -5, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.6 })
      gsap.to('.badge-shield', { y: 5, duration: 2.1, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.2 })

      // Orbital pulse rings
      gsap.to('.pulse-ring-1', {
        scale: 1.12,
        opacity: 0.3,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        transformOrigin: 'center',
        ease: 'sine.inOut',
      })
      gsap.to('.pulse-ring-2', {
        scale: 1.18,
        opacity: 0.15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        transformOrigin: 'center',
        ease: 'sine.inOut',
        delay: 0.5,
      })

      // Query dialogue and verified answer interaction
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.8 })

      gsap.set('.query-bubble', { opacity: 0, y: 10, scale: 0.95, transformOrigin: 'top left' })
      gsap.set('.answer-bubble', { opacity: 0, y: -10, scale: 0.95, transformOrigin: 'bottom right' })
      gsap.set('.data-ray', { strokeDashoffset: 100 })

      tl.to('.query-bubble', { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.5)' })
        .to('.data-ray', { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut', stagger: 0.15 })
        .to('.answer-bubble', { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.5)' })
        .to('.shield-check', { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' })
        .to({}, { duration: 2 })
        .to('.query-bubble, .answer-bubble', { opacity: 0, duration: 0.4 })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <svg
      ref={containerRef}
      viewBox="0 0 380 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Orbital paths */}
      <ellipse cx="190" cy="100" rx="145" ry="70" stroke="var(--color-outline-variant)" strokeWidth="1" strokeDasharray="4 4" />
      <ellipse cx="190" cy="100" rx="90" ry="45" stroke="var(--color-outline-variant)" strokeWidth="1" strokeDasharray="3 3" />

      {/* Central Search/AI Hub Core */}
      <circle className="pulse-ring-2" cx="190" cy="100" r="46" stroke="var(--color-primary)" strokeWidth="1" opacity="0.3" fill="none" />
      <circle className="pulse-ring-1" cx="190" cy="100" r="36" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.5" fill="none" />
      <circle cx="190" cy="100" r="26" stroke="var(--color-primary)" strokeWidth="2" fill="var(--color-surface-container-lowest)" />

      {/* AI Spark/Core glyph */}
      <path
        d="M190 88 C190 95 197 99 202 100 C197 101 190 105 190 112 C190 105 183 101 178 100 C183 99 190 95 190 88 Z"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="var(--color-primary-container)"
      />

      {/* ── Badge 1: Dumbbell (Top Left) ── */}
      <g className="badge-dumbbell" transform="translate(55, 45)">
        <rect x="0" y="0" width="36" height="36" rx="8" stroke="var(--color-outline)" strokeWidth="1.5" fill="var(--color-surface-container-lowest)" />
        {/* Dumbbell outline icon */}
        <path d="M10 13 H12 V23 H10 Z" stroke="var(--color-on-surface)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M24 13 H26 V23 H24 Z" stroke="var(--color-on-surface)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="18" x2="24" y2="18" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* ── Badge 2: Clock & Schedule (Bottom Left) ── */}
      <g className="badge-clock" transform="translate(65, 125)">
        <rect x="0" y="0" width="36" height="36" rx="8" stroke="var(--color-outline)" strokeWidth="1.5" fill="var(--color-surface-container-lowest)" />
        <circle cx="18" cy="18" r="9" stroke="var(--color-on-surface)" strokeWidth="1.5" />
        <polyline points="18 13 18 18 22 20" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* ── Badge 3: Sauna / Amenities (Top Right) ── */}
      <g className="badge-sauna" transform="translate(290, 45)">
        <rect x="0" y="0" width="36" height="36" rx="8" stroke="var(--color-outline)" strokeWidth="1.5" fill="var(--color-surface-container-lowest)" />
        {/* Outline steam waves */}
        <path d="M13 23 C11 20 15 17 13 13" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M18 23 C16 20 20 17 18 13" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M23 23 C21 20 25 17 23 13" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* ── Badge 4: Verified Policy Shield (Bottom Right) ── */}
      <g className="badge-shield" transform="translate(280, 125)">
        <rect x="0" y="0" width="36" height="36" rx="8" stroke="var(--color-primary)" strokeWidth="1.5" fill="var(--color-surface-container-lowest)" />
        <path d="M18 10 L25 13 V18 C25 22 18 26 18 26 C18 26 11 22 11 18 V13 Z" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <path className="shield-check" d="M15 18 L17 20 L21 16" stroke="var(--color-success, #2E9E5B)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* ── Ray Connectors with Stroke Dashoffset Animation ── */}
      <path className="data-ray" d="M91 63 C130 75 160 85 165 95" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="100" fill="none" />
      <path className="data-ray" d="M290 63 C250 75 220 85 215 95" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="100" fill="none" />

      {/* Floating Question Bubble */}
      <g className="query-bubble" transform="translate(100, 20)">
        <rect x="0" y="0" width="105" height="24" rx="12" stroke="var(--color-primary)" strokeWidth="1.5" fill="var(--color-surface-container-lowest)" />
        <text x="12" y="15" fontSize="8" fontWeight="600" fill="var(--color-on-surface)" fontFamily="sans-serif">Sauna hours today?</text>
      </g>

      {/* Floating Verified Answer Bubble */}
      <g className="answer-bubble" transform="translate(175, 155)">
        <rect x="0" y="0" width="115" height="24" rx="12" stroke="var(--color-success, #2E9E5B)" strokeWidth="1.5" fill="var(--color-surface-container-lowest)" />
        <polyline points="12 12 15 15 20 9" stroke="var(--color-success, #2E9E5B)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="25" y="15" fontSize="8" fontWeight="600" fill="var(--color-on-surface)" fontFamily="sans-serif">Verified: Open til 8 PM</text>
      </g>
    </svg>
  )
}

/**
 * STEP 3 OUTLINE MOTION ILLUSTRATION: Track Records & Online Renewals
 * Features an outline Spotter digital membership pass with holographic chip,
 * sequential attendance checkmark dots, contactless payment renewal waves, and single-device lock security.
 */
export function StepThreeIllustration({ className }: IllustrationProps) {
  const containerRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return

      // Smooth pass tilt levitation
      gsap.to('.pass-card', {
        y: -5,
        rotation: 1,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        transformOrigin: 'center',
      })

      // Main timeline for renewal waves & calendar attendance dots
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 })

      gsap.set('.cal-dot', { scale: 0, opacity: 0, transformOrigin: 'center' })
      gsap.set('.pay-wave', { opacity: 0, scale: 0.8, transformOrigin: 'center' })
      gsap.set('.lock-shackle', { y: -4 })
      gsap.set('.active-meter', { strokeDashoffset: 95 })

      // Padlock snaps locked
      tl.to('.lock-shackle', { y: 0, duration: 0.35, ease: 'power2.in' })

      // Active days meter fills
      tl.to('.active-meter', { strokeDashoffset: 20, duration: 1.2, ease: 'power2.out' }, '-=0.1')

      // Attendance calendar nodes light up
      tl.to('.cal-dot', {
        scale: 1,
        opacity: 1,
        stagger: 0.12,
        duration: 0.3,
        ease: 'back.out(2)',
      }, '-=0.8')

      // Paystack contactless renewal waves radiate outward
      tl.to('.pay-wave', {
        opacity: 0.8,
        scale: 1.25,
        stagger: 0.15,
        duration: 0.6,
        ease: 'power1.out',
      })
      .to('.pay-wave', { opacity: 0, duration: 0.3 }, '-=0.2')

      tl.to({}, { duration: 1.5 })
      tl.to('.cal-dot', { scale: 0, opacity: 0, duration: 0.3 })
      tl.to('.lock-shackle', { y: -4, duration: 0.3 }, '<')
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <svg
      ref={containerRef}
      viewBox="0 0 380 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* ── Spotter Membership Pass Card (Left) ── */}
      <g className="pass-card" transform="translate(65, 30)">
        {/* Pass body */}
        <rect
          x="0"
          y="0"
          width="155"
          height="100"
          rx="12"
          stroke="var(--color-primary)"
          strokeWidth="2"
          fill="var(--color-surface-container-lowest)"
        />
        {/* Pass header stripe */}
        <path d="M0 12 C0 5.37 5.37 0 12 0 H143 C149.63 0 155 5.37 155 12 V24 H0 Z" fill="var(--color-primary-container)" />
        <text x="12" y="16" fontSize="8" fontWeight="700" letterSpacing="0.08em" fill="var(--color-on-primary-container)" fontFamily="sans-serif">SPOTTER PASS</text>

        {/* Outline chip */}
        <rect x="12" y="34" width="22" height="18" rx="3" stroke="var(--color-outline)" strokeWidth="1.5" fill="none" />
        <line x1="12" y1="43" x2="34" y2="43" stroke="var(--color-outline)" strokeWidth="1" />
        <line x1="23" y1="34" x2="23" y2="52" stroke="var(--color-outline)" strokeWidth="1" />

        {/* Contactless waves on card */}
        <path className="pay-wave" d="M42 38 A8 8 0 0 1 42 48" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
        <path className="pay-wave" d="M46 35 A12 12 0 0 1 46 51" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
        <path className="pay-wave" d="M50 32 A16 16 0 0 1 50 54" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />

        {/* Active Days Meter & Count */}
        <text x="12" y="70" fontSize="7" fontWeight="600" fill="var(--color-text-secondary)" fontFamily="sans-serif">REMAINING BALANCE</text>
        <text x="12" y="86" fontSize="13" fontWeight="800" fill="var(--color-on-surface)" fontFamily="monospace">30 DAYS</text>

        {/* Radial Meter Arc */}
        <circle cx="128" cy="65" r="15" stroke="var(--color-outline-variant)" strokeWidth="3" fill="none" />
        <circle
          className="active-meter"
          cx="128"
          cy="65"
          r="15"
          stroke="var(--color-primary)"
          strokeWidth="3"
          strokeDasharray="95"
          strokeDashoffset="20"
          strokeLinecap="round"
          transform="rotate(-90 128 65)"
          fill="none"
        />
        <text x="128" y="68" textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--color-primary)" fontFamily="sans-serif">100%</text>
      </g>

      {/* ── Attendance History Calendar Streak (Right) ── */}
      <g transform="translate(235, 30)">
        <rect
          x="0"
          y="0"
          width="90"
          height="100"
          rx="10"
          stroke="var(--color-outline)"
          strokeWidth="1.5"
          fill="var(--color-surface-container-lowest)"
        />
        <text x="45" y="18" textAnchor="middle" fontSize="7" fontWeight="700" letterSpacing="0.06em" fill="var(--color-text-secondary)" fontFamily="sans-serif">
          ATTENDANCE
        </text>
        <line x1="8" y1="24" x2="82" y2="24" stroke="var(--color-outline-variant)" strokeWidth="1" />

        {/* Calendar Day Grid with Sequential Dots */}
        {/* Row 1 */}
        <g transform="translate(18, 36)">
          <circle cx="0" cy="0" r="4" stroke="var(--color-outline-variant)" strokeWidth="1" />
          <circle className="cal-dot" cx="0" cy="0" r="3.5" fill="var(--color-primary)" stroke="none" />
        </g>
        <g transform="translate(36, 36)">
          <circle cx="0" cy="0" r="4" stroke="var(--color-outline-variant)" strokeWidth="1" />
          <circle className="cal-dot" cx="0" cy="0" r="3.5" fill="var(--color-primary)" stroke="none" />
        </g>
        <g transform="translate(54, 36)">
          <circle cx="0" cy="0" r="4" stroke="var(--color-outline-variant)" strokeWidth="1" />
          <circle className="cal-dot" cx="0" cy="0" r="3.5" fill="var(--color-primary)" stroke="none" />
        </g>

        {/* Row 2 */}
        <g transform="translate(18, 54)">
          <circle cx="0" cy="0" r="4" stroke="var(--color-outline-variant)" strokeWidth="1" />
          <circle className="cal-dot" cx="0" cy="0" r="3.5" fill="var(--color-primary)" stroke="none" />
        </g>
        <g transform="translate(36, 54)">
          <circle cx="0" cy="0" r="4" stroke="var(--color-outline-variant)" strokeWidth="1" />
          <circle className="cal-dot" cx="0" cy="0" r="3.5" fill="var(--color-primary)" stroke="none" />
        </g>
        <g transform="translate(54, 54)">
          <circle cx="0" cy="0" r="4" stroke="var(--color-outline-variant)" strokeWidth="1" />
          <circle className="cal-dot" cx="0" cy="0" r="3.5" fill="var(--color-primary)" stroke="none" />
        </g>

        {/* Row 3 */}
        <g transform="translate(18, 72)">
          <circle cx="0" cy="0" r="4" stroke="var(--color-outline-variant)" strokeWidth="1" />
          <circle className="cal-dot" cx="0" cy="0" r="3.5" fill="var(--color-primary)" stroke="none" />
        </g>
        <g transform="translate(36, 72)">
          <circle cx="0" cy="0" r="4" stroke="var(--color-outline-variant)" strokeWidth="1" />
          <circle className="cal-dot" cx="0" cy="0" r="3.5" fill="var(--color-primary)" stroke="none" />
        </g>
        <g transform="translate(54, 72)">
          <circle cx="0" cy="0" r="4" stroke="var(--color-outline-variant)" strokeWidth="1" />
          <circle className="cal-dot" cx="0" cy="0" r="3.5" fill="var(--color-primary)" stroke="none" />
        </g>

        {/* Badge footer */}
        <text x="45" y="90" textAnchor="middle" fontSize="6.5" fontWeight="600" fill="var(--color-success, #2E9E5B)" fontFamily="sans-serif">
          ✓ Verified Streak
        </text>
      </g>

      {/* ── Single-Device Binding Padlock Badge (Bottom Center) ── */}
      <g transform="translate(165, 140)">
        <rect x="0" y="0" width="50" height="42" rx="8" stroke="var(--color-outline)" strokeWidth="1.5" fill="var(--color-surface-container-lowest)" />
        {/* Shackle */}
        <path
          className="lock-shackle"
          d="M18 16 V11 C18 7.5 32 7.5 32 11 V16"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Body */}
        <rect x="14" y="16" width="22" height="16" rx="3" stroke="var(--color-on-surface)" strokeWidth="1.5" fill="var(--color-surface-container-high)" />
        <circle cx="25" cy="23" r="1.8" fill="var(--color-primary)" />
        <line x1="25" y1="24" x2="25" y2="28" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
        <text x="25" y="37" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="var(--color-text-secondary)" fontFamily="sans-serif">BOUND</text>
      </g>
    </svg>
  )
}
