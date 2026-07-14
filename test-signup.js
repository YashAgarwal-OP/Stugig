#!/usr/bin/env node

/**
 * Test script to verify signup endpoint is working
 * Usage:
 *   node test-signup.js https://your-backend.onrender.com
 *   node test-signup.js http://localhost:5000
 */

const https = require('https');
const http = require('http');

const baseUrl = process.argv[2] || 'http://localhost:5000';
const apiUrl = `${baseUrl}/api/auth/signup`;

console.log('🧪 Testing StuGig Signup Endpoint');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Target: ${apiUrl}\n`);

// Test data
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'password123',
  role: 'freelancer'
};

console.log('Test User:', JSON.stringify(testUser, null, 2));
console.log('\n📡 Sending request...\n');

const postData = JSON.stringify(testUser);
const url = new URL(apiUrl);
const client = url.protocol === 'https:' ? https : http;

const options = {
  hostname: url.hostname,
  port: url.port,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = client.request(options, (res) => {
  console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  console.log('\nResponse Body:');
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (res.statusCode === 201 && parsed.success) {
        console.log('\n✅ SUCCESS! Signup endpoint is working correctly.');
        console.log('   User created:', parsed.name);
        console.log('   Token received:', parsed.token ? 'YES' : 'NO');
      } else {
        console.log('\n❌ FAILED! Signup returned an error.');
        console.log('   Error:', parsed.error || 'Unknown error');
      }
    } catch (e) {
      console.log(data);
      console.log('\n❌ FAILED! Could not parse response as JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ REQUEST FAILED');
  console.error('Error:', error.message);
  console.error('\nPossible causes:');
  console.error('  1. Backend is not running');
  console.error('  2. Wrong URL provided');
  console.error('  3. Network/firewall blocking connection');
  console.error('  4. MongoDB not connected (check backend logs)');
});

req.write(postData);
req.end();
