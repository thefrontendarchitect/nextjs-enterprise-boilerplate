import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    // Initial value
    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 500 });
    
    // Should still be initial value immediately after change
    expect(result.current).toBe('initial');

    // Fast-forward time by 250ms (half the delay)
    act(() => {
      vi.advanceTimersByTime(250);
    });
    
    // Should still be initial value
    expect(result.current).toBe('initial');

    // Fast-forward time by another 250ms (total 500ms)
    act(() => {
      vi.advanceTimersByTime(250);
    });
    
    // Now should be updated value
    expect(result.current).toBe('updated');
  });

  it('should cancel previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    // Make multiple rapid changes
    rerender({ value: 'first', delay: 500 });
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    rerender({ value: 'second', delay: 500 });
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    rerender({ value: 'third', delay: 500 });
    
    // Advance time to just before the last debounce would fire
    act(() => {
      vi.advanceTimersByTime(499);
    });
    
    // Should still be initial value
    expect(result.current).toBe('initial');
    
    // Advance time to trigger the last debounce
    act(() => {
      vi.advanceTimersByTime(1);
    });
    
    // Should now be the last value
    expect(result.current).toBe('third');
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 },
      }
    );

    // Change value with original delay
    rerender({ value: 'updated', delay: 1000 });
    
    // Change delay while debounce is pending
    rerender({ value: 'updated', delay: 500 });
    
    // Fast-forward by new delay
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    // Should be updated with new delay
    expect(result.current).toBe('updated');
  });

  it('should handle cleanup on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    
    const { unmount, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    // Change value to create a pending timeout
    rerender({ value: 'updated', delay: 500 });
    
    // Unmount before timeout fires
    unmount();
    
    // Verify clearTimeout was called
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    clearTimeoutSpy.mockRestore();
  });

  it('should handle different data types', () => {
    // Test with number
    const { result: numberResult } = renderHook(() => useDebounce(42, 100));
    expect(numberResult.current).toBe(42);
    
    // Test with object
    const testObject = { foo: 'bar' };
    const { result: objectResult } = renderHook(() => useDebounce(testObject, 100));
    expect(objectResult.current).toBe(testObject);
    
    // Test with array
    const testArray = [1, 2, 3];
    const { result: arrayResult } = renderHook(() => useDebounce(testArray, 100));
    expect(arrayResult.current).toBe(testArray);
  });

  it('should work with zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 0 },
      }
    );

    rerender({ value: 'updated', delay: 0 });
    
    // With zero delay, should update immediately (next tick)
    act(() => {
      vi.runAllTimers();
    });
    
    expect(result.current).toBe('updated');
  });
});