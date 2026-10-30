# personio-mcp-server

A Model Context Protocol (MCP) server for integrating with the Personio HR API. This server provides tools for accessing employee data, attendance records, absence information, HR documents, recruiting data and analytics through Claude or other AI assistants that support the MCP protocol.

## Features

- **Employee Management**: Get employee details, list all employees, search for employees, filter by office/location
- **Data Export**: Export employee lists in JSON or CSV format for easy spreadsheet integration
- **Attendance Tracking**: Retrieve attendance records, check current attendance status; create, update and delete attendance periods (V1 and V2 API)
- **Absence Management**: View absences, check absence balances, get absence types
- **Document Management**: List, download, upload and delete employee documents, browse document categories (V2 API)
- **Recruiting**: List and retrieve jobs, candidates and applications, inspect stage transitions, download application documents such as CVs and cover letters (V2 API, Beta)
- **Approvals**: Inspect pending approvals, attendance and absence approval status, create attendance with an approval workflow
- **Analytics**: Generate attendance reports, check team availability, analyze absence statistics
- **Utilities**: API health check

## ⚠️ Data Protection & Compliance

This server reads and writes **personal data about identifiable individuals** —
both **employees** (names, contact details, employment data, attendance and
absence records, HR documents) and **job applicants** (candidate profiles,
applications, CVs and cover letters). It exposes that data to an MCP client,
which is typically a Large Language Model operated by a third party.

**Whoever deploys this software is the data controller and bears sole
responsibility for the lawfulness of that processing.** The authors are not a
processor for your deployment and have no visibility into it. Before using this
server on a production Personio account, make sure you have addressed at least:

- a **legal basis** for each intended use case (GDPR Art. 6; for employee data
  in the EU typically Art. 88 in combination with national employment law)
- an entry in your **record of processing activities** (Art. 30)
- **data processing agreements** with *both* Personio *and* the provider of the
  MCP client / LLM (Art. 28) — prompts and tool results, including personal
  data, are transmitted to that provider
- **international transfers** assessed and safeguarded if the LLM provider
  processes data outside the EU/EEA (Chapter V)
- **data minimisation** (Art. 5(1)(c)): scope the Personio API credentials as
  narrowly as your setup allows, and query only the employees, fields and date
  ranges you actually need — several tools return complete data sets by default
- **access control and logging** (Art. 32): anyone who can talk to the MCP
  client can read everything the credentials permit
- **retention rules**, in particular for **applicant data**, which in many
  jurisdictions must be deleted within a fixed period after a hiring decision
- consultation of your **data protection officer** and, where applicable, your
  **works council or employee representatives** — in several jurisdictions,
  tooling that makes employee attendance and performance data queryable is
  subject to codetermination and must be agreed before rollout

### Destructive and write operations

The following tools **modify or delete data in your production HR system**:
`create_attendance_period_v2`, `update_attendance_period_v2`,
`delete_attendance_period_v2`, `create_attendance_with_approval`,
`upload_document`, `delete_document`. An LLM may invoke them based on
misinterpreted instructions. Test against a sandbox or a throwaway employee
record first, and consider restricting credential scopes if you only need read
access.

### Beta interfaces

The recruiting tools build on Personio's V2 Recruiting API, which Personio
labels as Beta. Its behaviour and availability may change without notice.

This software is provided **as is**, without warranty of any kind, and the
authors accept no liability for unlawful or unintended processing carried out
with it. See [`LICENSE`](LICENSE) and [`SECURITY.md`](SECURITY.md).

## Prerequisites

- Node.js 18 or higher
- Personio API credentials (Client ID and Client Secret)

## Installation

### Quick Install (Recommended)

Install the package globally via npm:

```bash
npm install -g @gomedicus/personio-mcp-server
```

Then run the setup wizard:

```bash
personio-mcp-setup
```

The setup wizard will:
- Ask for your Personio API credentials
- Automatically configure Claude Desktop
- Verify the installation

