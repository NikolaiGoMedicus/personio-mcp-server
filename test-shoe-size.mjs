#!/usr/bin/env node

// Test script to verify shoe size is now included in employee data
// Run this with: node test-shoe-size.mjs

import 'dotenv/config';
import { PersonioClient } from './build/api/personio-client.js';
import { EmployeeHandlers } from './build/handlers/employee-handlers.js';

console.log('🧪 Testing Shoe Size Integration\n');

const CLIENT_ID = process.env.PERSONIO_CLIENT_ID;
const CLIENT_SECRET = process.env.PERSONIO_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

async function testShoeSize() {
  try {
    const client = new PersonioClient({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    });

    const handlers = new EmployeeHandlers(client);

    console.log('📌 Test 1: Get employees with shoe_size field (JSON format)');
    console.log('   Fetching first 10 employees...\n');

    const jsonResult = await handlers.handleListEmployees({
      limit: 10,
    });

    const jsonData = JSON.parse(jsonResult.content[0].text);
    console.log('   ✅ JSON Result:');
    console.log(`   Total employees: ${jsonData.total}\n`);

    // Check if shoe_size field is present
    const employeesWithShoeSize = jsonData.employees.filter(emp => emp.shoe_size);
    const employeesWithoutShoeSize = jsonData.employees.filter(emp => !emp.shoe_size);

    console.log('   Shoe Size Status:');
    console.log(`   - Employees with shoe_size data: ${employeesWithShoeSize.length}`);
    console.log(`   - Employees without shoe_size data: ${employeesWithoutShoeSize.length}\n`);

    // Display sample employees with their shoe sizes
    console.log('   Sample employees:');
    jsonData.employees.slice(0, 5).forEach((emp, idx) => {
      const shoeSizeDisplay = emp.shoe_size || '(not set)';
      console.log(`   ${idx + 1}. ${emp.name} - Shoe Size: ${shoeSizeDisplay}`);
    });
    console.log('');

    // Verify the field exists in the returned data structure
    const firstEmployee = jsonData.employees[0];
    const hasShoeSize = 'shoe_size' in firstEmployee;

    if (hasShoeSize) {
      console.log('   ✅ SUCCESS: shoe_size field is present in employee data');
    } else {
      console.log('   ❌ FAILED: shoe_size field is missing from employee data');
    }

    console.log('\n📌 Test 2: Get single employee with shoe_size');
    const firstEmployeeId = jsonData.employees[0].id;
    console.log(`   Fetching employee ID ${firstEmployeeId}...\n`);

    const singleResult = await handlers.handleGetEmployee({
      employee_id: firstEmployeeId,
    });

    const singleData = JSON.parse(singleResult.content[0].text);
    console.log('   Employee Data:');
    console.log(`   - Name: ${singleData.name}`);
    console.log(`   - Email: ${singleData.email}`);
    console.log(`   - Position: ${singleData.position}`);
    console.log(`   - Shoe Size: ${singleData.shoe_size || '(not set)'}`);

    if ('shoe_size' in singleData) {
      console.log('\n   ✅ SUCCESS: shoe_size field is present in single employee data');
    } else {
      console.log('\n   ❌ FAILED: shoe_size field is missing from single employee data');
    }

    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.stack) {
      console.log('\nStack trace:', error.stack);
    }
  }
}

testShoeSize().then(() => {
  console.log('\n🎉 Shoe size testing complete!');
}).catch(error => {
  console.log('\n💥 Test crashed:', error.message);
  process.exit(1);
});
