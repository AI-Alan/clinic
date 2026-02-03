/**
 * Map Mongoose/DB errors to HTTP status and a safe user-facing message.
 * Use in API route catch blocks: return NextResponse.json({ error: message }, { status })
 */
export function getApiErrorResponse(err: unknown): { status: number; message: string } {
  if (err && typeof err === 'object') {
    const e = err as { name?: string; code?: number; errors?: Record<string, { message?: string }>; message?: string }
    // Mongoose validation error
    if (e.name === 'ValidationError' && e.errors) {
      const first = Object.values(e.errors)[0]
      const msg = first?.message || 'Validation failed'
      return { status: 400, message: msg }
    }
    // MongoDB duplicate key (unique index)
    if (e.code === 11000) {
      return { status: 400, message: 'A record with this value already exists (e.g. email already in use).' }
    }
    // MongoServerError (newer driver) duplicate key
    if (e.name === 'MongoServerError' && e.code === 11000) {
      return { status: 400, message: 'A record with this value already exists (e.g. email already in use).' }
    }
  }
  return { status: 500, message: 'Internal server error' }
}
