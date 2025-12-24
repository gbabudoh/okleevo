/**
 * Test Email Sending
 * Run with: npx tsx scripts/test-email.ts
 */

import { sendEmail, sendWelcomeEmail } from '../lib/services/email';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function testEmail() {
  console.log('🧪 Testing email configuration...\n');

  // Check if email is configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Email not configured!');
    console.log('\nPlease add to .env.local:');
    console.log('SMTP_HOST=smtp.gmail.com');
    console.log('SMTP_PORT=587');
    console.log('SMTP_USER=your-email@gmail.com');
    console.log('SMTP_PASS=your-app-password');
    console.log('EMAIL_FROM=your-email@gmail.com');
    process.exit(1);
  }

  console.log('📧 Email Configuration:');
  console.log(`   Host: ${process.env.SMTP_HOST}`);
  console.log(`   Port: ${process.env.SMTP_PORT}`);
  console.log(`   User: ${process.env.SMTP_USER}`);
  console.log(`   From: ${process.env.EMAIL_FROM || process.env.SMTP_USER}\n`);

  // Get test email from command line or use default
  const testEmail = process.argv[2] || process.env.SMTP_USER;

  if (!testEmail) {
    console.error('❌ No test email provided!');
    console.log('Usage: npx tsx scripts/test-email.ts your-email@example.com');
    process.exit(1);
  }

  console.log(`📨 Sending test email to: ${testEmail}\n`);

  // Test 1: Simple email
  console.log('Test 1: Sending simple email...');
  const result1 = await sendEmail({
    to: testEmail,
    subject: 'Test Email from Okleevo',
    html: '<h1>Test Email</h1><p>If you receive this, email is working correctly!</p>',
    text: 'Test Email - If you receive this, email is working correctly!',
  });

  if (result1) {
    console.log('✅ Simple email sent successfully!\n');
  } else {
    console.log('❌ Simple email failed\n');
  }

  // Test 2: Welcome email
  console.log('Test 2: Sending welcome email...');
  const result2 = await sendWelcomeEmail(testEmail, 'Test User');

  if (result2) {
    console.log('✅ Welcome email sent successfully!\n');
  } else {
    console.log('❌ Welcome email failed\n');
  }

  console.log('✨ Email test complete!');
  console.log(`\nCheck your inbox at: ${testEmail}`);
  console.log('(Check spam folder if not received)');
}

testEmail().catch(console.error);

