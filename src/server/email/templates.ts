/**
 * Transactional email templates. Every message has a plain text body and a
 * simple HTML body built from tables and inline styles, which is what email
 * clients render reliably. Square corners and Aback Blue, like the app.
 *
 * Everything a person typed (names, descriptions) is escaped.
 */

export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

const COLORS = {
  ink: "#0a0a0a",
  mute: "#525252",
  hairline: "#e5e5e5",
  canvas: "#f5f5f5",
  surface: "#ffffff",
  brand: "#005d95",
  brandWash: "#e6f6ff",
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface LayoutInput {
  preheader: string;
  heading: string;
  paragraphs: string[];
  /** Pre-escaped HTML block shown in a tinted panel (a code, an amount). */
  highlight?: string;
  action?: { label: string; url: string };
  footer: string;
  appUrl: string;
}

function layout(input: LayoutInput): string {
  const paragraphs = input.paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:24px;color:${COLORS.ink};">${paragraph}</p>`,
    )
    .join("");
  const highlight = input.highlight
    ? `<div style="margin:8px 0 24px;padding:16px 20px;background:${COLORS.brandWash};border:1px solid #99dbff;">${input.highlight}</div>`
    : "";
  const action = input.action
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="background:${COLORS.brand};">
        <a href="${escapeHtml(input.action.url)}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${escapeHtml(input.action.label)}</a>
      </td></tr></table>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(input.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.canvas};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.canvas};padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${COLORS.surface};border:1px solid ${COLORS.hairline};">
      <tr><td style="padding:20px 28px;border-bottom:1px solid ${COLORS.hairline};">
        <a href="${escapeHtml(input.appUrl)}" style="text-decoration:none;font-size:18px;font-weight:700;letter-spacing:-0.3px;color:${COLORS.ink};">Khata</a>
      </td></tr>
      <tr><td style="padding:28px;">
        <h1 style="margin:0 0 16px;font-size:20px;line-height:28px;font-weight:600;color:${COLORS.ink};">${escapeHtml(input.heading)}</h1>
        ${paragraphs}
        ${highlight}
        ${action}
      </td></tr>
      <tr><td style="padding:16px 28px;border-top:1px solid ${COLORS.hairline};font-size:12px;line-height:18px;color:${COLORS.mute};">
        ${input.footer}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

const SIGN_OFF = "Khata keeps shared expenses fair and simple. It is free and open source, made by Aback.";

export function signInCodeEmail(input: { code: string; appUrl: string }): RenderedEmail {
  const subject = `${input.code} is your Khata sign-in code`;
  const text = [
    `Your Khata sign-in code is ${input.code}`,
    "",
    "Enter it on the sign-in page to continue. The code works once and expires in 10 minutes.",
    "",
    "If you did not try to sign in, you can ignore this email. Nobody can sign in without the code.",
  ].join("\n");
  const html = layout({
    preheader: `Your sign-in code is ${input.code}`,
    heading: "Your sign-in code",
    paragraphs: ["Enter this code on the sign-in page to continue. It works once and expires in 10 minutes."],
    highlight: `<div style="font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:30px;font-weight:700;letter-spacing:8px;color:${COLORS.ink};">${escapeHtml(input.code)}</div>`,
    footer: `If you did not try to sign in, ignore this email. Nobody can sign in without the code.<span style="display:block;margin-top:8px;">${SIGN_OFF}</span>`,
    appUrl: input.appUrl,
  });
  return { subject, text, html };
}

export function addedToGroupEmail(input: {
  inviterName: string;
  groupName: string;
  url: string;
  appUrl: string;
  isNewUser: boolean;
}): RenderedEmail {
  const subject = `${input.inviterName} added you to "${input.groupName}" on Khata`;
  const intro = `${input.inviterName} added you to the group "${input.groupName}" to split shared expenses.`;
  const next = input.isNewUser
    ? "Sign in with this email address to see the group, check balances and add expenses. There is nothing to install and nothing to pay."
    : "Open the group to see the expenses and your balance.";
  const text = [intro, "", next, "", input.url].join("\n");
  const html = layout({
    preheader: intro,
    heading: `You are in "${input.groupName}"`,
    paragraphs: [escapeHtml(intro), escapeHtml(next)],
    action: { label: "Open the group", url: input.url },
    footer: `You get this email because someone added your address to a group on Khata.<span style="display:block;margin-top:8px;">${SIGN_OFF}</span>`,
    appUrl: input.appUrl,
  });
  return { subject, text, html };
}

