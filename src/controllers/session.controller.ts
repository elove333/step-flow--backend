import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Session from '../models/Session.model';
import { processMetrics } from '../utils/metrics';
import { getAIFeedback } from '../services/ai.service';

export const createSession = async (req: AuthRequest, res: Response) => {
  try {
    const { startTime, endTime, steps, distance, movementData, metadata } = req.body;

    // Validate input
    if (!startTime || !endTime || steps === undefined || distance === undefined) {
      return res.status(400).json({ 
        error: 'startTime, endTime, steps, and distance are required' 
      });
    }

    // Validate numeric ranges for steps and distance
    if (typeof steps !== 'number' || typeof distance !== 'number' || steps < 0 || distance < 0) {
      return res.status(400).json({
        error: 'steps and distance must be numbers greater than or equal to 0'
      });
    }

    // Validate startTime and endTime relationship
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      return res.status(400).json({
        error: 'endTime must be after startTime'
      });
    }

    // Process metrics
    const metrics = processMetrics({
      startTime: start,
      endTime: end,
      steps,
      distance,
      movementData: movementData || [],
    });

    // Create session
    const session = new Session({
      userId: req.userId,
      startTime: start,
      endTime: end,
      duration: metrics.duration,
      steps,
      distance,
      avgPace: metrics.avgPace,
      calories: metrics.calories,
      movementData: movementData || [],
      metadata: metadata || {},
    });

    await session.save();

    // Get AI feedback asynchronously
    getAIFeedback(session._id.toString(), session.toObject())
      .catch((error) => console.error('AI feedback error:', error));

    res.status(201).json({
      message: 'Session created successfully',
      session: {
        id: session._id,
        ...session.toObject(),
      },
    });
  } catch (error: any) {
    const message = process.env.NODE_ENV === 'production' 
      ? 'An error occurred while creating the session'
      : error.message;
    res.status(500).json({ error: message });
  }
};

export const getSessions = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, limit = 50, skip = 0 } = req.query;

    const query: any = { userId: req.userId };

    // Validate and normalize limit and skip parameters
    const parsedLimit = Number(limit);
    const parsedSkip = Number(skip);
    
    if (!Number.isFinite(parsedLimit) || !Number.isInteger(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
      return res.status(400).json({
        error: 'limit must be a positive integer not greater than 100'
      });
    }
    
    if (!Number.isFinite(parsedSkip) || !Number.isInteger(parsedSkip) || parsedSkip < 0) {
      return res.status(400).json({
        error: 'skip must be a non-negative integer'
      });
    }

    if (startDate || endDate) {
      let start = startDate ? new Date(startDate as string) : undefined;
      let end = endDate ? new Date(endDate as string) : undefined;

      // Swap dates if in wrong order
      if (start && end && start > end) {
        [start, end] = [end, start];
      }

      query.startTime = {};
      if (start) query.startTime.$gte = start;
      if (end) query.startTime.$lte = end;
    }

    const sessions = await Session.find(query)
      .sort({ startTime: -1 })
      .limit(parsedLimit)
      .skip(parsedSkip);

    const total = await Session.countDocuments(query);

    res.status(200).json({
      sessions,
      pagination: {
        total,
        limit: parsedLimit,
        skip: parsedSkip,
      },
    });
  } catch (error: any) {
    const message = process.env.NODE_ENV === 'production' 
      ? 'An error occurred while retrieving sessions'
      : error.message;
    res.status(500).json({ error: message });
  }
};

export const getSessionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const session = await Session.findOne({ _id: id, userId: req.userId });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.status(200).json({ session });
  } catch (error: any) {
    const message = process.env.NODE_ENV === 'production' 
      ? 'An error occurred while retrieving the session'
      : error.message;
    res.status(500).json({ error: message });
  }
};

export const deleteSession = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const session = await Session.findOneAndDelete({ 
      _id: id, 
      userId: req.userId 
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error: any) {
    const message = process.env.NODE_ENV === 'production' 
      ? 'An error occurred while deleting the session'
      : error.message;
    res.status(500).json({ error: message });
  }
};
