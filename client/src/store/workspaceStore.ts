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

const INITIAL_DEMO_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc_demo_cs402',
    fileName: 'CS402_Distributed_Systems_Syllabus.txt',
    fileUrl: '/uploads/CS402_Distributed_Systems.txt',
    fileType: 'SYLLABUS',
    status: 'PROCESSED',
    fileSize: 4820,
    chunkCount: 3,
    parsedText: `Course Code: CS402 - Distributed Systems & Cloud Computing\nModule 1: Principles of State Machine Replication, Paxos, and Raft Consensus Invariants.\nModule 2: Vector Clocks, Lamport Timestamps, and Causality in Asynchronous Networks.\nModule 3: Byzantine Fault Tolerance (BFT) in Large-Scale Edge Swarms.`,
    chunks: [
      {
        id: 'chunk_1',
        content: 'Course Code: CS402 - Distributed Systems. Module 1: Raft Consensus Protocol and Leader Election invariants under network partitions.',
        subjectTag: 'CS402',
        moduleIndex: 1,
        hasEmbedding: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'chunk_2',
        content: 'Module 2: Logical and Vector Clocks for Partial Ordering in Distributed Telemetry and Multi-Leader Replication.',
        subjectTag: 'CS402',
        moduleIndex: 2,
        hasEmbedding: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'chunk_3',
        content: 'Module 3: Byzantine Fault Tolerance (BFT) bounds: N >= 3F + 1 nodes with quorum Q = 2F + 1 for distributed state safety.',
        subjectTag: 'CS402',
        moduleIndex: 3,
        hasEmbedding: true,
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'doc_demo_rob701',
    fileName: 'ROB701_Autonomous_Swarm_Robotics.txt',
    fileUrl: '/uploads/ROB701_Autonomous_Swarm_Robotics.txt',
    fileType: 'SYLLABUS',
    status: 'PROCESSED',
    fileSize: 3950,
    chunkCount: 2,
    parsedText: `Course Code: ROB701 - Autonomous Multi-Agent Robotics\nModule 1: Decentralized SLAM and Sensor Fusion with Extended Kalman Filters.\nModule 2: Swarm Flocking Dynamics and Collision Avoidance.`,
    chunks: [
      {
        id: 'chunk_4',
        content: 'Course Code: ROB701 - Sensor Fusion and Extended Kalman Filters (EKF) in GPS-denied environments.',
        subjectTag: 'ROB701',
        moduleIndex: 1,
        hasEmbedding: true,
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  },
];

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  documents: INITIAL_DEMO_DOCUMENTS,
  activeDocument: INITIAL_DEMO_DOCUMENTS[0],
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
      if (res.data.success && res.data.documents.length > 0) {
        const docs = res.data.documents;
        set({ documents: docs, isLoadingDocs: false });
        if (!get().activeDocument && docs.length > 0) {
          get().fetchDocumentDetails(docs[0].id);
        }
      } else {
        set({ documents: INITIAL_DEMO_DOCUMENTS, isLoadingDocs: false });
        if (!get().activeDocument) {
          set({ activeDocument: INITIAL_DEMO_DOCUMENTS[0] });
        }
      }
    } catch (error) {
      console.warn('Backend unavailable, using initial demo documents:', error);
      set({ documents: INITIAL_DEMO_DOCUMENTS, activeDocument: INITIAL_DEMO_DOCUMENTS[0], isLoadingDocs: false });
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
