import { Router } from 'express';
import { plannerController } from '../controllers/plannerController';
import { calendarExportService } from '../services/calendarExportService';
import { authenticateJwt } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateJwt);

// Planner & Timetable Events
router.get('/events', (req, res, next) => plannerController.getEvents(req, res, next));
router.post('/events', (req, res, next) => plannerController.createEvent(req, res, next));
router.delete('/events/:id', (req, res, next) => plannerController.deleteEvent(req, res, next));
router.post('/timetable-upload', (req, res, next) => plannerController.uploadTimetable(req, res, next));
router.post('/auto-schedule', (req, res, next) => plannerController.autoSchedule(req, res, next));

// iCalendar (.ics) RFC 5545 Export
router.get('/export/ics', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const icsContent = await calendarExportService.generateICalFeed(userId);
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="alter_schedule.ics"');
    res.send(icsContent);
  } catch (error) {
    next(error);
  }
});

export default router;