export function addedAsFriendEmail(input: {
  inviterName: string;
  url: string;
  appUrl: string;
  isNewUser: boolean;
}): RenderedEmail {
  const subject = `${input.inviterName} started a hisab with you on Khata`;
  const intro = `${input.inviterName} wants to keep track of shared expenses with you on Khata.`;
  const next = input.isNewUser
    ? "Sign in with this email address to see what is recorded between the two of you. Only the two of you can see it."
    : "Open Khata to see what is recorded between the two of you. Only the two of you can see it.";
  const text = [intro, "", next, "", input.url].join("\n");
  const html = layout({
    preheader: intro,
    heading: "A new hisab with you",
    paragraphs: [escapeHtml(intro), escapeHtml(next)],
    action: { label: "Open Khata", url: input.url },
    footer: `You get this email because someone added your address on Khata.<span style="display:block;margin-top:8px;">${SIGN_OFF}</span>`,
    appUrl: input.appUrl,
  });
  return { subject, text, html };
}

export function expenseAddedEmail(input: {
  actorName: string;
  description: string;
  total: string;
  yourShare: string | null;
  youPaid: string | null;
  context: string;
  isPrivate: boolean;
  url: string;
  appUrl: string;
  settingsUrl: string;
}): RenderedEmail {
  const subject = `${input.actorName} added "${input.description}" (${input.total})`;
  const lines = [
    `${input.actorName} added "${input.description}" for ${input.total} in ${input.context}.`,
    input.isPrivate ? "This is a private hisab between the two of you. Nobody else in the group can see it." : "",
    input.youPaid ? `You paid ${input.youPaid}.` : "",
    input.yourShare ? `Your share is ${input.yourShare}.` : "",
  ].filter(Boolean);
  const text = [...lines, "", input.url, "", `Turn these emails off: ${input.settingsUrl}`].join("\n");
  const html = layout({
    preheader: lines[0] ?? subject,
    heading: "New expense",
    paragraphs: lines.map(escapeHtml),
    action: { label: "View the expense", url: input.url },
    footer: `You get this email because an expense involves you. <a href="${escapeHtml(input.settingsUrl)}" style="color:${COLORS.brand};">Turn these emails off</a>.<span style="display:block;margin-top:8px;">${SIGN_OFF}</span>`,
    appUrl: input.appUrl,
  });
  return { subject, text, html };
}

export function paymentRecordedEmail(input: {
  actorName: string;
  fromName: string;
  toName: string;
  amount: string;
  context: string;
  url: string;
  appUrl: string;
  settingsUrl: string;
}): RenderedEmail {
  const subject = `${input.fromName} paid ${input.toName} ${input.amount}`;
  const line =
    input.actorName === input.fromName
      ? `${input.fromName} paid ${input.toName} ${input.amount} in ${input.context} and recorded it on Khata.`
      : `${input.actorName} recorded that ${input.fromName} paid ${input.toName} ${input.amount} in ${input.context}.`;
  const text = [line, "", input.url, "", `Turn these emails off: ${input.settingsUrl}`].join("\n");
  const html = layout({
    preheader: line,
    heading: "Payment recorded",
    paragraphs: [escapeHtml(line)],
    action: { label: "See balances", url: input.url },
    footer: `You get this email because a payment involves you. <a href="${escapeHtml(input.settingsUrl)}" style="color:${COLORS.brand};">Turn these emails off</a>.<span style="display:block;margin-top:8px;">${SIGN_OFF}</span>`,
    appUrl: input.appUrl,
  });
  return { subject, text, html };
}

export function reminderEmail(input: {
  fromName: string;
  amount: string;
  url: string;
  upiId: string | null;
  appUrl: string;
}): RenderedEmail {
  const subject = `A friendly reminder from ${input.fromName}`;
  const line = `${input.fromName} sent you a reminder about ${input.amount} on Khata.`;
  const upi = input.upiId ? `You can pay them over UPI at ${input.upiId}.` : "";
  const after = "Once you have paid, record the payment on Khata so the balance is cleared for both of you.";
  const text = [line, upi, after, "", input.url].filter(Boolean).join("\n");
  const html = layout({
    preheader: line,
    heading: "Settle up reminder",
    paragraphs: [escapeHtml(line), ...(upi ? [escapeHtml(upi)] : []), escapeHtml(after)],
    action: { label: "Settle up", url: input.url },
    footer: `You get this email because ${escapeHtml(input.fromName)} sent you a reminder. Reminders are limited to one a day.<span style="display:block;margin-top:8px;">${SIGN_OFF}</span>`,
    appUrl: input.appUrl,
  });
  return { subject, text, html };
}
