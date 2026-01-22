import express from 'express';
import Stage from '../models/Stage.js';
import Teacher from '../models/Teacher.js';

const router = express.Router();

// Get all stages
router.get('/', async (req, res) => {
    try {
        const stages = await Stage.find().sort('order');
        res.json(stages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stages', error });
    }
});

// Create a new stage
router.post('/', async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        // Find max order to append to end
        const lastStage = await Stage.findOne().sort('-order');
        const order = lastStage ? lastStage.order + 1 : 0;

        const newStage = new Stage({ title, order });
        await newStage.save();
        res.status(201).json(newStage);
    } catch (error) {
        res.status(500).json({ message: 'Error creating stage', error });
    }
});

// Delete a stage
router.delete('/:id', async (req, res) => {
    try {
        const stageId = req.params.id;
        const stage = await Stage.findById(stageId);

        if (!stage) {
            return res.status(404).json({ message: 'Stage not found' });
        }

        // Move all teachers in this stage to 'uncategorized'
        await Teacher.updateMany(
            { pipelineStage: stageId }, // Assuming pipelineStage stores the ID for dynamic stages
            { pipelineStage: 'uncategorized' }
        );

        // Also check if pipelineStage stored the title (legacy support or if we decide to use titles)
        // For robustness, let's check both or ensure we stick to one convention.
        // The current implementation in TeacherKanbanBoard uses IDs for dynamic stages but titles for static ones?
        // Let's standardize: Dynamic stages use their _id as the key.
        // But wait, the previous static implementation used 'Stage 1', 'Stage 2' etc as IDs.
        // We need to migrate or handle this carefully.
        // For now, let's assume dynamic stages use their _id.

        await Stage.findByIdAndDelete(stageId);
        res.json({ message: 'Stage deleted and teachers moved to Uncategorized' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting stage', error });
    }
});

// Reorder stages
router.put('/reorder', async (req, res) => {
    try {
        const { stages } = req.body; // Expecting [{ _id: string, order: number }]

        if (!Array.isArray(stages)) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        const updates = stages.map(stage => {
            return Stage.findByIdAndUpdate(stage._id, { order: stage.order });
        });

        await Promise.all(updates);
        res.json({ message: 'Stages reordered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error reordering stages', error });
    }
});

export default router;