**That's it!** Restart Claude Desktop and the Personio tools will be available.

---

### Manual Installation (Development)

For development or manual setup:

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

## Configuration

### Environment Variables

Set the following environment variables:

- `PERSONIO_CLIENT_ID`: Your Personio API client ID
- `PERSONIO_CLIENT_SECRET`: Your Personio API client secret

You can set these in a `.env` file in the project root:

```
PERSONIO_CLIENT_ID=your_client_id
PERSONIO_CLIENT_SECRET=your_client_secret
```

### MCP Client Configuration (Claude Desktop)

To use this server with Claude Desktop, add it to your Claude configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

Add the following configuration:

```json
{
  "mcpServers": {
    "personio": {
      "command": "node",
      "args": [
        "/absolute/path/to/personio-server/build/index.js"
      ],
      "env": {
        "PERSONIO_CLIENT_ID": "your_client_id",
        "PERSONIO_CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
```

**Important:** Replace `/absolute/path/to/personio-server` with the actual path to this project directory.

After adding the configuration:
1. Restart Claude Desktop
2. The Personio tools will be available in your conversations
3. You can now ask Claude to export employee lists with locations!

## Usage

### Running the Server

```bash
npm start
```

Or with environment variables:

```bash
PERSONIO_CLIENT_ID=your_client_id PERSONIO_CLIENT_SECRET=your_client_secret npm start
```

### Using with Claude

Once configured, you can ask Claude to use the Personio tools. Here are some example requests:

**Export employees with locations:**
```
"Please export all employees from the Hamburg office as CSV"
"Give me a list of all employees with their office locations"
"Export the first 50 employees to CSV format"
```

**Filter by location:**
```
"How many employees work in the Berlin office?"
"Show me all employees in the Rangendingen location"
"List employees from remote offices"
```

**Get employee information:**
```
"Get details for employee ID 12345"
"Search for employees named John"
"Show me all employees in the IT department"
```

Claude will use the appropriate Personio MCP tools to fulfill your requests and can export the data in either JSON or CSV format as needed.

## Available Tools

### Employee Tools

- `get_employee`: Get detailed information about a specific employee by ID
  - Returns: id, name, email, position, department, **office/location**, status, hire_date, weekly_hours, shoe_size

- `list_employees`: Get a list of all employees with optional filtering and export formats
  - **Parameters:**
    - `limit`: Maximum number of employees to return (default: 200)
    - `offset`: Number of employees to skip for pagination
    - `attributes`: Specific employee attributes to retrieve
    - `office`: Filter employees by office/workplace name (case-insensitive partial match)
    - `format`: Output format - `"json"` (default) or `"csv"` for spreadsheet export
  - **Features:**
    - Filter by office/location to find employees in specific workplaces
    - Export to CSV format for easy spreadsheet import
    - Includes office/location field in all employee records

- `search_employees`: Search for employees by name, email, or department

**Example Usage:**
```javascript
// Get all employees in Hamburg office
list_employees({ office: "Hamburg" })

// Export first 100 employees as CSV
list_employees({ limit: 100, format: "csv" })

// Get employees from a specific office as CSV
list_employees({ office: "Berlin", format: "csv" })
```

### Attendance Tools (V1 API)

- `get_attendance_records`: Retrieve attendance records with optional date and employee filters
- `get_current_attendance_status`: Get current attendance status for today
- `generate_attendance_report`: Generate attendance analytics report for a date range

### Attendance Tools (V2 API) - Enhanced Features

- `get_attendance_periods_v2`: List attendance periods with timezone support and enhanced filtering
- `get_attendance_period_v2`: Get a specific attendance period by ID
- `create_attendance_period_v2`: Create attendance periods with timezone support and period types
- `update_attendance_period_v2`: Update existing attendance periods
- `delete_attendance_period_v2`: Delete attendance periods
- `generate_v1_v2_compatibility_report`: Compare v1 and v2 API responses for migration planning

