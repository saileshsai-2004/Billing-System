import nodemailer from "nodemailer";

type SendMailInput = {
  email: string;
  studentName: string;
  courseName: string;
  billNumber: string;
  invoiceDate?: Date;
  grandTotal: number;
  pdf: Buffer;
};

export function isMailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.MAIL_FROM
  );
}

export async function sendBillEmail(input: SendMailInput) {
  if (!isMailConfigured()) {
    throw new Error("SMTP is not configured");
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const formattedDate = input.invoiceDate ? new Date(input.invoiceDate).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN");
  const formattedAmount = input.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 });
  const safeFilename = `${input.billNumber.replace(/[\/\\]/g, "_")}.pdf`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: input.email,
    subject: `Adyapan Tax Invoice - ${input.billNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
        <h2 style="color: #0f172a; margin-top: 0;">Dear ${input.studentName},</h2>
        <p>Thank you for choosing Adyapan.</p>
        <p>Please find attached your official tax invoice for:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Course:</td>
            <td style="padding: 8px 0; font-weight: bold;">${input.courseName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Invoice Number:</td>
            <td style="padding: 8px 0; font-weight: bold;">${input.billNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Invoice Date:</td>
            <td style="padding: 8px 0;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Total Amount:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">₹${formattedAmount}</td>
          </tr>
        </table>
        <p>Please retain this invoice for your records.</p>
        <br />
        <p style="margin-bottom: 0;">Regards,<br/><strong>Adyapan Billing Team</strong></p>
      </div>
    `,
    attachments: [
      {
        filename: safeFilename,
        content: input.pdf,
        contentType: "application/pdf",
      },
    ],
  });
}
