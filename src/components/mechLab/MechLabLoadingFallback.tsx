export function MechLabLoadingFallback() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        color: 'var(--color-text)',
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '2px solid rgba(93, 156, 236, 0.25)',
          borderTopColor: 'var(--sys-thermodynamics, #c77b78)',
          animation: 'spin 0.8s linear infinite',
        }}
        aria-hidden="true"
      />
      <span
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.78rem',
          letterSpacing: '0.14em',
          color: 'var(--color-text-dim, #697276)',
        }}
      >
        INITIALIZING LAB...
      </span>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
