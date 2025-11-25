#!/usr/bin/env node

// Discovery script to find the location/office attribute in Personio API
// Run this with: node discover-location.mjs

import 'dotenv/config';
import { PersonioClient } from './build/api/personio-client.js';

console.log('🔍 Discovering Location Attribute in Personio API\n');

const CLIENT_ID = process.env.PERSONIO_CLIENT_ID;
const CLIENT_SECRET = process.env.PERSONIO_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.log('❌ Missing environment variables. Please set:');
  console.log('   PERSONIO_CLIENT_ID');
  console.log('   PERSONIO_CLIENT_SECRET');
  process.exit(1);
}

async function discoverLocationAttribute() {
  try {
    const client = new PersonioClient({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    });

    console.log('📌 Fetching first employee with all attributes...\n');

    // Fetch first employee without attribute filter (gets all attributes)
    const response = await client.getEmployees({ limit: 1 });

    if (!response.data || response.data.length === 0) {
      console.log('❌ No employees found in your Personio account');
      return;
    }

    const employee = response.data[0];
    console.log('✅ Employee data retrieved\n');
    console.log('📋 All available attributes:\n');

    // List all attributes
    const attributes = employee.attributes || {};
    const attributeKeys = Object.keys(attributes).sort();

    console.log(`Found ${attributeKeys.length} total attributes:\n`);

    // Look for location-related attributes
    const locationKeywords = ['location', 'office', 'workplace', 'site', 'branch', 'work_location', 'office_location'];
    const possibleLocationFields = [];

    attributeKeys.forEach((key, index) => {
      const value = attributes[key]?.value;
      const label = attributes[key]?.label;
      const displayValue = value !== undefined && value !== null ? value : '(empty)';

      // Check if this might be a location field
      const isLocationField = locationKeywords.some(keyword =>
        key.toLowerCase().includes(keyword) ||
        (label && label.toLowerCase().includes(keyword))
      );

      if (isLocationField) {
        possibleLocationFields.push({ key, label, value: displayValue });
      }

      // Display all attributes
      console.log(`${(index + 1).toString().padStart(3, ' ')}. ${key.padEnd(30)} | Label: ${label?.padEnd(25) || 'N/A'.padEnd(25)} | Value: ${displayValue}`);
    });

    // Highlight possible location fields
    if (possibleLocationFields.length > 0) {
      console.log('\n🎯 Possible location-related fields found:\n');
      possibleLocationFields.forEach((field, index) => {
        console.log(`${index + 1}. Key: "${field.key}"`);
        console.log(`   Label: "${field.label}"`);
        console.log(`   Value: "${field.value}"`);
        console.log('');
      });

      console.log('✅ Recommendation: Use one of these attribute keys for location');
    } else {
      console.log('\n⚠️  No obvious location fields found');
      console.log('   Check the full attribute list above for location data');
      console.log('   Common names: office, location, workplace, site, branch');
    }

    // Output raw JSON for manual inspection
    console.log('\n📄 Raw employee data (first employee):');
    console.log(JSON.stringify(employee, null, 2));

  } catch (error) {
    console.log('❌ Discovery failed:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

discoverLocationAttribute().then(() => {
  console.log('\n✅ Discovery complete!');
}).catch(error => {
  console.log('\n💥 Discovery crashed:', error.message);
  process.exit(1);
});
