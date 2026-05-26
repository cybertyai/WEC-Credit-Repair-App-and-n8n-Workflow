-- WEC Credit Repair App — Row Level Security Policies
-- Migration: 002_enable_rls
-- Applied: 2026-05-26
-- Purpose: Restrict client portal access so each user can only read their own data.
--          Admin access is handled by Supabase service-role key (bypasses RLS).

ALTER TABLE cases           ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_reports  ENABLE ROW LEVEL SECURITY;
ALTER TABLE negative_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE events          ENABLE ROW LEVEL SECURITY;

-- Clients can read their own case
CREATE POLICY "clients_read_own_cases"
  ON cases FOR SELECT
  USING (email = auth.jwt() ->> 'email');

-- Clients can read credit reports for their cases
CREATE POLICY "clients_read_own_credit_reports"
  ON credit_reports FOR SELECT
  USING (case_id IN (
    SELECT case_id FROM cases WHERE email = auth.jwt() ->> 'email'
  ));

-- Clients can read negative items for their cases
CREATE POLICY "clients_read_own_negative_items"
  ON negative_items FOR SELECT
  USING (case_id IN (
    SELECT case_id FROM cases WHERE email = auth.jwt() ->> 'email'
  ));

-- Clients can read dispute letters for their cases
CREATE POLICY "clients_read_own_letters"
  ON dispute_letters FOR SELECT
  USING (case_id IN (
    SELECT case_id FROM cases WHERE email = auth.jwt() ->> 'email'
  ));

-- Clients can read their own notifications
CREATE POLICY "clients_read_own_notifications"
  ON notifications FOR SELECT
  USING (case_id IN (
    SELECT case_id FROM cases WHERE email = auth.jwt() ->> 'email'
  ));

-- Clients can read audit events for their cases
CREATE POLICY "clients_read_own_events"
  ON events FOR SELECT
  USING (case_id IN (
    SELECT case_id FROM cases WHERE email = auth.jwt() ->> 'email'
  ));
