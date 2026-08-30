'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useWorkspaceStore, PersonaType } from '../store/workspaceStore';
import api from '../lib/api';

export interface Citation {
  id: string;
  documentId: string;
  content: string;
  subjectTag?: string | null;
  moduleIndex?: number | null;
  similarity: number;
}

export interface ChatMessage {
  id: string;
  sender: 'USER' | PersonaType;
  text: string;
  citations?: Citation[];
  timestamp: string;
  isStreaming?: boolean;
}

export function usePersonaChat() {
  const { activePersona, setPersona } = useWorkspaceStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load chat history when persona changes
  const loadThreadHistory = useCallback(async (persona: PersonaType) => {
    try {
      const res = await api.get(`/chat/threads/${persona}`);
      if (res.data.success && Array.isArray(res.data.messages)) {
        const mapped = res.data.messages.map((m: any, idx: number) => ({
          id: `msg_${idx}_${Date.now()}`,
          sender: m.sender,
          text: m.text,
          citations: m.citations,
          timestamp: m.timestamp,
        }));
        setMessages(mapped);
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    loadThreadHistory(activePersona);
  }, [activePersona, loadThreadHistory]);

  const clearHistory = async () => {
    try {
      await api.delete(`/chat/threads/${activePersona}`);
      setMessages([]);
    } catch (err: any) {
      setError('Failed to clear thread history');
    }
  };

  const sendMessage = async (userQuery: string, subjectTag?: string) => {
    if (!userQuery.trim() || isStreaming) return;

    setError(null);
    const userMsgId = `user_${Date.now()}`;
    const assistantMsgId = `assist_${Date.now()}`;

    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'USER',
      text: userQuery,
      timestamp: new Date().toISOString(),
    };

    const assistantPlaceholder: ChatMessage = {
      id: assistantMsgId,
      sender: activePersona,
      text: '',
      citations: [],
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    setIsStreaming(true);

    // Setup abort controller
    abortControllerRef.current = new AbortController();

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('alter_token') : null;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          query: userQuery,
          persona: activePersona,
          subjectTag,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let collectedCitations: Citation[] = [];

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // keep remaining incomplete line

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const eventData = JSON.parse(trimmed.slice(6));
                if (eventData.type === 'token' && eventData.token) {
                  accumulatedText += eventData.token;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMsgId
                        ? { ...msg, text: accumulatedText, citations: collectedCitations }
                        : msg
                    )
                  );
                } else if (eventData.type === 'citation' && eventData.citations) {
                  collectedCitations = eventData.citations;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMsgId
                        ? { ...msg, citations: collectedCitations }
                        : msg
                    )
                  );
                } else if (eventData.type === 'done') {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMsgId
                        ? { ...msg, isStreaming: false, text: accumulatedText, citations: collectedCitations }
                        : msg
                    )
                  );
                } else if (eventData.type === 'error') {
                  setError(eventData.error || 'Stream error');
                }
              } catch {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to stream response');
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  isStreaming: false,
                  text:
                    msg.text ||
                    '⚠️ Unable to connect to AI engine. Please verify your connection or server status.',
                }
              : msg
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const cancelStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  return {
    messages,
    isStreaming,
    error,
    activePersona,
    setPersona,
    sendMessage,
    cancelStreaming,
    clearHistory,
  };
}
