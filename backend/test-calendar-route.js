// Test script to verify calendar route setup
import 'dotenv/config';

console.log('🧪 Testing Calendar Route Setup...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_REFRESH_TOKEN:', process.env.GOOGLE_REFRESH_TOKEN ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_CALENDAR_ID:', process.env.GOOGLE_CALENDAR_ID || 'primary (default)');
console.log('DEFAULT_TZ:', process.env.DEFAULT_TZ || 'UTC (default)');

// Test date validation
console.log('\n📅 Date Validation Tests:');
const testDates = [
  '2025-09-20',    
];

testDates.forEach(date => {
  const isValid = /^\d{4}-\d{2}-\d{2}$/.test(date);
  console.log(`${date}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
});

// Test URL construction
console.log('\n🔗 Test URLs for Postman:');
const baseUrl = 'http://localhost:3000';
const testDate = '2025-09-20';
const timezone = 'Asia/Singapore';

console.log(`Health Check: ${baseUrl}/`);
console.log(`API Info: ${baseUrl}/api`);
console.log(`Calendar Day: ${baseUrl}/calendar/day?date=${testDate}&tz=${timezone}&calendarId=primary`);

console.log('\n✅ Calendar route setup verification complete!');
console.log('\n📝 Next steps:');
console.log('1. Make sure all environment variables are set');
console.log('2. Run: npm run dev');
console.log('3. Test the URLs above in Postman');
console.log('4. If GOOGLE_REFRESH_TOKEN is missing, run: npm run get:rt');
