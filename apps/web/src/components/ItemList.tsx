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

interface Props {
  sectionId: string;
  items: MenuItem[];
  onUpdate: () => void;
}

function SortableItem({
  item,
  onUpdate,
}: {
  item: MenuItem;
  onUpdate: () => void;
}) {
  const { t } = useI18n();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description || '');
  const [price, setPrice] = useState(item.price || '');

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = async () => {
    await fetch(`${API_URL}/api/items/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, description, price: price || null }),
    });
    setEditing(false);
    onUpdate();
  };

  const handleDelete = async () => {
    await fetch(`${API_URL}/api/items/${item.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    onUpdate();
  };

  return (
    <div ref={setNodeRef} style={style} className="item-row">
      <button className="drag-handle" {...attributes} {...listeners} aria-label="Drag">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      {editing ? (
        <div className="item-edit-form">
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('editor.item.name')} />
          <div className="item-edit-row">
            <input className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('editor.item.description')} />
            <input className="form-input item-price-input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={t('editor.item.price')} type="number" step="0.01" />
          </div>
          <div className="item-edit-actions">
            <button className="btn btn-primary" onClick={handleSave}>{t('editor.item.save')}</button>
            <button className="btn btn-secondary" onClick={() => setEditing(false)}>{t('editor.item.cancel')}</button>
          </div>
        </div>
      ) : (
        <button type="button" className="item-display" onClick={() => setEditing(true)}>
          <span className="item-name">{item.name}</span>
          {item.price && <span className="item-price">${item.price}</span>}
          {item.description && <span className="item-desc">{item.description}</span>}
        </button>
      )}
      {!editing && (
        <button className="btn-icon btn-danger item-delete" onClick={handleDelete}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function ItemList({ sectionId, items, onUpdate }: Props) {
  const { t } = useI18n();
  const [newName, setNewName] = useState('');
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);

    await fetch(`${API_URL}/api/sections/${sectionId}/items/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ itemIds: reordered.map((i) => i.id) }),
    });
    onUpdate();
  };

  const handleAddItem = async () => {
    if (!newName.trim()) return;
    await fetch(`${API_URL}/api/sections/${sectionId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName('');
    onUpdate();
  };

  return (
    <div className="items">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem key={item.id} item={item} onUpdate={onUpdate} />
          ))}
        </SortableContext>
      </DndContext>
      <div className="add-item">
        <input
          className="form-input"
          placeholder={t('editor.item.placeholder')}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
        />
        <button className="btn btn-secondary" onClick={handleAddItem} disabled={!newName.trim()}>
          {t('editor.item.add')}
        </button>
      </div>
    </div>
  );
}
