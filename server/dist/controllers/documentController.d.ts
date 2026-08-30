import { Request, Response, NextFunction } from 'express';
export declare class DocumentController {
    uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDocuments(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDocumentById(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteDocument(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const documentController: DocumentController;
