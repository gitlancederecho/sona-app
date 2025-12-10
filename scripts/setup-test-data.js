#!/usr/bin/env node

/**
 * Test Data Setup for Phase 4
 * Creates test streams in Supabase so you can test the Home -> Watch flow
 */

const https = require('https');

const SUPABASE_URL = 'https://dbsnrezadnjczyxzfjmx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRic25yZXphZG5qY3p5eHpmam14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MTI2NzgsImV4cCI6MjA3NzM4ODY3OH0.WyOhp3UroLHRm4kBQt6exeu_yaDfB-pYj6g87q7FUBE';

/**
 * Make a POST request to Supabase REST API
 */
async function makeRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

/**
 * Get first user from the users table
 */
async function getFirstUser() {
  console.log('📍 Fetching first user from database...');
  const res = await makeRequest('GET', '/rest/v1/users?select=id&limit=1');
  if (res.status !== 200 || !res.data || res.data.length === 0) {
    throw new Error('No users found. Please sign up in the app first.');
  }
  return res.data[0].id;
}

/**
 * Create test streams
 */
async function createTestStreams(userId) {
  const testStreams = [
    {
      user_id: userId,
      title: 'Sintel Short Film (HLS Test)',
      playback_url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
      status: 'live',
      started_at: new Date().toISOString(),
    },
    {
      user_id: userId,
      title: 'Big Buck Bunny - Fallback Test',
      playback_url: null, // Will use fallback URL
      status: 'live',
      started_at: new Date().toISOString(),
    },
  ];

  for (const stream of testStreams) {
    console.log(`\n🎬 Creating stream: "${stream.title}"`);
    const res = await makeRequest('POST', '/rest/v1/streams', stream);
    
    if (res.status === 201) {
      console.log(`   ✅ Created! Stream ID: ${res.data[0]?.id}`);
    } else {
      console.log(`   ⚠️  Status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🚀 SONA Phase 4 Test Data Setup\n');
  console.log('This script will create test streams in your Supabase database.');
  console.log(`📊 Database: ${SUPABASE_URL}\n`);

  try {
    const userId = await getFirstUser();
    console.log(`✅ Found user: ${userId}\n`);

    await createTestStreams(userId);

    console.log('\n✨ Test data created successfully!');
    console.log('\n📱 Next steps:');
    console.log('  1. Run: npm start');
    console.log('  2. Scan the QR code with Expo Go');
    console.log('  3. Navigate to the Home screen');
    console.log('  4. You should see "Live Now" section with test streams');
    console.log('  5. Tap a stream card to watch the video\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('  - Make sure you have signed up in the app (at least one user must exist)');
    console.error('  - Ensure .env.local has correct SUPABASE_URL and SUPABASE_KEY');
    console.error('  - Check that the streams table was created via the migration\n');
    process.exit(1);
  }
}

main();
