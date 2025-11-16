# Copilot Instructions for 2do

## Project Overview
2do is a React Native productivity app built with Expo that manages todos, notes, and shopping lists. Uses Expo Router for file-based navigation, Drizzle ORM with Expo SQLite for local-first data persistence, and React Native Reanimated for animations.

## Architecture

### Database Layer (Drizzle ORM)
- **Single source of truth**: All database operations go through `lib/db.ts` singleton
- Database initialized in `app/_layout.tsx` before app renders - ALWAYS check `initializeDatabase()` has been called
- Schema defined in `db/schema.ts` using Drizzle's declarative syntax
- Migrations auto-run on startup via `runMigrations()` from `drizzle/migrations.js`
- Tables: `Todo`, `Note`, `ShoppingList`, `ShoppingItem` (with foreign key cascade delete)

### Store Pattern
- **React hooks for components**: Each store file (`store/todo.ts`, `store/notes.ts`, `store/shopping.ts`) exports custom hooks like `useTodos()`, `useNote(id)`, `useDeleteTodo()`
- **Direct async functions for operations**: `addTodo()`, `updateNote()`, `deleteShoppingList()` - all return Promises
- Type safety: Use exported types `Todo`, `Note`, `ShoppingList`, `ShoppingItem` from `db/schema.ts`
- IDs generated via `randomUUID()` from `expo-crypto` (NOT `Math.random()`)

### Navigation (Expo Router)
- **File-based routing**: `app/` directory structure maps to routes
- Drawer navigation wrapper in `app/_layout.tsx` with custom drawer in `app/navigation/Drawer.tsx`
- Screen registry in `app/navigation/screens.ts` exports all screen components
- Dynamic routes: `app/notes/[id].tsx` for detail views
- Navigation: Use `router.push()` from `expo-router`, NOT React Navigation's `navigation.navigate()`
- Pass data via query params: `router.push(\`/todo/?id=${todoId}\`)`

### Theming
- Custom theme system via `context/ThemeContext.tsx` with light/dark modes
- Theme colors defined in `constants/Colors.ts` extending React Native Paper's `DefaultTheme`
- AsyncStorage persists user preference
- Access theme: `const { theme, toggleTheme, themeClrs } = useTheme()`
- Priority colors: `priorityColors` object in `lib/utils.ts` maps low/medium/high to specific colors

### UI Components

#### SwipeableRow Pattern
- Complex swipe-to-delete component in `components/ui/SwipeableRow/`
- Uses React Native Reanimated gestures and animations
- Wraps list items (TodoItem, NoteItem) for consistent swipe behavior
- Snap points at `[-width, -100, 0]` for full delete vs cancel

#### Form Components
- Form components (`TodoForm.tsx`, `NoteForm.tsx`) handle create/edit modes
- Pass `initialData` prop for edit mode, omit for create
- Use controlled inputs with local state, submit via store functions

## Key Conventions

### Date Handling
- Todos: ISO string dates (`new Date().toISOString()`)
- Shopping: Unix timestamps (`Date.now()`)
- Display formatting via `date-fns` library (`format`, exported as `formatDate` in `lib/utils.ts`)

### Animation Patterns
- Use `react-native-reanimated` for performance (NOT Animated API)
- FAB animations: Scale + opacity transitions with `withTiming()` and `Easing.elastic()`
- Swipe gestures: `useSharedValue`, `useAnimatedStyle`, `runOnJS` for callbacks

### Component Structure
- Screens in `app/` export default named functions (e.g., `export default function TodosScreen()`)
- UI components in `components/` organized by feature (`todos/`, `notes/`, `shopping/`, `ui/`)
- Use React Native Paper's `PaperProvider` and components (`Card`, `IconButton`) for UI consistency

## Development Workflow

### Running the App
```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run in browser
```

### Database Migrations
- Schema changes in `db/schema.ts` require running Drizzle Kit:
  ```bash
  npx drizzle-kit generate:sqlite  # Generate migration
  # Migrations auto-apply on next app start
  ```
- Migration files in `drizzle/` directory (DO NOT manually edit)

### Testing Database Queries
- Use Expo SQLite's `openDatabaseSync()` to access raw DB if needed
- Always use `getDb()` helper to ensure singleton instance
- Check schema in `db/schema.ts` for column names and types

## Common Patterns

### Adding a New Feature
1. Define schema in `db/schema.ts` (add table, indexes, types)
2. Generate migration: `npx drizzle-kit generate:sqlite`
3. Create store file in `store/` with CRUD functions + React hooks
4. Create components in `components/[feature]/`
5. Add screen in `app/[feature]/` (index.tsx for list, create.tsx, [id].tsx for detail)
6. Register in `app/navigation/screens.ts` and add to Drawer

### Querying with Filters
```typescript
// Use Drizzle operators from 'drizzle-orm'
import { eq, and, lt, desc } from 'drizzle-orm';

const overdue = await db.select()
  .from(todos)
  .where(and(eq(todos.done, false), lt(todos.dueDate, now)))
  .orderBy(desc(todos.createdAt));
```

### Custom Hooks Pattern
```typescript
export const useTodos = (): string[] => {
  const [todos, setTodos] = useState<string[]>([]);
  
  useEffect(() => {
    const loadTodos = async () => {
      const all = await getAllTodos();
      setTodos(all.map(t => t.id));
    };
    loadTodos();
  }, []);
  
  return todos;
};
```

## Critical Notes
- **NEVER** use TinyBase or Prisma - this codebase uses Drizzle ORM exclusively (legacy files exist but are unused)
- **Database initialization is async** - check `dbInitialized` state in `app/_layout.tsx`
- **Tags in Notes**: Stored as JSON string, parse with `JSON.parse(note.tags)` before use
- **React Native Paper theme**: Use `themeClrs.colors.[property]` not `theme.colors.[property]` from context
- **Babel config**: Must include `react-native-reanimated/plugin` as last plugin for animations to work
