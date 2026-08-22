import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendEmail } from '../utils/email.js';

/**
 * Submit Contact Form (Public)
 */
export const submitContact = catchAsync(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    throw new ApiError(400, 'Name, email, and message are required');
  }

  const cleanEmail = email.toLowerCase().trim();

  const contactMessage = await prisma.contactMessage.create({
    data: {
      name: name.trim(),
      email: cleanEmail,
      subject: subject || 'GlobeTrotter General Inquiry',
      message: message.trim(),
    },
  });

  // Attempt to forward via SMTP if configured
  try {
    const smtpSettings = await prisma.siteSetting.findMany({
      where: { group: 'SMTP' },
    });
    const fromEmail = smtpSettings.find((s) => s.key === 'smtp_from_email')?.value || 'concierge@globetrotter.com';

    await sendEmail({
      to: fromEmail,
      subject: `[GlobeTrotter Contact] ${subject || 'New Inquiry'} from ${name}`,
      html: `<div style="font-family:sans-serif;padding:20px;">
        <h3>New Contact Us Message Received</h3>
        <p><strong>From:</strong> ${name} (${cleanEmail})</p>
        <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
        <p><strong>Message:</strong></p>
        <div style="padding:15px;background:#f3f4f6;border-left:4px solid #d97706;margin:10px 0;">${message.replace(/\n/g, '<br/>')}</div>
      </div>`,
    });
  } catch (err) {
    console.log('⚠️ Notice: Could not send contact notification email:', err.message);
  }

  return ApiResponse.send(res, 201, { message: contactMessage }, 'Your message has been sent to our concierge team!');
});

/**
 * Get all contact messages (Admin only)
 */
export const getContactMessages = catchAsync(async (req, res) => {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return ApiResponse.send(res, 200, { messages, count: messages.length }, 'Contact messages retrieved');
});

/**
 * Mark contact message as read (Admin only)
 */
export const markMessageRead = catchAsync(async (req, res) => {
  const { id } = req.params;

  const updated = await prisma.contactMessage.update({
    where: { id },
    data: { isRead: true },
  });

  return ApiResponse.send(res, 200, { message: updated }, 'Message marked as read');
});

/**
 * Delete contact message (Admin only)
 */
export const deleteMessage = catchAsync(async (req, res) => {
  const { id } = req.params;

  await prisma.contactMessage.delete({ where: { id } });

  return ApiResponse.send(res, 200, null, 'Message deleted');
});
