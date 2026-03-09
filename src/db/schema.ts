import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  name: text("name"),                    // optional
  email: text("email").notNull(),        // required
  company: text("company"),              // optional
  useCase: text("use_case").notNull(),   // required
  createdAt: timestamp("created_at").defaultNow(),
});
