#!/usr/bin/env node

// Test script to verify authentication with Personio API
// Run this with: node test-auth.mjs

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
  console.log('\nYou can set them in a .env file:');
  console.log('PERSONIO_CLIENT_ID=your_client_id');
  console.log('PERSONIO_CLIENT_SECRET=your_client_secret');
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
      const employees = await client.getEmployees({ limit: 1 });
      console.log('   ✅ V1 API call successful');
      console.log('   Employees found:', employees.data.length);
    } catch (error) {
      console.log('   ❌ V1 API call failed:', error.message);
    }

    // Test v2 endpoint
    console.log('\n   Testing v2 /attendance-periods endpoint...');
    try {
      const attendance = await client.getAttendancePeriodsV2({ limit: 1 });
      console.log('   ✅ V2 API call successful');
      console.log('   Attendance periods found:', Array.isArray(attendance.data) ? attendance.data.length : 'N/A');
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
  console.log('\n📌 Working v1 tools you can use:');
  console.log('   • get_attendance_records');
  console.log('   • get_current_attendance_status');
  console.log('   • generate_attendance_report');
  console.log('   • api_health_check');
}).catch(error => {
  console.log('\n💥 Test crashed:', error.message);
  process.exit(1);
});