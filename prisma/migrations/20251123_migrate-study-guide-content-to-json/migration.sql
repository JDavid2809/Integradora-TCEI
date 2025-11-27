-- Migration: Migrate study_guide.content (text -> json)
-- Add a new jsonb column `content_json`, attempt to parse existing text to jsonb,
-- fallback to wrapping legacy text as a paragraph block inside the new structure.
-- A backup column `content_text_backup` is created to preserve the original values.

BEGIN;

-- Add backup column to preserve original data
ALTER TABLE study_guide ADD COLUMN IF NOT EXISTS content_text_backup text;
UPDATE study_guide SET content_text_backup = content::text;

-- Create the new JSONB column
ALTER TABLE study_guide ADD COLUMN IF NOT EXISTS content_json jsonb;

-- Attempt to migrate each row safely
DO $$
DECLARE
  r record;
  parsed jsonb;
BEGIN
  FOR r IN SELECT id, content FROM study_guide LOOP
    IF r.content IS NULL THEN
      UPDATE study_guide SET content_json = 'null'::jsonb WHERE id = r.id;
      CONTINUE;
    END IF;

    BEGIN
      -- Try interpret content as JSON
      parsed := r.content::jsonb;
      -- If `parsed` is a JSON string which itself contains JSON, try to parse it again
      IF jsonb_typeof(parsed) = 'string' THEN
        -- Get the string value (raw), remove outer quotes and attempt second parse
        DECLARE inner text := (parsed::text);
        inner := substring(inner FROM 2 FOR char_length(inner) - 2); -- remove surrounding quotes
        -- Heuristic: only try if it looks like JSON
        IF substring(inner FROM 1 FOR 1) IN ('{','[') THEN
          BEGIN
            parsed := inner::jsonb;
          EXCEPTION WHEN others THEN
            -- Not parseable; fallback to wrapping
            parsed := jsonb_build_object('blocks', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'text', inner)));
          END;
        ELSE
          -- If it's just a string, wrap
          parsed := jsonb_build_object('blocks', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'text', inner)));
        END IF;
      END IF;
      -- If parse succeeded (parsed is now JSON object/array or wrapped), store it
      UPDATE study_guide SET content_json = parsed WHERE id = r.id;
    EXCEPTION WHEN others THEN
      -- Not valid JSON; wrap as paragraph block
      UPDATE study_guide SET content_json = jsonb_build_object('blocks', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'text', r.content))) WHERE id = r.id;
    END;
  END LOOP;
END $$;

-- Optionally validate that content_json is not null; rows will have at least 'null' in jsonb value
-- Replace old `content` column with the new jsonb column
ALTER TABLE study_guide DROP COLUMN IF EXISTS content;
ALTER TABLE study_guide RENAME COLUMN content_json TO content;

COMMIT;

-- Note: If your DB had the content column in json already, the migration still behaves correctly
-- because we backed up old content into content_text_backup and then applied the conversion.
-- After applying the migration, run your application and tests to ensure everything works.
-- If migration fails or results are unexpected, you can inspect the backup column `content_text_backup`.
