import { useEffect, useRef } from 'react';

/**
 * Hook to trap focus within an element (useful for modals, dialogs, etc.)
 */
export function useFocusTrap(isActive = true) {
  const containerRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];
    
    const getFocusableElements = () => {
      return Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelectors.join(','))
      ).filter(el => el.offsetParent !== null); // Filter out hidden elements
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;
      
      // Trap focus at the end
      if (!e.shiftKey && activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
      
      // Trap focus at the beginning
      if (e.shiftKey && activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    };
    
    // Focus first focusable element on mount
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      const previouslyFocused = document.activeElement as HTMLElement;
      focusableElements[0].focus();
      
      // Restore focus on unmount
      return () => {
        container.removeEventListener('keydown', handleKeyDown);
        previouslyFocused?.focus();
      };
    }
    
    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);
  
  return containerRef;
}