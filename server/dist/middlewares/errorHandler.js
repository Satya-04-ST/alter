"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const errorHandler = (err, req, res, next) => {
    console.error('❌ Server Error:', err);
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: err.errors.map((e) => ({
                path: e.path.join('.'),
                message: e.message,
            })),
        });
        return;
    }
    if (err.name === 'MulterError') {
        res.status(400).json({
            success: false,
            error: `File upload error: ${err.message}`,
        });
        return;
    }
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        error: message,
    });
};
exports.errorHandler = errorHandler;
