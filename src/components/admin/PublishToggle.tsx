'use client';

import { useState, useTransition } from 'react';
import type { ActionResult } from '@/actions/types';

/**
 * Publish/unpublish pill. Delegates the actual mutation to an `action` supplied
 * by the parent list (which calls the relevant Server Action). Optimistic:
 * flips immediately, reverts if the action reports failure.
 */
export default function PublishToggle({
  published,
  action,
}: {
  published: boolean;
  action: (next: boolean) => Promise<ActionResult>;
}) {
  const [on, setOn] = useState(published);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !on;
    setOn(next);
    startTransition(async () => {
      const res = await action(next);
      if (!res.ok) setOn(!next); // revert on failure
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={on}
      title={on ? 'Published — click to unpublish' : 'Draft — click to publish'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.3rem 0.7rem',
        borderRadius: '100px',
        border: '1px solid var(--border)',
        background: on ? 'rgba(34,197,94,0.12)' : 'var(--input-bg)',
        color: on ? '#22c55e' : 'var(--text-muted)',
        fontSize: '0.75rem',
        fontWeight: 700,
        fontFamily: "'Manrope', sans-serif",
        cursor: pending ? 'wait' : 'pointer',
        opacity: pending ? 0.6 : 1,
        transition: 'all 0.2s ease',
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: on ? '#22c55e' : 'var(--text-muted)',
          display: 'inline-block',
        }}
      />
      {on ? 'Published' : 'Draft'}
    </button>
  );
}
