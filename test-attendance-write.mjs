/**
 * Write Test: Attendance Creation (V1 + V2)
 * Uses early morning time slots (02:00-02:15, 02:30-02:45) to avoid overlaps.
 * Cleans up created records afterwards.
 */

import 'dotenv/config';
import { PersonioClient } from './build/api/personio-client.js';
import {
  EmployeeHandlers,
  AttendanceHandlersV2,
  ApprovalHandlers,
} from './build/handlers/index.js';

const CLIENT_ID = process.env.PERSONIO_CLIENT_ID;
const CLIENT_SECRET = process.env.PERSONIO_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('PERSONIO_CLIENT_ID and PERSONIO_CLIENT_SECRET must be set');
  process.exit(1);
}

const client = new PersonioClient({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
const employeeH = new EmployeeHandlers(client);
const attendanceV2H = new AttendanceHandlersV2(client);
const approvalH = new ApprovalHandlers(client);

// Use 5 days ago to avoid conflicts with today/yesterday entries
const testDate = new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0];
const results = { pass: 0, fail: 0 };

function parseResult(result) {
  return JSON.parse(result.content[0].text);
}

async function test(name, fn) {
  try {
    await fn();
    results.pass++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    results.fail++;
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message}`);
  }
}

console.log('\n── Attendance Write Tests ─────────────────────────────────');
console.log(`  Target date: ${testDate}\n`);

// Get employee
let employeeId = null;
await test('Get employee ID', async () => {
  const result = await employeeH.handleListEmployees({ limit: 1 });
  const data = parseResult(result);
  employeeId = data.employees[0].id;
  console.log(`    Employee ID: ${employeeId}`);
});

if (!employeeId) {
  console.log('\n  Cannot proceed without employee ID');
  process.exit(1);
}

// ── V1 Test ───────────────────────────────────────────────────

await test('V1: Create attendance (02:00-02:15)', async () => {
  const result = await approvalH.handleCreateAttendanceWithApproval({
    employee_id: employeeId,
    date: testDate,
    start_time: '02:00',
    end_time: '02:15',
    break_minutes: 0,
    comment: 'MCP V1 write test — delete me',
    skip_approval: true,
  });
  const data = parseResult(result);
  console.log(`    Success: ${data.success}, IDs: ${JSON.stringify(data.created_ids)}`);
  if (!data.success) {
    throw new Error(`V1 create failed: ${JSON.stringify(data)}`);
  }
});

// ── V2 Test ───────────────────────────────────────────────────

let v2CreatedId = null;

await test('V2: Create attendance period (02:30-02:45)', async () => {
  const result = await attendanceV2H.handleCreateAttendancePeriodV2({
    person_id: employeeId,
    start_date_time: `${testDate}T02:30:00`,
    end_date_time: `${testDate}T02:45:00`,
    comment: 'MCP V2 write test — delete me',
  });

  if (result.isError) {
    const data = parseResult(result);
    throw new Error(`V2 create error: ${JSON.stringify(data)}`);
  }

  const data = parseResult(result);
  v2CreatedId = data.attendance_period?.id;
  console.log(`    Success: ${data.success}, ID: ${v2CreatedId}`);
  if (!data.success) {
    throw new Error(`V2 create failed: ${JSON.stringify(data)}`);
  }
});

// ── Cleanup ───────────────────────────────────────────────────

console.log('\n── Cleanup ─────────────────────────────────────────────');

await test('Cleanup: find and delete test records', async () => {
  const result = await attendanceV2H.handleGetAttendancePeriodsV2({
    person_id: employeeId,
    start_date_time: `${testDate}T00:00:00`,
    end_date_time: `${testDate}T04:00:00`,
    limit: 50,
  });

  if (result.isError) {
    console.log('    (Cannot list for cleanup — manual cleanup may be needed)');
    return;
  }

  const data = parseResult(result);
  const testPeriods = data.attendance_periods?.filter(p =>
    p.comment?.includes('MCP') && p.comment?.includes('write test')
  ) || [];

  console.log(`    Found ${testPeriods.length} test records to delete`);

  for (const period of testPeriods) {
    try {
      await attendanceV2H.handleDeleteAttendancePeriodV2({ id: period.id });
      console.log(`    Deleted period ${period.id}`);
    } catch (err) {
      console.log(`    Failed to delete ${period.id}: ${err.message}`);
    }
  }
});

// Summary
console.log('\n══════════════════════════════════════════════════════════════');
console.log(`  Results: ${results.pass} passed, ${results.fail} failed`);
console.log('══════════════════════════════════════════════════════════════\n');

process.exit(results.fail > 0 ? 1 : 0);
