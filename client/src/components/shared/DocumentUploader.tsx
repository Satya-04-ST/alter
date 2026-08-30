'use client';

import React, { useState, useRef } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export function DocumentUploader() {
  const { uploadDocument, isUploading, uploadProgress } = useWorkspaceStore();
  const [dragActive, setDragActive] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('SYLLABUS');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processUpload(e.target.files[0]);
    }
  };

  const processUpload = async (file: File) => {
    setStatusMessage(`Ingesting ${file.name}...`);
    const ok = await uploadDocument(file, selectedType);
    if (ok) {
      setStatusMessage(`Successfully processed & chunked ${file.name}`);
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage('Ingestion failed. Please check the file and try again.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Document Type Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'SYLLABUS', label: 'Syllabus / Curriculum' },
          { id: 'HANDBOOK', label: 'Academic Handbook' },
          { id: 'RESUME', label: 'Resume / CV' },
          { id: 'PAPER', label: 'Research Paper' },
        ].map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setSelectedType(type.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              selectedType === type.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-void-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
          dragActive
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-void-900/40 hover:bg-void-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.txt,.md"
          className="hidden"
          onChange={handleChange}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 text-cyan-400 flex items-center justify-center shadow-inner">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              {isUploading ? 'Ingesting & Vectorizing Document...' : 'Drop Academic Documents here'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports PDF, Scanned Images (OCR), Markdown, or Text files (Max 25MB)
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-[11px] font-mono text-slate-300 border border-slate-700/60">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Auto-chunking (400 tokens) + pgvector (768-dim)
          </div>
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="mt-4 w-full bg-void-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-2 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className="p-3 rounded-xl bg-void-900 border border-slate-800 text-xs flex items-center gap-2 text-cyan-300">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
