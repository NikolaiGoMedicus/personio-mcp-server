import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { PersonioClient } from '../api/personio-client.js';
import { isValidEmployeeArgs, isValidEmployeesArgs, isValidSearchArgs } from '../validators/index.js';
import { employeesToCsv, formatCsvExport } from '../utils/export-helpers.js';

export class EmployeeHandlers {
  constructor(private personioClient: PersonioClient) {}

  async handleGetEmployee(args: any) {
    if (!isValidEmployeeArgs(args)) {
      throw new McpError(ErrorCode.InvalidParams, 'Invalid employee arguments');
    }

    const response = await this.personioClient.getEmployee(args.employee_id, args.attributes);
    const formattedEmployee = this.personioClient.formatEmployeeData(response.data);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(formattedEmployee, null, 2),
        },
      ],
    };
  }

  async handleListEmployees(args: any) {
    if (!isValidEmployeesArgs(args)) {
      throw new McpError(ErrorCode.InvalidParams, 'Invalid employees list arguments');
    }

    const response = await this.personioClient.getEmployees({
      limit: args?.limit || 200,
      offset: args?.offset || 0,
      attributes: args?.attributes,
      office: args?.office,
    });

    const formattedEmployees = response.data.map(emp =>
      this.personioClient.formatEmployeeData(emp)
    );

    // Handle CSV export format
    if (args?.format === 'csv') {
      const csv = employeesToCsv(formattedEmployees);
      const csvWithMetadata = formatCsvExport(csv, formattedEmployees.length);

      return {
        content: [
          {
            type: 'text',
            text: csvWithMetadata,
          },
        ],
      };
    }

    // Default JSON format
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            employees: formattedEmployees,
            total: response.metadata?.total_elements || formattedEmployees.length,
            page: response.metadata?.current_page || 1,
          }, null, 2),
        },
      ],
    };
  }

  async handleSearchEmployees(args: any) {
    if (!isValidSearchArgs(args)) {
      throw new McpError(ErrorCode.InvalidParams, 'Invalid search arguments');
    }

    const response = await this.personioClient.getEmployees({
      limit: args.limit || 50,
    });

    const query = args.query.toLowerCase();
    const filteredEmployees = response.data
      .map(emp => this.personioClient.formatEmployeeData(emp))
      .filter(emp => 
        emp.name?.toLowerCase().includes(query) ||
        emp.email?.toLowerCase().includes(query) ||
        emp.department?.toLowerCase().includes(query) ||
        emp.position?.toLowerCase().includes(query)
      );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            query: args.query,
            results: filteredEmployees,
            count: filteredEmployees.length,
          }, null, 2),
        },
      ],
    };
  }
}
