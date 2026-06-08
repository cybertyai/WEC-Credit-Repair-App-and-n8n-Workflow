-- WEC Credit Repair App — Bureau Responses + Multi-Round Tracking
-- Migration: 005_bureau_responses
-- Applied: 2026-06-08

-- Extend dispute_letters with response tracking fields
ALTER TABLE dispute_letters
  ADD COLUMN IF NOT EXISTS response_outcome      TEXT CHECK (response_outcome IN ('deleted','updated','verified','no_response')),
  ADD COLUMN IF NOT EXISTS bureau_response_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS parent_letter_id      INTEGER REFERENCES dispute_letters(letter_id),
  ADD COLUMN IF NOT EXISTS re_dispute_triggered  BOOLEAN NOT NULL DEFAULT false;

-- Separate table for raw bureau response text (keeps dispute_letters lean)
CREATE TABLE IF NOT EXISTS bureau_responses (
  response_id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  letter_id       INTEGER NOT NULL REFERENCES dispute_letters(letter_id),
  case_id         TEXT    NOT NULL REFERENCES cases(case_id),
  bureau          TEXT    NOT NULL,
  response_text   TEXT,
  outcome         TEXT    NOT NULL CHECK (outcome IN ('deleted','updated','verified','no_response')),
  received_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for looking up responses by letter
CREATE INDEX IF NOT EXISTS idx_bureau_responses_letter_id ON bureau_responses(letter_id);
CREATE INDEX IF NOT EXISTS idx_bureau_responses_case_id   ON bureau_responses(case_id);

-- RLS
ALTER TABLE bureau_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients view own responses"
  ON bureau_responses FOR SELECT
  USING (
    case_id IN (
      SELECT case_id FROM cases WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Service role full access to bureau_responses"
  ON bureau_responses FOR ALL
  USING (auth.role() = 'service_role');
