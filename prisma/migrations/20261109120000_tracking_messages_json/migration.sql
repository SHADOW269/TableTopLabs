-- AlterTable
-- `messages` is written as a JSON array by syncTrackingCache and read with
-- asArray() on the tracking page, so it must be JSON, not TEXT.
ALTER TABLE "Tracking"
  ALTER COLUMN "messages" TYPE JSONB
  USING CASE
    WHEN "messages" IS NULL THEN NULL
    WHEN "messages" ~ '^\s*[\[{]' THEN "messages"::jsonb
    ELSE NULL
  END;
