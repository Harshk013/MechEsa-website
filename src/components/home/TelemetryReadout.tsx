export function TelemetryReadout({ label, value = '---', unit = '', status = 'STANDBY' }: { label: string; value?: string; unit?: string; status?: string }) {
  return <div className="telemetry-readout">
    <span className="technical-small">{label}</span>
    <strong>{value}</strong>
    <span className="telemetry-readout__unit technical-small">{unit}</span>
    <span className="telemetry-readout__status technical-small">{status}</span>
  </div>
}
