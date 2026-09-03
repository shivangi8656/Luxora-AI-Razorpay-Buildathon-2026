import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuditCategory, AuditEntry } from '../types';
import { saveAuditLogToFirestore } from '../lib/firebaseService';

interface AuditContextType {
  logs: AuditEntry[];
  addLog: (
    category: AuditCategory,
    title: string,
    details: string,
    status?: 'info' | 'success' | 'warning' | 'error',
    metadata?: Record<string, any>
  ) => void;
  clearLogs: () => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

const INITIAL_LOGS: AuditEntry[] = [
  {
    id: 'audit-init-1',
    timestamp: Date.now() - 1000 * 60 * 18,
    category: 'CATALOG',
    title: 'SS26 Haute Couture Catalog Initialized',
    details: '9 curated high-jewelry, outerwear, and silk evening pieces loaded with full 100% AI Readiness.',
    status: 'success',
  },
  {
    id: 'audit-init-2',
    timestamp: Date.now() - 1000 * 60 * 12,
    category: 'AI_SEARCH',
    title: 'Gemini Natural Language Index Ready',
    details: 'Semantic search vectors calibrated for quiet-luxury styling inquiries and occasion filtering.',
    status: 'info',
  },
  {
    id: 'audit-init-3',
    timestamp: Date.now() - 1000 * 60 * 5,
    category: 'CAMPAIGN',
    title: 'Growth Opportunity Discovered',
    details: 'AI Agent identified 142 VIP patrons eligible for private SS26 Cashmere Vernissage invitation.',
    status: 'info',
  }
];

const normalizeLog = (entry: any): AuditEntry => ({
  id: entry.id || `audit-${Date.now()}`,
  timestamp: typeof entry.timestamp === 'number' ? entry.timestamp : Date.now(),
  category: entry.category || 'SYSTEM',
  title: typeof entry.title === 'string' ? entry.title : String(entry.title || ''),
  details: typeof entry.details === 'string' ? entry.details : (entry.details ? JSON.stringify(entry.details) : ''),
  status: entry.status || 'info',
  metadata: entry.metadata,
});

export const AuditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<AuditEntry[]>(() => {
    try {
      const saved = localStorage.getItem('luxora_audit_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(normalizeLog);
        }
      }
      return INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('luxora_audit_logs', JSON.stringify(logs.slice(0, 100)));
    } catch (e) {
      console.error('Audit persistence error:', e);
    }
  }, [logs]);

  const addLog = (
    category: AuditCategory,
    title: string,
    details: any,
    status: 'info' | 'success' | 'warning' | 'error' = 'info',
    metadata?: Record<string, any>
  ) => {
    const detailsString = typeof details === 'string' ? details : (details ? JSON.stringify(details) : '');
    const newEntry: AuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      category,
      title: String(title || ''),
      details: detailsString,
      status,
      metadata,
    };
    setLogs((prev) => [newEntry, ...prev]);
    saveAuditLogToFirestore(newEntry);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <AuditContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
};