**V2 API Features:**
- Timezone support (start/end times with timezone information)
- Support for different period types (AttendancePeriod, Break)
- ISO 8601 datetime format support
- Enhanced error handling with scope-specific messages
- Backward compatibility helpers for v1/v2 data conversion

### Absence Tools

- `get_absences`: Retrieve absence/time-off records with optional filters
- `get_employee_absence_balance`: Get absence balance for a specific employee
- `get_absence_types`: Get all available absence/time-off types
- `get_team_absence_overview`: Get overview of who is out today or in a specific date range
- `get_absence_statistics`: Get absence usage statistics and trends

### Document Tools (V2 Document Management API)

> ⚠️ These tools access **HR documents**, which regularly contain sensitive
> employment information. `upload_document` and `delete_document` write to and
> delete from your production Personio account.

- `get_employee_documents`: Get documents for a specific employee
- `get_document_categories`: Get all available document categories in the company
- `get_documents_by_category`: Get all documents in a specific category across all employees
- `download_document`: Download a document by ID
- `upload_document`: Upload a document for an employee — **write operation**
- `delete_document`: Delete a document by ID — **destructive operation**

### Recruiting Tools (V2 Recruiting API, Beta)

> ⚠️ These tools access **applicant data**. Applicant data is subject to its own
> retention rules in many jurisdictions and is usually not covered by the legal
> basis you rely on for employee data. See
> [Data Protection & Compliance](#️-data-protection--compliance).
>
> Personio labels the underlying V2 Recruiting API as Beta — behaviour may change.

- `list_recruiting_jobs`: List all recruiting job postings (cursor-based pagination)
- `get_recruiting_job`: Get detailed information about a specific job posting by ID
- `list_recruiting_categories`: List all recruiting job categories
- `list_recruiting_candidates`: List all recruiting candidates (cursor-based pagination)
- `get_recruiting_candidate`: Get detailed information about a specific candidate by ID
- `list_recruiting_applications`: List all applications, optionally filtered by date range or email
- `get_recruiting_application`: Get detailed information about a specific application by ID
- `list_application_stage_transitions`: List the stage transition history for an application
- `list_application_documents`: List all documents (CV, cover letter, etc.) attached to an application
- `download_application_document`: Download an application document by ID — returns base64-encoded file content

### Approval Tools

- `get_pending_approvals`: Get pending approval requests
- `get_attendance_approval_status`: Get attendance records with their approval status
- `get_absence_approval_status`: Get absence requests with their approval status
- `get_approval_workflow_summary`: Get a summary of all approval workflows and their status
- `create_attendance_with_approval`: Create an attendance record with approval workflow — **write operation**

### Team Tools

- `get_team_availability`: Get current team availability and status

### Utility Tools

- `api_health_check`: Check Personio API connectivity and authentication status

## Development

### Project Structure

- `src/api/`: API client for Personio
- `src/auth/`: Authentication logic
- `src/handlers/`: Tool handlers organized by category
- `src/validators/`: Input validation helpers
- `src/tools/`: Tool definitions
- `src/index.ts`: Main server file

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Testing Location Export Features

Run the location export test script to verify the new features:

```bash
node test-location-export.mjs
```

This will test:
- Employee office/location field retrieval
- Filtering employees by office
- CSV export format
- Combined office filtering with CSV export

## CSV Export Format

When using `format: "csv"` with the `list_employees` tool, the output includes:

- Header row with column names
- Employee data with fields: ID, Name, Email, Position, Department, Office, Status, Hire Date, Weekly Hours
- Proper CSV escaping for special characters (commas, quotes, newlines)
- Metadata including export timestamp and total employee count
- **Note**: Additional fields like shoe_size are only available in JSON format, not CSV exports

The CSV format is ideal for:
- Importing into Excel or Google Sheets
- Further data analysis
- Creating reports
- Backup purposes

## License

MIT

## Author

Nikolai Bockholt
