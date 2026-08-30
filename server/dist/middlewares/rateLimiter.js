"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiStreamLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again after 15 minutes.',
    },
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again later.',
    },
});
exports.aiStreamLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 30, // 30 AI generations / min
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'AI query rate limit exceeded. Please wait a moment before sending more queries.',
    },
});
