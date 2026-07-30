export type CanvasStatus = "Draft" | "In Progress" | "Completed"

export interface Canvas {
  id: string
  title: string
  clientName: string
  status: CanvasStatus
  lastModified: string
  createdAt: string
  previewImage: string
  content: string
}

/** Fields the editor can write back to a canvas. */
export type CanvasUpdate = Partial<Pick<Canvas, "title" | "content" | "lastModified">>

/** Payload collected by the create-canvas form. */
export interface NewCanvasInput {
  clientName: string
  projectType: string
  notes: string
}

export interface Comment {
  id: string
  text: string
  author: string
  timestamp: string
}
