import { NoteGenerationResponse } from "../types";

export const generateNoteFromText = async (text: string): Promise<NoteGenerationResponse> => {
  const res = await fetch('/api/generate-note', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to generate note');
  }

  const data = await res.json();
  return data as NoteGenerationResponse;
};
