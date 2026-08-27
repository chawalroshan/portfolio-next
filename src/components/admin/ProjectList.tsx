'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
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
import { GripVertical, Pencil, Trash2, Plus } from 'lucide-react';
import { reorderProjects, deleteProject, toggleProjectPublished } from '@/actions/projects';
import PublishToggle from './PublishToggle';
import { card, primaryButton, dangerButton, ghostButton, mutedText, FONT } from './styles';

export type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  techStack: string[];
};

/**
 * Admin project list with drag-to-reorder (persisted via reorderProjects),
 * publish toggle, edit link and delete. Reorder is optimistic; the new order
 * is written to the DB on drop.
 */
export default function ProjectList({ initial }: { initial: ProjectRow[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    startTransition(() => {
      void reorderProjects(next.map((i) => i.id));
    });
  }

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteProject(id);
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        router.refresh();
      }
    });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Projects</h1>
          <p style={{ ...mutedText, marginTop: '0.25rem' }}>Drag to reorder — the order is reflected on your home page.</p>
        </div>
        <Link href="/admin/projects/new" style={{ ...primaryButton, textDecoration: 'none' }}>
          <Plus className="w-4 h-4" /> New project
        </Link>
      </div>

      {items.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', color: 'var(--text-muted)' }}>
          No projects yet. Create your first one.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {items.map((item) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  onDelete={() => handleDelete(item.id, item.title)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableRow({ item, onDelete }: { item: ProjectRow; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 5 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        ...card,
        padding: '0.85rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
      }}
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

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, fontFamily: FONT }}>{item.title}</p>
        <p style={{ ...mutedText, margin: '0.15rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          /{item.slug} {item.techStack.length > 0 && `· ${item.techStack.join(', ')}`}
        </p>
      </div>

      <PublishToggle published={item.published} action={(next) => toggleProjectPublished(item.id, next)} />

      <Link href={`/admin/projects/${item.id}/edit`} style={{ ...ghostButton, textDecoration: 'none' }} aria-label="Edit">
        <Pencil size={15} />
      </Link>
      <button type="button" onClick={onDelete} style={dangerButton} aria-label="Delete">
        <Trash2 size={15} />
      </button>
    </div>
  );
}
