# Dona - Architecture & Decision Notes

A reference for discussing code decisions in interviews.

---

## Project Overview

**Dona** is a mobile-first web app for restaurant owners to create and share menus. This phase implements a login page with i18n support.

---

## Tech Stack Decisions

### Why Astro + React Islands?

"I chose Astro because it ships zero JavaScript by default, which is great for performance. But since the login form needs interactivity (form state, validation, API calls), I use React as an 'island' - only that component gets hydrated. This gives me the best of both worlds: static performance where possible, React where needed."

### Why not Next.js or plain React?

"Next.js would work, but it ships more JavaScript than necessary for a mostly-static page. For a login page that's primarily a form, Astro's island architecture is more efficient. The user gets a fast initial load, and React only loads for the interactive parts."

### Why plain CSS instead of Tailwind/styled-components?

"I used CSS variables (tokens) for a design system approach without adding dependencies. It keeps the bundle small and the code readable. For a small project, this is simpler than Tailwind's utility classes or the runtime cost of CSS-in-JS."

---

## Architecture Decisions

### Component Structure

```
src/
  components/
    LoginForm.tsx      # Main form with validation logic
    DonaTitle.tsx      # Animated typewriter title
    LanguageSwitcher.tsx  # Locale toggle
    LoginApp.tsx       # Wraps everything with I18nProvider
  i18n/
    messages.ts        # Translation strings + locale detection
    I18nProvider.tsx   # React Context for i18n state
    useI18n.ts         # Custom hook for consuming i18n
  pages/
    login.astro        # Astro page that renders the React island
  styles/
    tokens.css         # Design tokens (colors, spacing, typography)
    login.css          # Page-specific styles
```

### Why this structure?

"I separated concerns clearly: components handle UI logic, i18n handles translations, styles are tokenized. The i18n folder is self-contained - if we needed to swap to a library like react-i18next later, we'd only change that folder."

---

## Key Implementation Decisions

### i18n Without Libraries

**Question:** "Why not use react-i18next or similar?"

**Answer:** "For two languages and ~20 strings, a library adds unnecessary complexity. My implementation is ~80 lines total:
- Type-safe keys (TypeScript catches typos)
- Automatic locale detection (localStorage → browser language → fallback)
- Persists to localStorage and updates `<html lang>`

If we needed pluralization, interpolation, or 10+ languages, I'd switch to a library."

### Form Validation Approach

**Question:** "Why client-side validation in the component?"

**Answer:** "I validate on submit, not on blur, to avoid annoying users while typing. The validation is simple enough to live in the component. For complex forms, I'd extract to a custom hook or use react-hook-form. The key decisions:
- Email: basic `includes('@')` check (server does real validation)
- Password: minimum 6 characters
- Errors clear on new submission attempt
- Accessible: errors linked via `aria-describedby`"

### Typewriter Animation

**Question:** "How does the DonaTitle animation work?"

**Answer:** "It's a state machine with `useEffect`:
1. Start with full text, wait 3 seconds
2. Delete one character at a time (100ms each)
3. When empty, change font, wait 500ms
4. Type one character at a time (150ms each)
5. Repeat

Key details:
- `isPaused` prop stops animation on success (no distracting movement)
- `aria-label='Dona'` ensures screen readers always read the full name
- `min-height` prevents layout shift during animation
- Cursor blinks when idle, stays solid when typing"

### CSS Tokens System

**Question:** "How did you approach styling?"

**Answer:** "I used CSS custom properties as design tokens:
```css
--color-primary: #5c5346;
--space-4: 1rem;
--text-base: 1rem;
--touch-target: 44px;
```

Benefits:
- Consistent spacing/colors across components
- Easy to theme later (just swap token values)
- `--touch-target: 44px` ensures WCAG touch target compliance
- No runtime cost like CSS-in-JS"

---

## Accessibility Decisions

### What I implemented:

1. **Semantic HTML**: `<form>`, `<label>`, `<header>`, `<nav>`
2. **ARIA attributes**:
   - `aria-describedby` links inputs to error messages
   - `role="alert"` on errors for screen reader announcements
   - `aria-label` on icon buttons and decorative elements
   - `aria-hidden="true"` on purely visual elements (cursor, spinner)
3. **Focus states**: Visible outlines on all interactive elements
4. **Touch targets**: Minimum 44px (exceeds WCAG 2.1 requirement)
5. **Color contrast**: Tested to meet WCAG AA

**Question:** "Why `aria-hidden` on the cursor?"

**Answer:** "The blinking cursor is decorative. Screen readers should announce 'Dona', not 'Dona pipe'. The `aria-label` on the `<h1>` provides the accessible name."

---

## State Management

**Question:** "Why React Context instead of Redux/Zustand?"

**Answer:** "For i18n state (just locale + setter), Context is perfect. Redux would be overkill. My rule: use Context for low-frequency updates (theme, locale, auth), consider external state for high-frequency updates (forms, real-time data)."

### LoginForm State

```typescript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [showPassword, setShowPassword] = useState(false);
const [errors, setErrors] = useState<FormErrors>({});
const [status, setStatus] = useState<FormStatus>('idle');
```

"I used multiple `useState` calls instead of a reducer because:
- Each piece of state is independent
- No complex state transitions
- Easy to read and modify

For a form with 10+ fields or complex validation, I'd use `useReducer` or react-hook-form."

---

## Testing Strategy

### What I test:

1. **i18n** (`messages.test.ts`):
   - All keys exist in both languages
   - Locale detection priority (storage → browser → fallback)
   - Persistence to localStorage

2. **DonaTitle** (`DonaTitle.test.tsx`):
   - Renders with correct text and accessibility
   - Animation can be paused
   - Cursor blinks correctly

3. **LoginForm** (`LoginForm.test.tsx`):
   - Form renders all elements
   - Validation shows correct errors
   - Submit calls API with correct data
   - Loading/success/error states work
   - Works in both languages

### Why these tests?

"I focused on user behavior, not implementation details. I don't test 'state updates correctly' - I test 'user sees error message when email is invalid'. This makes tests resilient to refactoring."

### What I'd add with more time:

- E2E tests with Playwright (full login flow)
- Visual regression tests for the UI
- API contract tests

---

## Performance Considerations

1. **Astro islands**: Only LoginForm ships JavaScript
2. **Font loading**: Google Fonts with `preconnect` and `font-display: swap`
3. **No heavy dependencies**: React is the only large dependency
4. **CSS tokens**: No runtime style calculation

---

## What I'd Improve

If asked "what would you change?":

1. **Error handling**: Add timeout on fetch, distinguish network vs API errors
2. **Form library**: For more complex forms, use react-hook-form
3. **Email validation**: Use a proper regex or validator library
4. **Loading skeleton**: Show placeholder during i18n initialization instead of null

---

## Questions I'm Ready For

**"Why TypeScript?"**
→ Type safety catches bugs at compile time. The i18n `t()` function only accepts valid message keys - typos are impossible.

**"How would you scale this?"**
→ Add more pages as Astro routes, share components via a `/components` folder, extract common hooks. For state that spans pages, add a lightweight store like Zustand.

**"How do you handle API errors?"**
→ Currently shows a generic message. In production, I'd parse error codes from the API and show specific messages, plus add retry logic for transient failures.

**"Why not SSR the locale?"**
→ Locale is in localStorage (client-only). SSR would require cookies. For a login page, client detection on hydration is fast enough. The `isInitialized` check prevents flash of wrong locale.
