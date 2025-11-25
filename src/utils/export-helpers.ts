// Export helper utilities for formatting employee data

/**
 * Converts an array of employee objects to CSV format
 * @param employees Array of formatted employee objects
 * @returns CSV string with headers and data rows
 */
export function employeesToCsv(employees: any[]): string {
  if (!employees || employees.length === 0) {
    return 'No employees to export';
  }

  // Define CSV headers based on formatted employee data structure
  const headers = [
    'ID',
    'Name',
    'Email',
    'Position',
    'Department',
    'Office',
    'Status',
    'Hire Date',
    'Weekly Hours',
  ];

  // Helper function to escape and format CSV values
  const escapeCsvValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }

    const stringValue = String(value);

    // Escape double quotes by doubling them
    const escaped = stringValue.replace(/"/g, '""');

    // Wrap in quotes if contains comma, newline, or double quote
    if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
      return `"${escaped}"`;
    }

    return escaped;
  };

  // Build CSV rows
  const csvRows: string[] = [];

  // Add header row
  csvRows.push(headers.join(','));

  // Add data rows
  employees.forEach((employee) => {
    const row = [
      escapeCsvValue(employee.id),
      escapeCsvValue(employee.name),
      escapeCsvValue(employee.email),
      escapeCsvValue(employee.position),
      escapeCsvValue(employee.department),
      escapeCsvValue(employee.office),
      escapeCsvValue(employee.status),
      escapeCsvValue(employee.hire_date),
      escapeCsvValue(employee.weekly_hours),
    ];

    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

/**
 * Creates a text representation with metadata for CSV exports
 * @param csv The CSV string
 * @param totalCount Total number of employees exported
 * @returns Formatted text with metadata and CSV content
 */
export function formatCsvExport(csv: string, totalCount: number): string {
  const timestamp = new Date().toISOString();

  return `Employee Export - Generated at ${timestamp}
Total Employees: ${totalCount}

${csv}`;
}
