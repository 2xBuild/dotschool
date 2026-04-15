CREATE TABLE "batch_module" (
  "id" text PRIMARY KEY NOT NULL,
  "batchId" text NOT NULL REFERENCES "batch"("id") ON DELETE CASCADE,
  "weekNumber" integer NOT NULL,
  "moduleNumber" integer NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "topics" text,
  "sortOrder" integer NOT NULL DEFAULT 0,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "batch_module_week_uniq" UNIQUE("batchId", "weekNumber", "moduleNumber")
);

CREATE TABLE "module_resource" (
  "id" text PRIMARY KEY NOT NULL,
  "moduleId" text NOT NULL REFERENCES "batch_module"("id") ON DELETE CASCADE,
  "type" text NOT NULL DEFAULT 'text',
  "title" text NOT NULL,
  "url" text,
  "content" text,
  "thumbnailUrl" text,
  "duration" text,
  "sortOrder" integer NOT NULL DEFAULT 0,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "batch_module_batch_idx" ON "batch_module" ("batchId");
CREATE INDEX "module_resource_module_idx" ON "module_resource" ("moduleId");
