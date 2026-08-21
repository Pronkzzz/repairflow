ALTER TABLE "Category" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "BusinessHours" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "hours" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BusinessHours_pkey" PRIMARY KEY ("id")
);
