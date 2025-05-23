# personio-mcp-server

A Model Context Protocol (MCP) server for integrating with the Personio HR API. This server provides tools for accessing employee data, attendance records, absence information, and analytics through Claude or other AI assistants that support the MCP protocol.

## Features

- **Employee Management**: Get employee details, list all employees, search for employees
- **Attendance Tracking**: Retrieve attendance records, check current attendance status
- **Absence Management**: View absences, check absence balances, get absence types
- **Analytics**: Generate attendance reports, check team availability, analyze absence statistics
- **Utilities**: API health check

## Prerequisites

- Node.js 18 or higher
- Personio API credentials (Client ID and Client Secret)

## Installation

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

Set the following environment variables:

- `PERSONIO_CLIENT_ID`: Your Personio API client ID
- `PERSONIO_CLIENT_SECRET`: Your Personio API client secret

You can set these in a `.env` file in the project root:

```
PERSONIO_CLIENT_ID=your_client_id
PERSONIO_CLIENT_SECRET=your_client_secret
```

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

To use this MCP server with Claude:

1. Start the server as described above
2. In Claude, use the MCP server connection feature to connect to this server
3. Once connected, you can use the provided tools to interact with Personio data

## Available Tools

### Employee Tools

- `get_employee`: Get detailed information about a specific employee by ID
- `list_employees`: Get a list of all employees with optional filtering
- `search_employees`: Search for employees by name, email, or department

### Attendance Tools

- `get_attendance_records`: Retrieve attendance records with optional date and employee filters
- `get_current_attendance_status`: Get current attendance status for today
- `generate_attendance_report`: Generate attendance analytics report for a date range

### Absence Tools

- `get_absences`: Retrieve absence/time-off records with optional filters
- `get_employee_absence_balance`: Get absence balance for a specific employee
- `get_absence_types`: Get all available absence/time-off types
- `get_team_absence_overview`: Get overview of who is out today or in a specific date range
- `get_absence_statistics`: Get absence usage statistics and trends

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

## License

MIT

## Author

Nikolai Bockholt
