# Changelog

All notable changes to the personio-mcp-server project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
