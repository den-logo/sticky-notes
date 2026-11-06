import type { NOTES_LOAD_STATUS } from '../constants/notesPersistence'

export type LoadStatus = typeof NOTES_LOAD_STATUS[keyof typeof NOTES_LOAD_STATUS]
