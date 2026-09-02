import { CursorTarget } from '../../interaction/CursorTarget'
import { TechnicalLabel } from '../../typography/TechnicalLabel'
import { useRepresentation } from '../../../app/providers/RepresentationProvider'

export function RepresentationToggle() {
  const { mode, toggleMode } = useRepresentation()
  const nextMode = mode === 'reality' ? 'blueprint' : 'reality'

  return (
    <CursorTarget intent="button" label={nextMode === 'blueprint' ? 'BLUEPRINT' : 'REALITY'}>
      <div className="representation-control">
        <TechnicalLabel className="representation-control__label">REPRESENTATION</TechnicalLabel>
        <button
          type="button"
          className="representation-control__switch"
          onClick={toggleMode}
          aria-label={`Switch to ${nextMode} representation`}
          aria-pressed={mode === 'blueprint'}
          data-mode={mode}
        >
          <span className="representation-control__option" data-active={mode === 'reality'}>REALITY</span>
          <span className="representation-control__track" aria-hidden="true"><i /></span>
          <span className="representation-control__option" data-active={mode === 'blueprint'}>BLUEPRINT</span>
        </button>
      </div>
    </CursorTarget>
  )
}
