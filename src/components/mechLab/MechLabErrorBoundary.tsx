import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class MechLabErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MechLab ErrorBoundary caught an error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            gap: '1rem',
          }}
          role="alert"
        >
          <div
            style={{
              padding: '0.4rem 0.8rem',
              background: 'rgba(199, 123, 120, 0.15)',
              border: '1px solid rgba(199, 123, 120, 0.4)',
              borderRadius: '2px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.75rem',
              color: 'var(--sys-thermodynamics, #c77b78)',
              letterSpacing: '0.1em',
            }}
          >
            LAB MODULE UNAVAILABLE
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '1.25rem',
              color: 'var(--color-text)',
              margin: 0,
            }}
          >
            Laboratory Module Could Not Be Initialized
          </h2>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--color-text-muted)',
              maxWidth: '480px',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            A module loading error occurred. Please try reloading the experiment or return to the Mech
            Lab dashboard.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="mechanical-button mechanical-button--secondary"
              onClick={() => this.setState({ hasError: false })}
            >
              TRY AGAIN
            </button>
            <Link to="/lab" className="mechanical-button mechanical-button--primary">
              RETURN TO MECH LAB
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
