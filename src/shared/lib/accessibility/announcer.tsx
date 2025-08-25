'use client';

import { createContext, useContext, useRef, ReactNode } from 'react';

interface AnnouncerContextValue {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AnnouncerContext = createContext<AnnouncerContextValue | undefined>(undefined);

/**
 * Provider for screen reader announcements
 */
export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);
  
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const element = priority === 'assertive' ? assertiveRef.current : politeRef.current;
    
    if (element) {
      // Clear the element first to ensure the screen reader announces the new message
      element.textContent = '';
      
      // Use setTimeout to ensure the clear happens before the new message
      setTimeout(() => {
        element.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
          element.textContent = '';
        }, 1000);
      }, 100);
    }
  };
  
  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      
      {/* Hidden live regions for screen reader announcements */}
      <div
        ref={politeRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      <div
        ref={assertiveRef}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </AnnouncerContext.Provider>
  );
}

/**
 * Hook to announce messages to screen readers
 */
export function useAnnouncer() {
  const context = useContext(AnnouncerContext);
  
  if (!context) {
    throw new Error('useAnnouncer must be used within AnnouncerProvider');
  }
  
  return context;
}