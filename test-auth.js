#!/usr/bin/env node

// Test script to verify authentication with Personio API
// Run this with: node test-auth.js

import 'dotenv/config';

import { PersonioAuth } from './build/auth/personio-auth.js';

import { PersonioClient } from './build/api/personio-client.js';

console.log('🔑 Testing Personio Authentication\n');

const CLIENT_ID = process.env.PERSONIO_CLIENT_ID;
const CLIENT_SECRET = process.env.PERSONIO_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.log('❌ Missing environment variables:');
  console.log('   PERSONIO_CLIENT_ID:', CLIENT_ID ? '✅ Set' : '❌ Missing');
  console.log('   PERSONIO_CLIENT_SECRET:', CLIENT_SECRET ? '✅ Set (hidden)' : '❌ Missing');
  console.log('\nPlease set both environment variables and try again.');
  process.exit(1);
}

console.log('✅ Environment variables detected\n');

async function testAuth() {
  // Test V1 Authentication
  console.log('📌 Testing V1 Authentication...');
  try {
    const v1Auth = new PersonioAuth({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      useV2Auth: false, // Force v1 auth
    });

    const v1Token = await v1Auth.getValidToken();
    console.log('✅ V1 authentication successful');
    console.log('   Token type: Bearer');
    console.log('   Token length:', v1Token.length);
    console.log('   First 10 chars:', v1Token.substring(0, 10) + '...');
  } catch (error) {
    console.log('❌ V1 authentication failed:', error.message);
  }

  console.log('\n📌 Testing V2 OAuth Authentication...');
  try {
    const v2Auth = new PersonioAuth({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      useV2Auth: true, // Force v2 auth
    });

    const v2Token = await v2Auth.getValidToken();
    console.log('✅ V2 OAuth authentication successful');
    console.log('   Token type: Bearer');
    console.log('   Token length:', v2Token.length);
    console.log('   First 10 chars:', v2Token.substring(0, 10) + '...');
  } catch (error) {
    console.log('❌ V2 OAuth authentication failed:', error.message);

    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('\n⚠️  V2 OAuth Issue: Invalid credentials');
      console.log('   • Check if your API credentials are correct');
      console.log('   • Verify credentials have v2 API access enabled');
    } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
      console.log('\n⚠️  V2 OAuth Issue: Access forbidden');
      console.log('   • Your account may not have v2 API access');
      console.log('   • Contact Personio support to enable v2 API');
    }
  }

  console.log('\n📌 Testing Auto-fallback (Default Behavior)...');
  try {
    const autoAuth = new PersonioAuth({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      // useV2Auth not set - will try v2 first, then fall back to v1
    });

    const token = await autoAuth.getValidToken();
    console.log('✅ Auto authentication successful');
    console.log('   Token obtained (v2 or v1 fallback)');
    console.log('   Token length:', token.length);

    // Clear token to test again
    autoAuth.clearToken();
  } catch (error) {
    console.log('❌ Both v1 and v2 authentication failed:', error.message);
  }

  console.log('\n📌 Testing API calls with obtained token...');
  try {
    const client = new PersonioClient({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    });

    // Test v1 endpoint
    console.log('\n   Testing v1 /company/employees endpoint...');
    try {
      const employees = await client.getEmployees({ limit: 1 , attributes: ['first_name', 'last_name', 'preferred_name', 'email', 'gender', 'status', 'position', 'supervisor', 'employment_type', 'weekly_working_hours', 'hire_date', 'contract_end_date', 'termination_date', 'termination_type', 'termination_reason', 'probation_period_end', 'created_at', 'last_modified_at', 'subcompany', 'office', 'department', 'cost_centers', 'holiday_calendar', 'absence_entitlement', 'work_schedule', 'fix_salary', 'fix_salary_interval', 'hourly_salary', 'last_working_day', 'profile_picture', 'team', 'dynamic_5524208', 'dynamic_5524209', 'dynamic_5524216', 'dynamic_5524218', 'dynamic_5524235', 'dynamic_5524206', 'dynamic_5524212', 'dynamic_5524217', 'dynamic_5524219', 'dynamic_5524236', 'dynamic_5524210', 'dynamic_5524215', 'dynamic_5524207', 'dynamic_5524220', 'dynamic_5524221', 'dynamic_5524226', 'dynamic_5524211', 'dynamic_5524224', 'dynamic_5524213', 'dynamic_5524227', 'dynamic_5524214', 'dynamic_5524228', 'dynamic_5524233', 'dynamic_5524234', 'dynamic_6925241', 'dynamic_5524222', 'dynamic_5524223', 'dynamic_5524225', 'dynamic_5524229', 'dynamic_5524230', 'dynamic_17855110', 'dynamic_17856089', 'dynamic_17912832']});
      // dump employees response for debugging
      console.log('   Employees response:', JSON.stringify(employees, null, 2));
      console.log('   ✅ V1 API call successful');

      const employee = await client.getEmployee("35717230", ['first_name', 'last_name', 'preferred_name', 'email', 'gender', 'status', 'position', 'supervisor', 'employment_type', 'weekly_working_hours', 'hire_date', 'contract_end_date', 'termination_date', 'termination_type', 'termination_reason', 'probation_period_end', 'created_at', 'last_modified_at', 'subcompany', 'office', 'department', 'cost_centers', 'holiday_calendar', 'absence_entitlement', 'work_schedule', 'fix_salary', 'fix_salary_interval', 'hourly_salary', 'last_working_day', 'profile_picture', 'team', 'dynamic_5524208', 'dynamic_5524209', 'dynamic_5524216', 'dynamic_5524218', 'dynamic_5524235', 'dynamic_5524206', 'dynamic_5524212', 'dynamic_5524217', 'dynamic_5524219', 'dynamic_5524236', 'dynamic_5524210', 'dynamic_5524215', 'dynamic_5524207', 'dynamic_5524220', 'dynamic_5524221', 'dynamic_5524226', 'dynamic_5524211', 'dynamic_5524224', 'dynamic_5524213', 'dynamic_5524227', 'dynamic_5524214', 'dynamic_5524228', 'dynamic_5524233', 'dynamic_5524234', 'dynamic_6925241', 'dynamic_5524222', 'dynamic_5524223', 'dynamic_5524225', 'dynamic_5524229', 'dynamic_5524230', 'dynamic_17855110', 'dynamic_17856089', 'dynamic_17912832']);
      // dump employees response for debugging
      console.log('   Employee response:', JSON.stringify(employee, null, 2));
      console.log('   ✅ V1 API call successful');

    } catch (error) {
      console.log('   ❌ V1 API call failed:', error.message);
    }

    // Test v2 endpoint
    console.log('\n   Testing v2 /attendance-periods endpoint...');
    try {
      const attendance = await client.getAttendancePeriodsV2({
        limit: 10,
        end_date_time: "2026-05-13T23:59:59",
        start_date_time: "2026-05-12T00:00:00"
      });
      console.log('   Attendance response:', JSON.stringify(attendance, null, 2));
      console.log('   ✅ V2 API call successful');
    } catch (error) {
      console.log('   ❌ V2 API call failed:', error.message);

      if (error.message.includes('V2 Attendance API access denied')) {
        console.log('\n   💡 Solution: The authentication works but v2 attendance scope is missing');
        console.log('      • V1 endpoints are working correctly');
        console.log('      • Use v1 attendance tools instead of v2');
        console.log('      • Contact Personio for v2 attendance API access');
      }
    }

  } catch (error) {
    console.log('❌ API test failed:', error.message);
  }
}

testAuth().then(() => {
  console.log('\n✅ Authentication test complete!');
  console.log('\n📚 Summary:');
  console.log('   • If V1 auth works: Your credentials are valid');
  console.log('   • If V2 OAuth fails: Normal - v2 may not be enabled for your account');
  console.log('   • If V2 attendance fails: Scope issue - use v1 tools instead');
  console.log('\n💡 Recommendation: Use the v1 attendance tools which are fully functional');
}).catch(error => {
  console.log('\n💥 Test crashed:', error.message);
  process.exit(1);
});