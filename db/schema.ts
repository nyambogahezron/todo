import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

export const todos = sqliteTable(
  'Todo',
  {
    id: text('id').primaryKey(),
    text: text('text').notNull(),
    done: integer('done', { mode: 'boolean' }).notNull().default(false),
    priority: text('priority').notNull().default('medium'), // "low" | "medium" | "high"
    dueDate: text('dueDate').default(''),
    createdAt: text('createdAt').notNull().default(''),
    updatedAt: text('updatedAt').notNull().default(''),
  },
  (table) => [
    index('Todo_done_idx').on(table.done),
    index('Todo_priority_idx').on(table.priority),
  ]
);

export const notes = sqliteTable(
  'Note',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull().default(''),
    content: text('content').notNull().default(''),
    tags: text('tags').notNull().default('[]'), // Stored as JSON string
    createdAt: text('createdAt').notNull().default(''),
    updatedAt: text('updatedAt').notNull().default(''),
  },
  (table) => [
    index('Note_updatedAt_idx').on(table.updatedAt),
  ]
);

export const shoppingLists = sqliteTable(
  'ShoppingList',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    createdAt: integer('createdAt').notNull(),
    updatedAt: integer('updatedAt').notNull(),
  },
  (table) => [
    index('ShoppingList_updatedAt_idx').on(table.updatedAt),
  ]
);

export const shoppingItems = sqliteTable(
  'ShoppingItem',
  {
    id: text('id').primaryKey(),
    listId: text('listId')
      .notNull()
      .references(() => shoppingLists.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    quantity: real('quantity').notNull().default(1),
    price: real('price').notNull().default(0),
    checked: integer('checked', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('createdAt').notNull(),
    updatedAt: integer('updatedAt').notNull(),
  },
  (table) => [
    index('ShoppingItem_listId_idx').on(table.listId),
  ]
);

export type Todo = typeof todos.$inferSelect;
export type InsertTodo = typeof todos.$inferInsert;

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;

export type ShoppingList = typeof shoppingLists.$inferSelect;
export type InsertShoppingList = typeof shoppingLists.$inferInsert;

export type ShoppingItem = typeof shoppingItems.$inferSelect;
export type InsertShoppingItem = typeof shoppingItems.$inferInsert;
