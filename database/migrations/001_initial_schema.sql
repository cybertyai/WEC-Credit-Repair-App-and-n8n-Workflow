-- WEC Credit Repair App — Initial Schema
-- Migration: 001_initial_schema
-- Applied: 2026-05-26

-- Cases: one row per client engagement
CREATE TABLE IF NOT EXISTS cases (
  case_id              TEXT PRIMARY KEY,
  first_name           TEXT NOT NULL,
  last_name            TEXT NOT NULL,
  email                TEXT NOT NULL,
  phone                TEXT,
  date_of_birth        DATE,
  ssn_last4            TEXT CHECK (ssn_last4 ~ '^[0-9]{4}$'),
  street               TEXT,
  city                 TEXT,
  state                TEXT,
  zip                  TEXT,
  plan_tier            TEXT,
  credit_data_source   TEXT CHECK (credit_data_source IN ('crs_api', 'pdf_upload', 'identityiq')),
  case_status          TEXT NOT NULL DEFAULT 'cooling_off'
                         CHECK (case_status IN ('cooling_off','in_progress','letters_pending_review',
                                                'mailed','escalating','resolved','cancelled')),
  current_round        INTEGER DEFAULT 1,
  cancellation_deadline TIMESTAMPTZ,
  consent_given        BOOLEAN NOT NULL DEFAULT false,
  contract_signed      BOOLEAN NOT NULL DEFAULT false,
  upfront_fee_charged  BOOLEAN NOT NULL DEFAULT false,
  sms_opt_in           BOOLEAN NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at           TIMESTAMPTZ,
  cancelled_at         TIMESTAMPTZ,
  closed_at            TIMESTAMPTZ,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE cases IS
  'One row per client engagement. Compliance gate fields: consent_given, contract_signed, cancellation_deadline.';

-- Credit reports pulled for each case
CREATE TABLE IF NOT EXISTS credit_reports (
  report_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  case_id     TEXT NOT NULL REFERENCES cases(case_id),
  source      TEXT,
  pulled_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  item_count  INTEGER DEFAULT 0
);

-- Individual negative items extracted from credit reports
CREATE TABLE IF NOT EXISTS negative_items (
  item_id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  case_id               TEXT NOT NULL REFERENCES cases(case_id),
  report_id             BIGINT REFERENCES credit_reports(report_id),
  item_index            INTEGER,
  bureau                TEXT,
  creditor              TEXT,
  account_number_masked TEXT,
  item_type             TEXT,
  reported_status       TEXT,
  prior_status          TEXT,
  balance               NUMERIC,
  date_opened           DATE,
  date_reported         DATE,
  raw                   JSONB,
  analysis_status       TEXT NOT NULL DEFAULT 'pending'
                          CHECK (analysis_status IN ('pending','disputable','do_not_dispute')),
  dispute_basis         TEXT,
  fcra_sections         JSONB,
  rationale             TEXT,
  confidence            NUMERIC,
  analyzed_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI-generated FCRA dispute letters
CREATE TABLE IF NOT EXISTS dispute_letters (
  letter_id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  case_id               TEXT NOT NULL REFERENCES cases(case_id),
  bureau                TEXT,
  round                 INTEGER NOT NULL DEFAULT 1,
  letter_body           TEXT,
  item_ids              JSONB,
  letter_status         TEXT NOT NULL DEFAULT 'pending_review'
                          CHECK (letter_status IN ('pending_review','needs_rewrite','approved','mailed')),
  requires_notarization BOOLEAN NOT NULL DEFAULT false,
  lint_violations       JSONB,
  carrier               TEXT,
  tracking_number       TEXT,
  mailed_at             TIMESTAMPTZ,
  fcra_response_due     TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Client notification log (email + SMS)
CREATE TABLE IF NOT EXISTS notifications (
  notification_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  case_id         TEXT NOT NULL REFERENCES cases(case_id),
  event_type      TEXT,
  channel         TEXT,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Append-only audit log for CROA/FCRA defensibility
CREATE TABLE IF NOT EXISTS events (
  event_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  case_id    TEXT REFERENCES cases(case_id),
  event_type TEXT NOT NULL,
  detail     JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE events IS
  'Append-only audit log of case state changes for CROA/FCRA defensibility.';
