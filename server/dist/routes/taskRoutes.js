"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const plannerController_1 = require("../controllers/plannerController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateJwt);
// Tasks & Cut-List Triage
router.get('/', (req, res, next) => plannerController_1.plannerController.getTasks(req, res, next));
router.post('/', (req, res, next) => plannerController_1.plannerController.createTask(req, res, next));
router.patch('/cut-list', (req, res, next) => plannerController_1.plannerController.runCutListTriage(req, res, next));
router.patch('/:id', (req, res, next) => plannerController_1.plannerController.updateTask(req, res, next));
router.delete('/:id', (req, res, next) => plannerController_1.plannerController.deleteTask(req, res, next));
exports.default = router;
