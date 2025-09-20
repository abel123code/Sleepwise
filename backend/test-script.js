// Test script to debug the refresh token issue
import 'dotenv/config';

console.log('Testing script execution...');
console.log('Environment variables:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI ? 'Set' : 'Not set');

try {
  const { google } = await import('googleapis');
  console.log('✅ googleapis imported successfully');
} catch (error) {
  console.error('❌ Error importing googleapis:', error.message);
}

try {
  const readline = await import('node:readline/promises');
  console.log('✅ readline imported successfully');
} catch (error) {
  console.error('❌ Error importing readline:', error.message);
}
