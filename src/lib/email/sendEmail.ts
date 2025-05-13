import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { Resend } from 'resend';
import ReviewApprovedEmail from '../../emails/ReviewApprovedEmail';
import ReviewRejectedEmail from '../../emails/ReviewRejectedEmail';
import ReviewSubmittedEmail from '../../emails/ReviewSubmittedEmail';
import ReviewReportedEmail from '../../emails/ReviewReportedEmail';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  secure: process.env.EMAIL_SERVER_PORT === "465",
});

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

interface ReviewEmailData {
  userName: string;
  productName: string;
  reviewContent: string;
  moderatorResponse?: string;
  reportReason?: string;
}

export async function sendReviewApprovedEmail(data: ReviewEmailData): Promise<void> {
  await resend.emails.send({
    from: 'Nexora <reviews@nexora.com>',
    to: [data.userName],
    subject: 'Your Review Has Been Approved!',
    react: ReviewApprovedEmail({ 
      userName: data.userName,
      productName: data.productName,
      reviewContent: data.reviewContent
    })
  });
}

export async function sendReviewRejectedEmail(data: ReviewEmailData): Promise<void> {
  await resend.emails.send({
    from: 'Nexora <reviews@nexora.com>',
    to: [data.userName],
    subject: 'Review Update: Action Required',
    react: ReviewRejectedEmail({ 
      userName: data.userName,
      productName: data.productName,
      reviewContent: data.reviewContent,
      reason: data.moderatorResponse || ''
    })
  });
}

export async function sendReviewSubmittedEmail(data: ReviewEmailData): Promise<void> {
  await resend.emails.send({
    from: 'Nexora <reviews@nexora.com>',
    to: [data.userName],
    subject: 'Thank You for Your Review!',
    react: ReviewSubmittedEmail({ 
      userName: data.userName,
      productName: data.productName,
      reviewContent: data.reviewContent
    })
  });
}

export async function sendReviewReportedEmail(data: ReviewEmailData): Promise<void> {
  await resend.emails.send({
    from: 'Nexora <reviews@nexora.com>',
    to: ['admin@nexora.com'],
    subject: 'Review Report Received',
    react: ReviewReportedEmail({ 
      userName: data.userName,
      productName: data.productName,
      reviewContent: data.reviewContent,
      reason: data.reportReason || ''
    })
  });
} 