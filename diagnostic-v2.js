#!/usr/bin/env node

// Diagnostic script to identify v2 API issues
// Run this with: node diagnostic-v2.js

const { PersonioClient } = require('./build/api/personio-client.js');
const { AttendanceHandlersV2 } = require('./build/handlers/attendance-handlers-v2.js');

console.log('🔍 Personio v2 API Diagnostic Tool\n');

// Check environment variables
const CLIENT_ID = process.env.PERSONIO_CLIENT_ID;
const CLIENT_SECRET = process.env.PERSONIO_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.log('❌ Missing environment variables:');
  console.log('   PERSONIO_CLIENT_ID:', CLIENT_ID ? '✅ Set' : '❌ Missing');
  console.log('   PERSONIO_CLIENT_SECRET:', CLIENT_SECRET ? '✅ Set' : '❌ Missing');
  console.log('\n💡 Please set both environment variables and try again.');
  process.exit(1);
}

console.log('✅ Environment variables are set');

async function runDiagnostics() {
  try {
    // Test basic client creation
    console.log('\n📋 Testing PersonioClient creation...');
    const client = new PersonioClient({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    });
    console.log('✅ PersonioClient created successfully');

    // Test basic API health
    console.log('\n🏥 Testing basic API health...');
    try {
      const health = await client.healthCheck();
      console.log('✅ V1 API is accessible:', health.status);
    } catch (error) {
      console.log('❌ V1 API health check failed:', error.message);
      return;
    }

    // Test v1 attendance endpoint (for comparison)
    console.log('\n📊 Testing v1 attendance endpoint...');
    try {
      const v1Response = await client.getAttendances({ limit: 1 });
      console.log('✅ V1 attendance API is working');
      console.log('   Records found:', v1Response.data.length);
    } catch (error) {
      console.log('❌ V1 attendance API failed:', error.message);
    }

    // Test v2 attendance endpoint
    console.log('\n🆕 Testing v2 attendance endpoint...');
    try {
      const v2Response = await client.getAttendancePeriodsV2({ limit: 1 });
      console.log('✅ V2 attendance API is working!');
      console.log('   Records found:', Array.isArray(v2Response.data) ? v2Response.data.length : 'N/A');
    } catch (error) {
      console.log('❌ V2 attendance API failed');
      console.log('   Error message:', error.message);

      // Analyze the error
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        console.log('\n🔒 SCOPE ISSUE DETECTED:');
        console.log('   The v2 API requires different scopes than v1.');
        console.log('   Current known issues:');
        console.log('   • "attendances:read" scope is insufficient for v2');
        console.log('   • Required scope for v2 is not clearly documented');
        console.log('\n💡 SOLUTIONS TO TRY:');
        console.log('   1. Contact Personio support for v2 API access');
        console.log('   2. Check if your account has v2 API access enabled');
        console.log('   3. Verify API credentials have the latest scopes');
        console.log('   4. Use v1 endpoints (get_attendance_records) as alternative');
      } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        console.log('\n🚫 ENDPOINT NOT AVAILABLE:');
        console.log('   The v2 attendance endpoint may not be available for your account.');
        console.log('   This could mean:');
        console.log('   • v2 API is in beta and not accessible to all accounts');
        console.log('   • Your Personio subscription level doesn\'t include v2 API access');
        console.log('\n💡 RECOMMENDATION: Use v1 endpoints for now');
      } else {
        console.log('\n❓ UNKNOWN ERROR:');
        console.log('   This might be a network issue or API problem.');
        console.log('   Full error:', error);
      }
    }

    // Test the MCP handler
    console.log('\n🛠️  Testing MCP v2 handler...');
    try {
      const handler = new AttendanceHandlersV2(client);
      const result = await handler.handleGetAttendancePeriodsV2({ limit: 1 });

      if (result.isError) {
        console.log('❌ MCP Handler returned error response');
        const content = JSON.parse(result.content[0].text);
        console.log('   Error details:', content.error);
        console.log('   Suggestion:', content.suggestion);
      } else {
        console.log('✅ MCP Handler working correctly');
      }
    } catch (error) {
      console.log('❌ MCP Handler failed:', error.message);
    }

  } catch (error) {
    console.log('❌ Diagnostic failed:', error.message);
  }
}

// Run diagnostics
runDiagnostics().then(() => {
  console.log('\n🏁 Diagnostic complete!');
}).catch(error => {
  console.log('\n💥 Diagnostic crashed:', error.message);
  process.exit(1);
});