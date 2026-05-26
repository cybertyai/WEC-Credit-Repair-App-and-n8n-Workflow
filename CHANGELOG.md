# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-26

### Added
- **8-workflow n8n automation pipeline** for end-to-end credit repair case management
  - WF00: Hourly orchestrator with CROA 3-day cooling-off enforcement
  - WF01: Client intake webhook with CROA/FCRA compliance gate
  - WF02: Credit report ingestion (CRS API, PDF upload, IdentityIQ RPA adapter)
  - WF03: AI-powered negative item analysis via Claude (FCRA dispute classification)
  - WF04: Dispute letter generation with compliance lint (banned phrases, statute citation check)
  - WF05: Letter review, optional Proof.com notarization, and Lob certified mail dispatch
  - WF06: Daily response tracking, outcome evaluation, and multi-round escalation
  - WF07: Client notifications via Gmail OAuth2 and optional Twilio SMS
- **Next.js 15 webapp** (App Router, TypeScript, Tailwind CSS)
  - Client portal: case status, dispute letters, notification timeline
  - Admin dashboard: case management, letter approval and dispatch
  - Supabase Auth with magic-link login and role-based routing
- **Supabase PostgreSQL schema** with Row Level Security
  - 6 tables: cases, credit_reports, negative_items, dispute_letters, notifications, events
  - RLS policies limiting client access to their own data
- **GitHub Actions CI** for type-check and lint on push/PR
