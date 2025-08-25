# React Optimization Patterns

## Overview

This document outlines the React optimization patterns and best practices implemented in this codebase to ensure optimal performance at scale.

## Core Optimization Techniques

### 1. React.memo

React.memo is a higher-order component that memoizes the result of a component, preventing unnecessary re-renders when props haven't changed.

#### Basic Usage

```tsx
import { memo } from 'react';

// Simple memoization
export const MemoizedComponent = memo(MyComponent);

// With custom comparison
export const MemoizedComponent = memo(MyComponent, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render)
  // Return false if props are different (re-render)
  return prevProps.id === nextProps.id;
});
```

#### When to Use React.memo

✅ **Good candidates for memoization:**

- Components that receive complex objects or arrays as props
- Components that render frequently with the same props
- Child components in lists
- Components with expensive rendering logic

❌ **Avoid memoization when:**

- Component already renders infrequently
- Props change on every render
- Component is very simple (memoization overhead not worth it)

### 2. useMemo Hook

useMemo memoizes expensive computations and returns the cached result when dependencies haven't changed.

#### Usage Examples

```tsx
import { useMemo } from 'react';

function ExpensiveComponent({ data, filters }) {
  // Memoize expensive computation
  const processedData = useMemo(() => {
    return data
      .filter((item) => matchesFilters(item, filters))
      .sort((a, b) => a.date - b.date)
      .map((item) => transformItem(item));
  }, [data, filters]);

  // Memoize object creation to maintain referential equality
  const chartConfig = useMemo(
    () => ({
      type: 'line',
      data: processedData,
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } },
      },
    }),
    [processedData]
  );

  return <Chart config={chartConfig} />;
}
```

### 3. useCallback Hook

useCallback memoizes functions to maintain referential equality across renders.

#### Usage Examples

```tsx
import { useCallback } from 'react';

function SearchComponent({ onSearch }) {
  // Memoize event handlers
  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      onSearch(formData.get('query'));
    },
    [onSearch]
  );

  // Memoize functions passed to child components
  const handleItemClick = useCallback((itemId) => {
    console.log('Item clicked:', itemId);
    // Perform action with itemId
  }, []); // Empty deps if function doesn't use external values

  return <form onSubmit={handleSubmit}>{/* Form content */}</form>;
}
```

## Custom Optimization Hooks

### useDeepMemo

Memoizes values based on deep equality comparison rather than referential equality.

```tsx
import { useDeepMemo } from '@/shared/hooks/use-optimization';

function MyComponent({ complexData }) {
  // Only recomputes when complexData deeply changes
  const processedData = useDeepMemo(() => expensiveProcessing(complexData), [complexData]);
}
```

### useDebouncedCallback

Delays execution of callbacks to prevent excessive calls.

```tsx
import { useDebouncedCallback } from '@/shared/hooks/use-optimization';

function SearchInput() {
  const debouncedSearch = useDebouncedCallback(
    (query: string) => {
      // API call here
      searchAPI(query);
    },
    500, // 500ms delay
    []
  );

  return <input onChange={(e) => debouncedSearch(e.target.value)} />;
}
```

### useThrottledCallback

Limits execution frequency of callbacks.

```tsx
import { useThrottledCallback } from '@/shared/hooks/use-optimization';

function ScrollHandler() {
  const throttledScroll = useThrottledCallback(
    () => {
      console.log('Scroll position:', window.scrollY);
    },
    100 // Max once per 100ms
  );

  useEffect(() => {
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [throttledScroll]);
}
```

### useStableCallback

Creates callbacks with stable references that don't cause re-renders.

```tsx
import { useStableCallback } from '@/shared/hooks/use-optimization';

function MyComponent({ value }) {
  // Callback always has same reference but can access current value
  const stableHandler = useStableCallback((data) => {
    console.log('Current value:', value);
    console.log('Received data:', data);
  });

  return <ChildComponent onAction={stableHandler} />;
}
```

## Optimized Components

### Pre-optimized UI Components

```tsx
import {
  OptimizedButton,
  OptimizedInput,
  OptimizedCard,
  OptimizedListItem,
} from '@/shared/components/optimized';

// These components are pre-wrapped with React.memo
// and include optimized prop comparison
```

### VirtualizedList

For rendering large datasets efficiently:

```tsx
import { VirtualizedList } from '@/shared/components/optimized';

function LargeList({ items }) {
  return (
    <VirtualizedList
      items={items}
      itemHeight={80}
      overscan={3}
      renderItem={(item, index) => (
        <OptimizedListItem
          key={item.id}
          id={item.id}
          title={item.title}
          description={item.description}
        />
      )}
    />
  );
}
```

### LazyComponent

Defers rendering until component is in viewport:

