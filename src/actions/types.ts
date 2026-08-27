/** Discriminated result returned by every Server Action to the client forms. */
export type ActionResult =
  | { ok: true; id?: string; slug?: string }
  | { ok: false; error: string };
