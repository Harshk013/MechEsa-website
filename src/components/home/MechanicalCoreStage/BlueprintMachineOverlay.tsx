import { useRepresentation } from '../../../app/providers/RepresentationProvider'

export function BlueprintMachineOverlay() {
  const { isBlueprint } = useRepresentation()

  return (
    <div className="blueprint-machine-overlay" data-active={isBlueprint} aria-hidden="true">
      <svg className="blueprint-machine-overlay__drawing" viewBox="0 0 1000 820" preserveAspectRatio="none">
        <g className="blueprint-machine-overlay__grid">
          <path d="M90 70H910M90 150H910M90 230H910M90 310H910M90 390H910M90 470H910M90 550H910M90 630H910M90 710H910" />
          <path d="M120 45V770M200 45V770M280 45V770M360 45V770M440 45V770M520 45V770M600 45V770M680 45V770M760 45V770M840 45V770" />
        </g>
        <g className="blueprint-machine-overlay__construction">
          <path d="M500 90V730M180 410H820" />
          <circle cx="500" cy="410" r="126" />
          <circle cx="500" cy="410" r="90" />
          <circle cx="500" cy="410" r="12" />
          <circle cx="290" cy="500" r="78" />
          <circle cx="290" cy="500" r="50" />
          <circle cx="705" cy="270" r="62" />
          <circle cx="705" cy="270" r="38" />
          <path d="M290 500L500 410L705 270M290 500L220 650M500 410L820 410" />
        </g>
        <g className="blueprint-machine-overlay__dimensions">
          <path d="M500 78V48M470 63H530M500 48L494 58M500 48L506 58" />
          <path d="M140 410H90M115 385V435M90 410L100 404M90 410L100 416" />
          <path d="M500 744V772M470 758H530M500 772L494 762M500 772L506 762" />
        </g>
      </svg>
      <span className="blueprint-machine-overlay__datum blueprint-machine-overlay__datum--axis">AXIS / A</span>
      <span className="blueprint-machine-overlay__datum blueprint-machine-overlay__datum--shaft">Ø SHAFT</span>
      <span className="blueprint-machine-overlay__datum blueprint-machine-overlay__datum--gear">PRIMARY GEAR / G32</span>
      <span className="blueprint-machine-overlay__datum blueprint-machine-overlay__datum--crank">CRANK / C01</span>
      <span className="blueprint-machine-overlay__datum blueprint-machine-overlay__datum--piston">PISTON / P01</span>
      <span className="blueprint-machine-overlay__datum blueprint-machine-overlay__datum--ref">REF / MACHINE CORE</span>
    </div>
  )
}
