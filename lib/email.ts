
import { Resend } from "resend";
import type { SkillLevel, Track } from "@/types/database";

const TRACK_LABELS: Record<Track, string> = {
  frontend: "Frontend Development",
  uiux: "UI/UX Design",
  animation: "Animation"
};

const SKILL_LABELS: Record<SkillLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced"
};

const BRAND = {
  deep: "#041a54",
  navy: "#10317d",
  primary: "#214bad",
  bright: "#4b6fef",
  light: "#8ea6e8",
  mist: "#eef4fc",
  text: "#1f2d4d",
  white: "#ffffff"
} as const;

export type WelcomeEmailInput = {
  to: string;
  fullName: string;
  track: Track;
  skillLevel: SkillLevel;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}

/**
 * Builds the branded registration-confirmation email. Uses the official
 * Christ-Core logo (public/logo-transparent.png) referenced by absolute
 * URL so email clients can load it, and only the Christ-Core palette.
 */
function renderWelcomeEmailHtml(input: WelcomeEmailInput): string {
  const name = escapeHtml(input.fullName);
  const email = escapeHtml(input.to);
  const track = TRACK_LABELS[input.track];
  const skillLevel = SKILL_LABELS[input.skillLevel];
  const logoUrl = `${siteUrl()}/logo-transparent.png`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Welcome to the Christ-Core LMS</title>
    <style>
      @media only screen and (max-width: 600px) {
        .cc-body { padding: 24px 20px !important; }
        .cc-header { padding: 28px 20px !important; }
        .cc-footer { padding: 20px !important; }
        .cc-details { padding: 16px !important; }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: ${BRAND.mist}; -webkit-text-size-adjust: 100%;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND.mist}; padding: 24px 0;">
      <tr>
        <td align="center" style="padding: 0 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: ${BRAND.white}; border-radius: 14px; overflow: hidden; border: 1px solid #dbe4f3; font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif;">
            <!-- Header -->
            <tr>
              <td class="cc-header" align="center" style="background: linear-gradient(135deg, ${BRAND.deep} 0%, ${BRAND.navy} 55%, ${BRAND.primary} 100%); padding: 32px 40px;">
                <img src="${logoUrl}" alt="Christ-Core" width="64" height="64" style="display: block; margin: 0 auto 12px; border: 0; outline: none;" />
                <h1 style="margin: 0; color: ${BRAND.white}; font-size: 21px; font-weight: 700; letter-spacing: 0.02em;">Christ-Core Digital Services</h1>
                <p style="margin: 8px 0 0; color: ${BRAND.light}; font-size: 13px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;">Welcome to the Christ-Core LMS</p>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td class="cc-body" style="padding: 32px 40px; color: ${BRAND.text}; font-size: 15px; line-height: 1.65;">
                <p style="margin: 0 0 16px;">Hello <strong>${name}</strong>,</p>
                <p style="margin: 0 0 16px;">Welcome to the Christ-Core LMS!</p>
                <p style="margin: 0 0 16px;">We're excited to have you join us as you begin your journey in <strong>${track}</strong>.</p>
                <p style="margin: 0 0 20px;">Your registration has been successfully completed.</p>

                <p style="margin: 0 0 10px; font-weight: 700; color: ${BRAND.deep};">Registration details</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="cc-details" style="background-color: ${BRAND.mist}; border: 1px solid #dbe4f3; border-radius: 10px; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 12px 18px; border-bottom: 1px solid #dbe4f3; color: #5a6a8c; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;">Name</td>
                    <td align="right" style="padding: 12px 18px; border-bottom: 1px solid #dbe4f3; font-weight: 600; color: ${BRAND.deep};">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 18px; border-bottom: 1px solid #dbe4f3; color: #5a6a8c; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;">Email</td>
                    <td align="right" style="padding: 12px 18px; border-bottom: 1px solid #dbe4f3; font-weight: 600; color: ${BRAND.deep};">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 18px; border-bottom: 1px solid #dbe4f3; color: #5a6a8c; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;">Track</td>
                    <td align="right" style="padding: 12px 18px; border-bottom: 1px solid #dbe4f3; font-weight: 600; color: ${BRAND.deep};">${track}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 18px; color: #5a6a8c; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;">Skill Level</td>
                    <td align="right" style="padding: 12px 18px; font-weight: 600; color: ${BRAND.deep};">${skillLevel}</td>
                  </tr>
                </table>

                <p style="margin: 0 0 16px;">You can now log in to the LMS and access your learning dashboard, tasks, resources, submissions, scores and feedback.</p>
                <p style="margin: 0 0 16px;">We're looking forward to learning and growing with you.</p>
                <p style="margin: 0 0 0; font-weight: 700; color: ${BRAND.primary};">Keep building. Keep learning. Keep growing.</p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td class="cc-footer" align="center" style="background-color: ${BRAND.deep}; padding: 24px 40px;">
                <p style="margin: 0 0 4px; color: ${BRAND.white}; font-size: 14px; font-weight: 600;">Christ-Core Digital Services</p>
                <p style="margin: 0; color: ${BRAND.light}; font-size: 12px; font-style: italic;">&ldquo;Skill. Integrity. Service.&rdquo;</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderWelcomeEmailText(input: WelcomeEmailInput): string {
  return `Hello ${input.fullName},

Welcome to the Christ-Core LMS!

We're excited to have you join us as you begin your journey in ${TRACK_LABELS[input.track]}.

Your registration has been successfully completed.

Registration details:
- Name: ${input.fullName}
- Email: ${input.to}
- Track: ${TRACK_LABELS[input.track]}
- Skill Level: ${SKILL_LABELS[input.skillLevel]}

You can now log in to the LMS and access your learning dashboard, tasks, resources, submissions, scores and feedback.

We're looking forward to learning and growing with you.

Keep building. Keep learning. Keep growing.

Christ-Core Digital Services
"Skill. Integrity. Service."`;
}

/**
 * Sends the branded registration-confirmation email via Resend.
 *
 * Never throws. Returns { ok: true } on success. On failure (or when the
 * provider is not configured) it logs a safe diagnostic and returns
 * { ok: false } so the caller can let registration complete regardless.
 * The recipient address and API key are never logged.
 */
export async function sendWelcomeEmail(input: WelcomeEmailInput): Promise<{ ok: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn("[email] RESEND_API_KEY or EMAIL_FROM is not configured; welcome email skipped.");
    return { ok: false };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [input.to],
      subject: "Welcome to the Christ-Core LMS 🎉",
      html: renderWelcomeEmailHtml(input),
      text: renderWelcomeEmailText(input)
    });

    if (error) {
      console.error("[email] welcome email failed to send", {
        name: error.name,
        message: error.message,
        statusCode: "statusCode" in error ? error.statusCode : undefined
      });
      return { ok: false };
    }

    return { ok: true };
  } catch (err) {
    console.error("[email] unexpected error while sending welcome email", {
      name: err instanceof Error ? err.name : "UnknownError",
      message: err instanceof Error ? err.message : String(err)
    });
    return { ok: false };
  }
}
