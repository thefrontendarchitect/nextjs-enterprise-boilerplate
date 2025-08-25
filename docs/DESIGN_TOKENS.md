# Design Tokens Documentation

## Overview

Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes. We use them in place of hard-coded values in order to maintain a scalable and consistent visual system for UI development.

## Token Structure

Our design tokens are organized into the following categories:

### 1. Color Tokens

#### Base Colors

Our color system is built on HSL values for better color manipulation and accessibility.

```typescript
// Light theme example
primary: 'hsl(222.2 47.4% 11.2%)';
primaryForeground: 'hsl(210 40% 98%)';
```

#### Semantic Colors

Purpose-driven colors for specific UI states:

- **Success**: Positive actions and success states
- **Warning**: Caution and warning messages
- **Error**: Error states and destructive actions
- **Info**: Informational messages

### 2. Typography Tokens

#### Font Families

- `sans`: System sans-serif font stack (Geist Sans)
- `mono`: Monospace font for code (Geist Mono)

#### Font Sizes

Follows a t-shirt sizing convention with rem values:

- `xs`: 0.75rem (12px)
- `sm`: 0.875rem (14px)
- `base`: 1rem (16px)
- `lg`: 1.125rem (18px)
- `xl` through `9xl`: Larger display sizes

#### Font Weights

Standard weight scale from 100-900:

- `thin`: 100
- `normal`: 400
- `medium`: 500
- `semibold`: 600
- `bold`: 700

### 3. Spacing Tokens

Based on a 4px grid system:

- `1`: 0.25rem (4px)
- `2`: 0.5rem (8px)
- `4`: 1rem (16px)
- `8`: 2rem (32px)

### 4. Border Radius Tokens

Consistent corner rounding:

- `sm`: 0.125rem (2px)
- `base`: 0.25rem (4px)
- `lg`: 0.5rem (8px) - Default radius
- `full`: 9999px (pill shape)

### 5. Shadow Tokens

Elevation system for depth perception:

- `sm`: Subtle shadow for cards
- `md`: Default shadow for dropdowns
- `lg`: Elevated components like modals
- `xl`: High elevation elements

### 6. Animation Tokens

#### Durations

- `instant`: 0ms
- `fast`: 150ms
- `base`: 300ms
- `slow`: 500ms

#### Easings

- `linear`: No acceleration
- `in`: Accelerate from zero
- `out`: Decelerate to zero
- `inOut`: Accelerate then decelerate
- `bounce`: Playful bounce effect

### 7. Z-Index Tokens

Layering system to prevent z-index conflicts:

- `base`: 0
- `dropdown`: 1000
- `modal`: 1400
- `toast`: 1700
- `tooltip`: 1800

## Usage Examples

### In TypeScript/JavaScript

```typescript
import { colors, spacing, typography } from '@/shared/lib/design-tokens/tokens';

// Access token values
const primaryColor = colors.light.primary;
const largeSpacing = spacing[8]; // 2rem
const headingSize = typography.sizes['2xl']; // 1.5rem
```

### In React Components

```tsx
import { spacing, borderRadius, shadows } from '@/shared/lib/design-tokens/tokens';

const Card = styled.div`
  padding: ${spacing[4]};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.md};
`;
```

### With Tailwind CSS

Our tokens align with Tailwind's default scale:

```tsx
// These are equivalent:
<div className="p-4 rounded-lg shadow-md" />
<div style={{
  padding: spacing[4],
  borderRadius: borderRadius.lg,
  boxShadow: shadows.md
}} />
```

### Helper Functions

```typescript
import { getCSSVariable, setCSSVariable } from '@/shared/lib/design-tokens/tokens';

// Get current theme color
const primaryColor = getCSSVariable('--primary');

// Update CSS variable dynamically
setCSSVariable('--primary', 'hsl(220 50% 50%)');
```

## Theme Switching

Tokens automatically adapt to the current theme:

```typescript
// The application handles theme switching automatically
// Tokens reference CSS variables that update with theme changes
const getThemeAwareColor = (colorKey: ColorToken) => {
  return `var(--${colorKey})`;
};
```

## Responsive Design

Use breakpoint tokens for consistent responsive behavior:

```typescript
import { breakpoints } from '@/shared/lib/design-tokens/tokens';

const mediaQuery = `@media (min-width: ${breakpoints.md})`;
```

## Best Practices

1. **Always use tokens instead of hard-coded values**

   ```typescript
   // Good
   padding: spacing[4];

   // Bad
   padding: '16px';
   ```

2. **Use semantic tokens for colors when possible**

   ```typescript
   // Good
   color: semanticColors.error.light;

   // Bad
   color: 'red';
   ```

3. **Maintain consistency across themes**
   - Ensure both light and dark themes have equivalent tokens
   - Test components in both themes

4. **Document custom tokens**
   - If you add new tokens, update this documentation
   - Include use cases and examples

## Token Naming Convention

We follow a hierarchical naming structure:

```
[category].[variant].[state].[scale]
```

Examples:

- `colors.light.primary`
- `typography.sizes.base`
- `spacing.4`
- `shadows.lg`

## Migration Guide

When migrating existing components to use design tokens:

1. Identify hard-coded values
2. Map to appropriate tokens
3. Import tokens from `@/shared/lib/design-tokens/tokens`
4. Replace hard-coded values with token references
5. Test in both light and dark themes

## Accessibility Considerations

- Color tokens maintain WCAG AA contrast ratios
- Typography scales ensure readable text sizes
- Spacing tokens provide adequate touch targets
- Animation durations respect `prefers-reduced-motion`

## Contributing

To add new design tokens:

1. Add the token to `/src/shared/lib/design-tokens/tokens.ts`
2. Update corresponding CSS variables in `globals.css` if needed
3. Document the token in this file
4. Create examples of usage
5. Test across all themes

## Related Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [CSS Variables MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Design Tokens W3C](https://www.w3.org/community/design-tokens/)
