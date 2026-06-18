const STORAGE_KEY = 'electrical-recent-v1'
const MAX_RECENT = 5

function loadRecents(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

let recents: string[] = loadRecents()
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

export const recentElementsStore = {
  getRecents(): string[] { return recents },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  push(typeId: string) {
    recents = [typeId, ...recents.filter((r) => r !== typeId)].slice(0, MAX_RECENT)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(recents)) } catch { /* quota */ }
    notify()
  },
}
