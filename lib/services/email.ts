// Email service for sending transactional emails
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // TODO: Integrate with email provider (SendGrid, Resend, etc.)
    console.log('Sending email:', options);
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'Welcome to Our Platform',
    html: `<h1>Welcome ${name}!</h1><p>Thank you for joining us.</p>`,
    text: `Welcome ${name}! Thank you for joining us.`,
  });
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
  return sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    text: `Reset your password: ${resetUrl}`,
  });
}

export async function sendInvoiceEmail(email: string, invoiceId: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'New Invoice',
    html: `<p>You have a new invoice: ${invoiceId}</p>`,
    text: `You have a new invoice: ${invoiceId}`,
  });
}
