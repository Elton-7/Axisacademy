import { pgTable, serial, varchar, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core'

export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  subject: varchar('subject', { length: 255 }).notNull(),
  message: text('message').notNull(),
  programme: varchar('programme', { length: 50 }),
  status: varchar('status', { length: 20 }).notNull().default('new'),
  notes: text('notes'),
  assignedTo: integer('assigned_to').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('staff'),
  isActive: boolean('is_active').notNull().default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const programmes = pgTable('programmes', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  category: varchar('category', { length: 50 }).notNull(),
  description: text('description').notNull(),
  duration: varchar('duration', { length: 100 }),
  schedule: varchar('schedule', { length: 100 }),
  maxStudents: integer('max_students'),
  price: integer('price'),
  features: jsonb('features').$type<string[]>(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const enrollments = pgTable('enrollments', {
  id: serial('id').primaryKey(),
  contactId: integer('contact_id').references(() => contacts.id),
  programmeId: integer('programme_id').references(() => programmes.id),
  studentName: varchar('student_name', { length: 200 }).notNull(),
  studentAge: integer('student_age'),
  parentName: varchar('parent_name', { length: 200 }),
  parentPhone: varchar('parent_phone', { length: 20 }),
  parentEmail: varchar('parent_email', { length: 255 }),
  startDate: timestamp('start_date'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const testimonials = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  quote: text('quote').notNull(),
  rating: integer('rating').notNull().default(5),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
