import { create } from 'zustand';
import api from '../lib/api';

export type PersonaType = 'ADVISOR' | 'LIBRARIAN' | 'TUTOR' | 'EDITOR' | 'ROOMMATE';

export interface DocumentChunk {
  id: string;
  content: string;
  subjectTag?: string | null;
  moduleIndex?: number | null;
  hasEmbedding?: boolean;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: 'SYLLABUS' | 'HANDBOOK' | 'RESUME' | 'PAPER' | string;
  status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  fileSize?: number;
  parsedText?: string | null;
  chunkCount?: number;
  chunks?: DocumentChunk[];
  createdAt: string;
}

interface WorkspaceState {
  documents: DocumentItem[];
  activeDocument: DocumentItem | null;
  activePersona: PersonaType;
  isUploading: boolean;
  uploadProgress: number;
  isLoadingDocs: boolean;
  leftPanelCollapsed: boolean;
  rightPanelCollapsed: boolean;

  fetchDocuments: () => Promise<void>;
  fetchDocumentDetails: (id: string) => Promise<void>;
  uploadDocument: (file: File, fileType?: string) => Promise<boolean>;
  deleteDocument: (id: string) => Promise<boolean>;
  setActiveDocument: (doc: DocumentItem | null) => void;
  setPersona: (persona: PersonaType) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  documents: [],
  activeDocument: null,
  activePersona: 'ADVISOR',
  isUploading: false,
  uploadProgress: 0,
  isLoadingDocs: false,
  leftPanelCollapsed: false,
  rightPanelCollapsed: false,

  fetchDocuments: async () => {
    set({ isLoadingDocs: true });
    try {
      const res = await api.get('/documents');
      if (res.data.success) {
        const docs = res.data.documents;
        set({ documents: docs, isLoadingDocs: false });
        // Set first doc as active if none selected
        if (!get().activeDocument && docs.length > 0) {
          get().fetchDocumentDetails(docs[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      set({ isLoadingDocs: false });
    }
  },

  fetchDocumentDetails: async (id: string) => {
    try {
      const res = await api.get(`/documents/${id}`);
      if (res.data.success) {
        set({ activeDocument: res.data.document });
      }
    } catch (error) {
      console.error(`Failed to fetch details for doc ${id}:`, error);
    }
  },

  uploadDocument: async (file: File, fileType?: string) => {
    set({ isUploading: true, uploadProgress: 10 });
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (fileType) formData.append('fileType', fileType);

      set({ uploadProgress: 40 });
      const res = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      set({ uploadProgress: 90 });

      if (res.data.success) {
        // Refresh list
        await get().fetchDocuments();
        if (res.data.document) {
          await get().fetchDocumentDetails(res.data.document.id);
        }
        set({ isUploading: false, uploadProgress: 100 });
        return true;
      }
      set({ isUploading: false, uploadProgress: 0 });
      return false;
    } catch (error) {
      console.error('Upload failed:', error);
      set({ isUploading: false, uploadProgress: 0 });
      return false;
    }
  },

  deleteDocument: async (id: string) => {
    try {
      const res = await api.delete(`/documents/${id}`);
      if (res.data.success) {
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
          activeDocument: state.activeDocument?.id === id ? null : state.activeDocument,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Delete failed:', error);
      return false;
    }
  },

  setActiveDocument: (doc) => {
    set({ activeDocument: doc });
    if (doc) {
      get().fetchDocumentDetails(doc.id);
    }
  },

  setPersona: (persona) => set({ activePersona: persona }),
  toggleLeftPanel: () => set((state) => ({ leftPanelCollapsed: !state.leftPanelCollapsed })),
  toggleRightPanel: () => set((state) => ({ rightPanelCollapsed: !state.rightPanelCollapsed })),
}));
