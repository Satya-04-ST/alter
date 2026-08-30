"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const plannerController_1 = require("../controllers/plannerController");
const calendarExportService_1 = require("../services/calendarExportService");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateJwt);
// Planner & Timetable Events
router.get('/events', (req, res, next) => plannerController_1.plannerController.getEvents(req, res, next));
router.post('/events', (req, res, next) => plannerController_1.plannerController.createEvent(req, res, next));
router.delete('/events/:id', (req, res, next) => plannerController_1.plannerController.deleteEvent(req, res, next));
router.post('/timetable-upload', (req, res, next) => plannerController_1.plannerController.uploadTimetable(req, res, next));
router.post('/auto-schedule', (req, res, next) => plannerController_1.plannerController.autoSchedule(req, res, next));
// iCalendar (.ics) RFC 5545 Export
router.get('/export/ics', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const icsContent = await calendarExportService_1.calendarExportService.generateICalFeed(userId);
        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="alter_schedule.ics"');
        res.send(icsContent);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
