import type { ReactNode } from 'react'
import styles from './auth.module.css'

/**
 * Shared full-height shell for the FR-6 activation screens.
 */
export function AuthShell({
  title,
  description,
  footnote,
  children,
}: {
  title: string
  description: string
  footnote?: ReactNode
  children: ReactNode
}) {
  return (
    <main className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo} aria-hidden="true">
            <span className={styles.logoLetter}>S</span>
          </div>

          <h1 className={styles.heading}>{title}</h1>
          <p className={styles.subtext}>{description}</p>
        </div>

        {children}

        {footnote ? (
          <div className={styles.footnote}>{footnote}</div>
        ) : null}
      </div>
    </main>
  )
}
