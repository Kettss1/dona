import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useI18n } from '../i18n';
import { ItemList } from './ItemList';

const API_URL = 'http://localhost:4000';

interface MenuItem {
  id: string;
  section_id: string;
  name: string;
  description: string | null;
  price: string | null;
  tags: string[];
  sort_order: number;
}

interface MenuSection {
  id: string;
  menu_id: string;
  title: string;
  sort_order: number;
  items: MenuItem[];
}

interface Props {
  menuId: string;
  sections: MenuSection[];
  onUpdate: () => void;
}

function SortableSection({
  section,
  onUpdate,
}: {
  section: MenuSection;
  onUpdate: () => void;
}) {
  const { t } = useI18n();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(section.title);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveTitle = async () => {
    if (!title.trim()) return;
    await fetch(`${API_URL}/api/sections/${section.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title: title.trim() }),
    });
    setEditing(false);
    onUpdate();
  };

  const handleDelete = async () => {
    if (!confirm(t('editor.section.delete.confirm'))) return;
    await fetch(`${API_URL}/api/sections/${section.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    onUpdate();
  };

  return (
    <div ref={setNodeRef} style={style} className="section-card">
      <div className="section-header">
        <button className="drag-handle" {...attributes} {...listeners} aria-label="Drag">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        {editing ? (
          <div className="inline-edit">
            <input
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
            />
          </div>
        ) : (
          <button type="button" className="section-title" onClick={() => setEditing(true)}>{section.title}</button>
        )}
        <button className="btn-icon btn-danger" onClick={handleDelete} title={t('editor.section.delete')}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>
      <div className="section-body">
        <ItemList sectionId={section.id} items={section.items} onUpdate={onUpdate} />
      </div>
    </div>
  );
}

export function SectionList({ menuId, sections, onUpdate }: Props) {
  const { t } = useI18n();
  const [newTitle, setNewTitle] = useState('');
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex);

    await fetch(`${API_URL}/api/menus/${menuId}/sections/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ sectionIds: reordered.map((s) => s.id) }),
    });
    onUpdate();
  };

  const handleAddSection = async () => {
    if (!newTitle.trim()) return;
    await fetch(`${API_URL}/api/menus/${menuId}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title: newTitle.trim() }),
    });
    setNewTitle('');
    onUpdate();
  };

  return (
    <div className="sections">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((section) => (
            <SortableSection key={section.id} section={section} onUpdate={onUpdate} />
          ))}
        </SortableContext>
      </DndContext>
      <div className="add-section">
        <input
          className="form-input"
          placeholder={t('editor.section.placeholder')}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
        />
        <button className="btn btn-primary" onClick={handleAddSection} disabled={!newTitle.trim()}>
          {t('editor.section.add')}
        </button>
      </div>
    </div>
  );
}
