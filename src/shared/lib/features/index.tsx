/**
 * Feature flags system for gradual rollouts and A/B testing
 */

import { useEffect, useState, type ReactNode } from 'react';

/**
 * Feature flag definitions
 */
export const FEATURE_FLAGS = {
  // UI Features
  NEW_DASHBOARD: 'new_dashboard',
  DARK_MODE: 'dark_mode',
  BETA_FEATURES: 'beta_features',
  
  // Functionality
  ADVANCED_SEARCH: 'advanced_search',
  EXPORT_FUNCTIONALITY: 'export_functionality',
  REAL_TIME_UPDATES: 'real_time_updates',
  
  // Performance
  LAZY_LOADING: 'lazy_loading',
  INFINITE_SCROLL: 'infinite_scroll',
  
  // Security
  TWO_FACTOR_AUTH: 'two_factor_auth',
  BIOMETRIC_LOGIN: 'biometric_login',
  
  // Experimental
  AI_FEATURES: 'ai_features',
  VOICE_COMMANDS: 'voice_commands',
} as const;

export type FeatureFlag = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];

/**
 * Feature flag configuration
 * In production, this would come from a feature flag service
 */
const featureConfig: Record<FeatureFlag, boolean | (() => boolean)> = {
  [FEATURE_FLAGS.NEW_DASHBOARD]: process.env.NEXT_PUBLIC_FEATURE_NEW_DASHBOARD === 'true',
  [FEATURE_FLAGS.DARK_MODE]: true, // Always enabled
  [FEATURE_FLAGS.BETA_FEATURES]: process.env.NEXT_PUBLIC_FEATURE_BETA === 'true',
  [FEATURE_FLAGS.ADVANCED_SEARCH]: false,
  [FEATURE_FLAGS.EXPORT_FUNCTIONALITY]: true,
  [FEATURE_FLAGS.REAL_TIME_UPDATES]: false,
  [FEATURE_FLAGS.LAZY_LOADING]: true,
  [FEATURE_FLAGS.INFINITE_SCROLL]: false,
  [FEATURE_FLAGS.TWO_FACTOR_AUTH]: false,
  [FEATURE_FLAGS.BIOMETRIC_LOGIN]: false,
  [FEATURE_FLAGS.AI_FEATURES]: false,
  [FEATURE_FLAGS.VOICE_COMMANDS]: false,
};

/**
 * User-specific feature overrides
 * This could be stored in localStorage or come from user preferences
 */
let userOverrides: Partial<Record<FeatureFlag, boolean>> = {};

if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('feature_overrides');
    if (stored) {
      userOverrides = JSON.parse(stored);
    }
  } catch {
    // Ignore parsing errors
  }
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  // Check user overrides first
  if (flag in userOverrides) {
    return userOverrides[flag]!;
  }
  
  // Check configuration
  const config = featureConfig[flag];
  if (typeof config === 'function') {
    return config();
  }
  
  return config ?? false;
}

/**
 * React hook for feature flags
 */
export function useFeature(flag: FeatureFlag): boolean {
  const [enabled, setEnabled] = useState(() => isFeatureEnabled(flag));
  
  useEffect(() => {
    // Re-evaluate on mount in case of SSR/hydration mismatch
    setEnabled(isFeatureEnabled(flag));
    
    // Listen for feature flag changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'feature_overrides') {
        try {
          const newOverrides = e.newValue ? JSON.parse(e.newValue) : {};
          userOverrides = newOverrides;
          setEnabled(isFeatureEnabled(flag));
        } catch {
          // Ignore parsing errors
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [flag]);
  
  return enabled;
}

/**
 * Set user override for a feature flag (for testing/development)
 */
export function setFeatureOverride(flag: FeatureFlag, enabled: boolean): void {
  userOverrides[flag] = enabled;
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('feature_overrides', JSON.stringify(userOverrides));
    
    // Dispatch storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'feature_overrides',
      newValue: JSON.stringify(userOverrides),
    }));
  }
}

/**
 * Clear all feature overrides
 */
export function clearFeatureOverrides(): void {
  userOverrides = {};
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem('feature_overrides');
    
    // Dispatch storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'feature_overrides',
      newValue: null,
    }));
  }
}

/**
 * Get all feature flags and their current states
 */
export function getAllFeatures(): Record<FeatureFlag, boolean> {
  const features: Record<string, boolean> = {};
  
  for (const flag of Object.values(FEATURE_FLAGS)) {
    features[flag] = isFeatureEnabled(flag);
  }
  
  return features as Record<FeatureFlag, boolean>;
}

/**
 * Feature flag wrapper component
 */
interface FeatureProps {
  flag: FeatureFlag;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Feature({ flag, children, fallback = null }: FeatureProps) {
  const enabled = useFeature(flag);
  return <>{enabled ? children : fallback}</>;
}

/**
 * Feature flag guard for components
 */
export function withFeature<P extends object>(
  flag: FeatureFlag,
  Component: React.ComponentType<P>,
  Fallback?: React.ComponentType<P>
) {
  return function FeatureGuardedComponent(props: P) {
    const enabled = useFeature(flag);
    
    if (enabled) {
      return <Component {...props} />;
    }
    
    if (Fallback) {
      return <Fallback {...props} />;
    }
    
    return null;
  };
}