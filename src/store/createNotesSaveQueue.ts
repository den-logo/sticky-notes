import type { NotesApi } from '../api/notes/notesApi'
import type { NoteData } from '../types/note'

export function createNotesSaveQueue(api: NotesApi, onErrorChange: (hasError: boolean) => void) {
  let pending: readonly NoteData[] | null = null
  let running = false

  async function drain() {
    if (running || pending === null) return
    running = true
    onErrorChange(false)

    while (pending !== null) {
      const snapshot = pending
      pending = null
      try {
        await api.saveNotes(snapshot)
      } catch {
        if (pending !== null) continue
        pending = snapshot
        running = false
        onErrorChange(true)
        return
      }
    }

    running = false
  }

  return (notes: readonly NoteData[]) => {
    // Coalesce waiting snapshots; never run writes concurrently or mutate a snapshot.
    pending = notes
    void drain()
  }
}
