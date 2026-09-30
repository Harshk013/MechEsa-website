import { TechnicalLabel } from '../../typography/TechnicalLabel'
import { useRepresentation } from '../../../app/providers/RepresentationProvider'
import type { EngineeringSystem } from '../../../data/home'
import { ThermodynamicsInstrument } from './ThermodynamicsInstrument'
import { FluidMechanicsInstrument } from './FluidMechanicsInstrument'
import { EngineeringFlowDiagram } from './EngineeringFlowDiagram'
import { ManufacturingInstrument } from './ManufacturingInstrument'
import { RoboticsInstrument } from './RoboticsInstrument'
import { MechanicalSystemsInstrument } from './MechanicalSystemsInstrument'
import './engineeringLab.css'

export function EngineeringLab({ selectedSystem: selected }: { selectedSystem: EngineeringSystem }) {
  const { isBlueprint } = useRepresentation()
  const thermo = selected.id === 'thermodynamics'
  const fluid = selected.id === 'fluid'
  const manufacturing = selected.id === 'manufacturing'
  const robotics = selected.id === 'robotics'
  const mechanicalStudy = ['design', 'automotive', 'materials', 'mechatronics'].includes(selected.id)

  return (
    <div
      className={`engineering-lab ${isBlueprint ? 'is-blueprint' : 'is-reality'}`}
      data-representation={isBlueprint ? 'blueprint' : 'reality'}
      data-system={selected.id}
    >
      <div className="engineering-lab__topline">
        <TechnicalLabel prefix="LAB">ENGINEERING SYSTEMS</TechnicalLabel>
        <span className="technical-small">
          REPRESENTATION / {isBlueprint ? 'BLUEPRINT' : 'REALITY'}
        </span>
      </div>

      <div className="engineering-lab__instrument">
        {thermo ? (
          <ThermodynamicsInstrument />
        ) : fluid ? (
          <FluidMechanicsInstrument />
        ) : manufacturing ? (
          <ManufacturingInstrument />
        ) : robotics ? (
          <RoboticsInstrument />
        ) : mechanicalStudy ? (
          <MechanicalSystemsInstrument
            key={selected.id}
            system={selected.id as 'design' | 'automotive' | 'materials' | 'mechatronics'}
          />
        ) : null}
      </div>

      {thermo && <EngineeringFlowDiagram active />}
    </div>
  )
}