```tsx
import { LazyComponent } from '@/shared/components/optimized';

function Page() {
  return (
    <div>
      <HeroSection />
      <LazyComponent fallback={<Skeleton />}>
        <ExpensiveChart />
      </LazyComponent>
    </div>
  );
}
```

## Performance Best Practices

### 1. Avoid Anonymous Functions in JSX

```tsx
// ❌ Bad - Creates new function on every render
<button onClick={() => handleClick(item.id)}>Click</button>;

// ✅ Good - Use useCallback
const handleItemClick = useCallback(
  (id) => {
    handleClick(id);
  },
  [handleClick]
);

<button onClick={() => handleItemClick(item.id)}>Click</button>;
```

### 2. Optimize Context Usage

```tsx
// ❌ Bad - Single context causes all consumers to re-render
const AppContext = createContext({ user, theme, settings });

// ✅ Good - Split contexts by update frequency
const UserContext = createContext(user);
const ThemeContext = createContext(theme);
const SettingsContext = createContext(settings);
```

### 3. Key Prop in Lists

```tsx
// ❌ Bad - Using index as key
{
  items.map((item, index) => <Item key={index} {...item} />);
}

// ✅ Good - Using stable, unique ID
{
  items.map((item) => <Item key={item.id} {...item} />);
}
```

### 4. Lazy Loading Routes

```tsx
import { lazy, Suspense } from 'react';

// Lazy load route components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

### 5. Optimize Re-renders with Proper State Structure

```tsx
// ❌ Bad - Single state object causes full re-render
const [state, setState] = useState({
  user: null,
  posts: [],
  comments: [],
  isLoading: false,
});

// ✅ Good - Separate states for independent updates
const [user, setUser] = useState(null);
const [posts, setPosts] = useState([]);
const [comments, setComments] = useState([]);
const [isLoading, setIsLoading] = useState(false);
```

## Measuring Performance

### Using React DevTools Profiler

1. Install React DevTools browser extension
2. Open DevTools → Profiler tab
3. Click "Start profiling" and interact with your app
4. Analyze the flame graph to identify slow components

### Custom Performance Monitoring

```tsx
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}

<Profiler id="Navigation" onRender={onRenderCallback}>
  <Navigation />
</Profiler>;
```

### Web Vitals Monitoring

```tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics({ name, delta, value, id }) {
  // Send metrics to your analytics service
  console.log({ name, delta, value, id });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## Common Pitfalls

### 1. Over-memoization

Not everything needs to be memoized. Excessive memoization can actually hurt performance due to:

- Memory overhead of storing memoized values
- Comparison cost exceeding re-computation cost
- Preventing garbage collection

### 2. Incorrect Dependencies

```tsx
// ❌ Bad - Missing dependency
const memoized = useMemo(() => {
  return data.filter((item) => item.userId === userId);
}, [data]); // Missing userId

// ✅ Good - All dependencies included
const memoized = useMemo(() => {
  return data.filter((item) => item.userId === userId);
}, [data, userId]);
```

### 3. Mutating Memoized Values

```tsx
// ❌ Bad - Mutating memoized array
const sorted = useMemo(() => data.sort(), [data]);

// ✅ Good - Creating new array
const sorted = useMemo(() => [...data].sort(), [data]);
```

## Optimization Checklist

Before optimizing, always:

- [ ] **Measure first** - Use profiler to identify actual bottlenecks
- [ ] **Optimize algorithms** - Better algorithms > React optimizations
- [ ] **Check re-render causes** - Use React DevTools to understand why components re-render
- [ ] **Consider trade-offs** - Optimization adds complexity
- [ ] **Test impact** - Verify optimizations actually improve performance
- [ ] **Document decisions** - Explain why optimization was necessary

## Advanced Patterns

### Render Props Optimization

```tsx
const OptimizedRenderProp = memo(({ render }) => {
  // Expensive computation here
  const data = useExpensiveComputation();
  return render(data);
});
```

### HOC with Optimization

```tsx
function withOptimization(Component) {
  const OptimizedComponent = memo(Component);

  return function WithOptimizationComponent(props) {
    const memoizedProps = useMemoizedObject(props);
    return <OptimizedComponent {...memoizedProps} />;
  };
}
```

### State Colocation

Keep state as close to where it's used as possible:

```tsx
// Instead of lifting state to parent unnecessarily,
// keep it in the component that uses it
function SearchableList({ items }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => items.filter((item) => item.includes(search)), [items, search]);

  return (
    <>
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      <List items={filtered} />
    </>
  );
}
```

## Resources

- [React Docs: React.memo](https://react.dev/reference/react/memo)
- [React Docs: useMemo](https://react.dev/reference/react/useMemo)
- [React Docs: useCallback](https://react.dev/reference/react/useCallback)
- [React Profiler API](https://react.dev/reference/react/Profiler)
- [Web Vitals](https://web.dev/vitals/)
