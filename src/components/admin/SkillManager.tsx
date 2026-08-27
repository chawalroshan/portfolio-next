'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2, Plus, Save, X, Loader2 } from 'lucide-react';
import {
  createSkill, updateSkill, deleteSkill, toggleSkillPublished, reorderSkills,
} from '@/actions/skills';
import { SKILL_ICON_KEYS, getSkillIcon } from '@/lib/icons';
import PublishToggle from './PublishToggle';
import { card, label, input, primaryButton, ghostButton, dangerButton, errorText, mutedText, FONT } from './styles';

export type SkillRow = {
  id: string;
  name: string;
  category: string;
  icon: string;
  level: string;
  url: string | null;
  published: boolean;
};

type Draft = {
  name: string;
  category: string;
  icon: string;
  level: string;
  url: string;
};

const EMPTY_DRAFT: Draft = { name: '', category: 'Frontend', icon: SKILL_ICON_KEYS[0] ?? 'react', level: 'Intermediate', url: '' };
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

/**
 * Skills admin: an add/edit form on top of a drag-sortable list. Editing an
 * existing skill loads it into the form (update mode); the list persists its
 * order via reorderSkills on drop. Skills are lightweight, so this single-page
 * manager is friendlier than per-skill routes.
 */
export default function SkillManager({ initial }: { initial: SkillRow[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function resetForm() {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setError(null);
  }

  function startEdit(s: SkillRow) {
    setEditingId(s.id);
    setError(null);
    setDraft({ name: s.name, category: s.category, icon: s.icon, level: s.level, url: s.url ?? '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = { name: draft.name, category: draft.category, icon: draft.icon, level: draft.level, url: draft.url || null, published: true };
    // Capture before resetForm() clears them (the async callback closes over these).
    const wasEditingId = editingId;
    const snapshot = { name: draft.name, category: draft.category, icon: draft.icon, level: draft.level, url: draft.url || null };
    startTransition(async () => {
      const res = wasEditingId ? await updateSkill(wasEditingId, payload) : await createSkill(payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      // Keep the local list in sync — useState(initial) won't pick up the
      // refreshed server prop, so mutate items directly (append / replace).
      if (wasEditingId) {
        setItems((prev) => prev.map((it) => (it.id === wasEditingId ? { ...it, ...snapshot } : it)));
      } else if (res.id) {
        setItems((prev) => [...prev, { id: res.id!, ...snapshot, published: true }]);
      }
      resetForm();
      router.refresh();
    });
  }

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete “${name}”?`)) return;
    startTransition(async () => {
      const res = await deleteSkill(id);
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        if (editingId === id) resetForm();
        router.refresh();
      }
    });
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    startTransition(() => {
      void reorderSkills(next.map((i) => i.id));
    });
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Skills</h1>
        <p style={{ ...mutedText, marginTop: '0.25rem' }}>Grouped by category into tabs on your home page. Drag to reorder within the list.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <p style={{ fontWeight: 700, margin: 0, fontFamily: FONT }}>{editingId ? 'Edit skill' : 'Add a skill'}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={label}>Name</label>
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} style={input} required />
          </div>
          <div>
            <label style={label}>Category</label>
            <input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="Frontend, Backend…" style={input} required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={label}>Icon</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent)', display: 'inline-flex', fontSize: '1.15rem' }}>{getSkillIcon(draft.icon)}</span>
              <select value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} style={input}>
                {SKILL_ICON_KEYS.map((key) => <option key={key} value={key}>{key}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={label}>Level</label>
            <select value={draft.level} onChange={(e) => setDraft({ ...draft, level: e.target.value })} style={input}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>URL (optional)</label>
            <input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://…" style={input} />
          </div>
        </div>

        {error && <p style={errorText}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button type="submit" disabled={pending} style={{ ...primaryButton, opacity: pending ? 0.7 : 1, cursor: pending ? 'not-allowed' : 'pointer' }}>
            {pending ? <Loader2 className="w-4 h-4" style={{ animation: 'spin 1s linear infinite' }} /> : editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingId ? 'Save skill' : 'Add skill'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} style={ghostButton}>
              <X size={15} /> Cancel edit
            </button>
          )}
        </div>
      </form>

      {items.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', color: 'var(--text-muted)' }}>No skills yet.</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {items.map((item) => (
                <SkillRowItem
                  key={item.id}
                  item={item}
                  onEdit={() => startEdit(item)}
                  onDelete={() => handleDelete(item.id, item.name)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SkillRowItem({ item, onEdit, onDelete }: { item: SkillRow; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...card, padding: '0.7rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'grab', display: 'inline-flex', padding: 0, touchAction: 'none' }}
      >
        <GripVertical size={18} />
      </button>

      <span style={{ color: 'var(--accent)', display: 'inline-flex', fontSize: '1.25rem' }}>{getSkillIcon(item.icon)}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0, fontFamily: FONT }}>{item.name}</p>
        <p style={{ ...mutedText, margin: '0.1rem 0 0' }}>{item.category} · {item.level}</p>
      </div>

      <PublishToggle published={item.published} action={(next) => toggleSkillPublished(item.id, next)} />

      <button type="button" onClick={onEdit} style={ghostButton} aria-label="Edit"><Pencil size={15} /></button>
      <button type="button" onClick={onDelete} style={dangerButton} aria-label="Delete"><Trash2 size={15} /></button>
    </div>
  );
}
