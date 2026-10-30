# Changelog

All notable changes to the personio-mcp-server project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> Note: releases 1.0.0 through 1.1.0 were published without changelog entries.
> See the git history for the changes they contained.

## [1.1.1] - 2026-07-26

### Added
- **Data Protection & Compliance section in the README**, stating that the
  deploying party is the data controller and listing the GDPR obligations that
  apply (legal basis, record of processing activities, processor agreements
  covering both Personio and the LLM provider, international transfers, data
  minimisation, access control, applicant-data retention, DPO and works council
  involvement).
- Section on the processing of personal data in `SECURITY.md`, including the MCP
  client as a data recipient and the absence of a per-user authorisation layer.
- README documentation for the 22 tools that were implemented but undocumented:
  document management (6), recruiting (10), approvals (5) and
  `get_team_availability`.
- Explicit warnings marking write and destructive operations, and flagging the
  V2 Recruiting API as Beta.
- Least-privilege and test-in-isolation guidance in `SECURITY.md`.

### Changed
- Installation heading is no longer addressed to a specific organisation.
- Feature list now reflects document management, recruiting and approval
  capabilities.
- Server now reports its actual package version instead of a hardcoded `0.1.0`.

### Fixed
- `.gitignore` was missing a trailing newline, which merged `.env*` with the
  following entry. `.npmrc` is now ignored so registry configuration and any
  auth token cannot be committed accidentally.
- Package description claimed 52 tools; the actual count is 40.
- `CLAUDE.md`, an internal development and rollout document, was shipped to npm
  consumers via the `files` field. Replaced with `SECURITY.md` and
  `CHANGELOG.md`, which are relevant to consumers and which the README links to.

## [0.1.0] - 2025-05-23

### Added
- Initial release of personio-mcp-server
- Employee management tools (get_employee, list_employees, search_employees)
- Attendance tracking tools (get_attendance_records, get_current_attendance_status, generate_attendance_report)
- Absence management tools (get_absences, get_employee_absence_balance, get_absence_types, get_team_absence_overview, get_absence_statistics)
- Analytics tools (get_team_availability)
- Document management tools (get_document_categories, get_employee_documents, upload_document, download_document, delete_document, get_documents_by_category)
- Approval workflow tools (create_attendance_with_approval, get_pending_approvals, get_attendance_approval_status, get_absence_approval_status, get_approval_workflow_summary)
- Utility tools (api_health_check)
