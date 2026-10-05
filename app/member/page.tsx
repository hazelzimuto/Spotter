import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession, destroySession } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Member Portal',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function MemberPage() {
  const session = await getSession()
  if (!session) {
    redirect('/')
  }

  async function handleSignOut() {
    'use server'
    await destroySession()
    redirect('/')
  }

  return (
    <main
      style={{
        maxWidth: '640px',
        margin: '4rem auto',
        padding: '1.5rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', margin: 0, color: '#f3f4f6' }}>
          Spotter Member Portal
        </h1>
        <form action={handleSignOut}>
          <button
            type="submit"
            style={{
              padding: '1.125rem 1.125rem',
              borderRadius: '0.5rem',
              border: '1px solid #374151',
              background: '#1f2937',
              color: '#f9fafb',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Sign Out
          </button>
        </form>
      </header>

      <section
        style={{
          background: '#111827',
          border: '1px solid #1f2937',
          borderRadius: '12px',
          padding: '1.5rem',
        }}
      >
        <p style={{ margin: '0 0 0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
          Logged in as
        </p>
        <p
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            margin: '0 0 1rem',
            color: '#f9fafb',
          }}
        >
          {session.fullName}
        </p>
        <span
          style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            borderRadius: '999px',
            background: 'rgba(34, 197, 94, 0.15)',
            color: '#4ade80',
            fontSize: '0.8125rem',
            fontWeight: 500,
          }}
        >
          {session.tier} Member
        </span>
      </section>
    </main>
  )
}
