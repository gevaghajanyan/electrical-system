import type { Connection } from '../types/panel'
import { parsePortId } from './portUtils'

export function getConnectionsForElement(connections: Connection[], elementId: string): Connection[] {
  return connections.filter((c) => {
    const from = parsePortId(c.fromPortId)
    const to = parsePortId(c.toPortId)
    return from?.elementId === elementId || to?.elementId === elementId
  })
}

export function isPortConnected(connections: Connection[], portId: string): boolean {
  return connections.some((c) => c.fromPortId === portId || c.toPortId === portId)
}

export function getConnectionForPort(connections: Connection[], portId: string): Connection | undefined {
  return connections.find((c) => c.fromPortId === portId || c.toPortId === portId)
}

export function canConnect(fromPortId: string, toPortId: string, connections: Connection[]): boolean {
  if (fromPortId === toPortId) return false
  const from = parsePortId(fromPortId)
  const to = parsePortId(toPortId)
  if (!from || !to) return false
  if (from.elementId === to.elementId) return false
  if (from.side === to.side) return false
  if (from.phase !== to.phase) return false

  // Input ports (top) allow only one incoming wire; output ports (bottom) can fan out
  const inputPortId = from.side === 'top' ? fromPortId : toPortId
  if (isPortConnected(connections, inputPortId)) return false

  // Prevent exact duplicate wires
  if (connections.some(
    (c) =>
      (c.fromPortId === fromPortId && c.toPortId === toPortId) ||
      (c.fromPortId === toPortId && c.toPortId === fromPortId)
  )) return false

  return true
}

export function removeConnectionsForElement(connections: Connection[], elementId: string): Connection[] {
  return connections.filter((c) => {
    const from = parsePortId(c.fromPortId)
    const to = parsePortId(c.toPortId)
    return from?.elementId !== elementId && to?.elementId !== elementId
  })
}
