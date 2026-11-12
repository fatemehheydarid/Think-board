import axios from 'axios'
import type { Note, NoteInput } from '../types/note'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

interface ApiEnvelope<T> {
  success?: boolean
  response?: T
}

function unwrap<T>(data: T | ApiEnvelope<T>): T {
  if (
    typeof data === 'object' &&
    data !== null &&
    'response' in data &&
    data.response !== undefined
  ) {
    return data.response
  }

  return data as T
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as
      | { message?: string; error?: string }
      | undefined
    return (
      body?.message ??
      body?.error ??
      (error.code === 'ECONNABORTED'
        ? 'The request took too long. Please try again.'
        : 'Could not connect to the notes service. Please try again.')
    )
  }

  return error instanceof Error ? error.message : 'Something went wrong.'
}

export async function fetchNotes(): Promise<Note[]> {
  const { data } = await api.get<Note[] | ApiEnvelope<Note[]>>('/notes')
  return unwrap(data)
}

export async function fetchNote(id: string): Promise<Note> {
  const { data } = await api.get<Note | ApiEnvelope<Note>>(`/notes/${id}`)
  return unwrap(data)
}

export async function createNote(input: NoteInput): Promise<Note> {
  const { data } = await api.post<Note | ApiEnvelope<Note>>('/notes', input)
  return unwrap(data)
}

export async function updateNote(id: string, input: NoteInput): Promise<Note> {
  const { data } = await api.put<Note | ApiEnvelope<Note>>(
    `/notes/${id}`,
    input,
  )
  return unwrap(data)
}

export async function deleteNote(id: string): Promise<void> {
  await api.delete(`/notes/${id}`)
}
