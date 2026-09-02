type HandoffStatusProps = { status: string }

export function HandoffStatus({ status }: HandoffStatusProps) {
  return (
    <aside className="handoff-status" aria-live="polite">
      <div className="handoff-status__header">
        <span>SYSTEM STATUS</span>
        <i aria-hidden="true" />
      </div>
      <dl>
        <div><dt>CORE</dt><dd>ONLINE</dd></div>
        <div><dt>MOTION</dt><dd>ACTIVE</dd></div>
        <div><dt>ENGINEERING</dt><dd>CONNECTED</dd></div>
        <div><dt>HANDOFF</dt><dd>{status}</dd></div>
      </dl>
    </aside>
  )
}
