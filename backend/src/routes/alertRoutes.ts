import express, { Request, Response } from 'express';
import AlertRule from '../models/AlertRule.js';

const router = express.Router();

/**
 * @route   GET /api/alerts
 * @desc    Get all alert rules
 * @access  Private
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const rules = await AlertRule.find({}).sort({ createdAt: -1 });
        res.json(rules);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching alert rules' });
    }
});

/**
 * @route   POST /api/alerts
 * @desc    Create a new alert rule
 * @access  Private
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const newRule = new AlertRule(req.body);
        const savedRule = await newRule.save();
        res.status(201).json(savedRule);
    } catch (error) {
        res.status(500).json({ message: 'Error creating alert rule' });
    }
});

/**
 * @route   PATCH /api/alerts/:id
 * @desc    Update an alert rule
 * @access  Private
 */
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedRule = await AlertRule.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedRule) {
            res.status(404).json({ message: 'Rule not found' });
            return;
        }
        res.json(updatedRule);
    } catch (error) {
        res.status(500).json({ message: 'Error updating alert rule' });
    }
});

/**
 * @route   DELETE /api/alerts/:id
 * @desc    Delete an alert rule
 * @access  Private
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedRule = await AlertRule.findByIdAndDelete(req.params.id);
        if (!deletedRule) {
            res.status(404).json({ message: 'Rule not found' });
            return;
        }
        res.json({ message: 'Rule deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting alert rule' });
    }
});

export default router;
