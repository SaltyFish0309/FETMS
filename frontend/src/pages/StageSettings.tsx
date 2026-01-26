import { useEffect, useState, useCallback, startTransition } from 'react';
import { stageService, type Stage } from '@/services/stageService';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableStageItem } from '@/components/settings/SortableStageItem';
import { CreateStageDialog } from '@/components/settings/CreateStageDialog';

export default function StageSettings() {
  const navigate = useNavigate();
  const [stages, setStages] = useState<Stage[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStageTitle, setNewStageTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadStages = useCallback(async () => {
    try {
      const data = await stageService.getAll();
      setStages(data);
    } catch (error) {
      console.error('Failed to load stages', error);
      toast.error('Failed to load stages');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStages();
  }, [loadStages]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      startTransition(() => {
        setStages((items) => {
          const oldIndex = items.findIndex((i) => i._id === active.id);
          const newIndex = items.findIndex((i) => i._id === over.id);
          const reordered = arrayMove(items, oldIndex, newIndex);
          const updated = reordered.map((item, index) => ({ ...item, order: index }));

          stageService
            .reorder(updated.map((s) => ({ _id: s._id, order: s.order })))
            .then(() => toast.success('Stages reordered'))
            .catch(() => toast.error('Failed to reorder stages'));

          return updated;
        });
      });
    }
  };

  const handleCreate = async () => {
    if (!newStageTitle.trim()) {
      toast.error('Stage title is required');
      return;
    }

    try {
      await stageService.create({ title: newStageTitle });
      toast.success('Stage created');
      setNewStageTitle('');
      setIsDialogOpen(false);
      await loadStages();
    } catch (error) {
      console.error('Failed to create stage', error);
      toast.error('Failed to create stage');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? All teachers in this stage will be moved to Uncategorized.')) {
      return;
    }

    try {
      await stageService.delete(id);
      toast.success('Stage deleted');
      await loadStages();
    } catch (error) {
      console.error('Failed to delete stage', error);
      toast.error('Failed to delete stage');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Pipeline Stages</h1>
          <p className="text-slate-500 mt-1">Manage recruitment pipeline stages. Drag to reorder.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Stage
        </Button>
      </div>

      <div className="max-w-2xl">
        {stages.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={stages.map((s) => s._id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {stages.map((stage) => (
                  <SortableStageItem key={stage._id} stage={stage} onDelete={handleDelete} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center p-12 border-2 border-dashed rounded-lg">
            <p className="text-slate-500">No stages found. Click "Add Stage" to create one.</p>
          </div>
        )}
      </div>

      <CreateStageDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={newStageTitle}
        onTitleChange={setNewStageTitle}
        onCreate={handleCreate}
      />
    </div>
  );
}
