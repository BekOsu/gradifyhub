type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

const BASE_URL = "https://gradifyhub.com";

function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GradifyHub</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background-color:#0a0a0a;padding:24px 32px;">
              <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">GradifyHub</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #e4e4e7;">
              <p style="margin:0;font-size:12px;color:#71717a;line-height:1.5;">
                You received this email because you have an account on GradifyHub.<br />
                <a href="${BASE_URL}" style="color:#71717a;text-decoration:underline;">gradifyhub.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:24px;padding:12px 24px;background-color:#22c55e;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">${label}</a>`;
}

export function welcomeDiscountEmail({ name, couponCode, discountPct }: { name: string; couponCode: string; discountPct: number }): EmailTemplate {
  return {
    subject: `🎉 ${discountPct}% off — your early-access gift, ${name}`,
    html: layout(`
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0a0a0a;">You're in early. Here's your reward.</h2>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#444;">
        As one of our first users, you get <strong>${discountPct}% off</strong> your first month of Pro — forever as long as you stay subscribed.
      </p>
      <div style="background:#f4f4f5;border-radius:8px;padding:20px 24px;margin:24px 0;text-align:center;">
        <p style="margin:0 0 6px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.05em;">Your coupon code</p>
        <p style="margin:0;font-size:28px;font-weight:800;font-family:monospace;color:#0a0a0a;letter-spacing:0.1em;">${couponCode}</p>
      </div>
      <p style="margin:0 0 24px;font-size:14px;color:#888;">
        Use it on the <a href="https://gradifyhub.com/pricing" style="color:#0a0a0a;">pricing page</a> before checkout. Expires in 30 days.
      </p>
      <a href="https://gradifyhub.com/pricing" style="display:inline-block;background-color:#0a0a0a;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:99px;font-size:14px;font-weight:600;">Claim your discount →</a>
    `),
    text: `You're one of our first users — here's ${discountPct}% off your first month!\n\nCoupon code: ${couponCode}\n\nUse it at https://gradifyhub.com/pricing. Expires in 30 days.`,
  };
}

export function welcomeEmail({ name }: { name: string }): EmailTemplate {
  const greeting = name.trim() ? name.trim() : "there";
  const subject = "Welcome to GradifyHub";

  const html = layout(`
    <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#0a0a0a;line-height:1.3;">Welcome, ${greeting}.</h1>
    <p style="margin:0 0 16px 0;font-size:15px;color:#3f3f46;line-height:1.6;">
      You've joined GradifyHub — the AI-powered career platform built to take you from where you are today to your first AI engineering role.
    </p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#3f3f46;line-height:1.6;">
      Your first step is the Assessment. It takes about 5 minutes and gives us the data we need to build a personalised Roadmap just for you.
    </p>
    ${ctaButton("Start your Assessment", `${BASE_URL}/assessment`)}
    <p style="margin:24px 0 0 0;font-size:13px;color:#71717a;line-height:1.5;">
      If you have any questions, reply to this email — we read every message.
    </p>
  `);

  const text = `Welcome to GradifyHub, ${greeting}.\n\nYour first step is the Assessment. It takes about 5 minutes and personalises your entire learning path.\n\nStart here: ${BASE_URL}/assessment\n\nIf you have any questions, reply to this email — we read every message.`;

  return { subject, html, text };
}

export function assessmentCompleteEmail({
  name,
  topSkill,
  nextStep,
}: {
  name: string;
  topSkill: string;
  nextStep: string;
}): EmailTemplate {
  const greeting = name.trim() ? name.trim() : "there";
  const subject = "Your GradifyHub Assessment results are ready";

  const html = layout(`
    <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#0a0a0a;line-height:1.3;">Assessment complete, ${greeting}.</h1>
    <p style="margin:0 0 16px 0;font-size:15px;color:#3f3f46;line-height:1.6;">
      You finished your Assessment. Here's what we found.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
      <tr>
        <td style="padding:16px;background-color:#f0fdf4;border-radius:6px;border-left:3px solid #22c55e;">
          <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#16a34a;">Top skill</p>
          <p style="margin:0;font-size:16px;font-weight:600;color:#0a0a0a;">${topSkill}</p>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
      <tr>
        <td style="padding:16px;background-color:#f9f9f9;border-radius:6px;">
          <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#71717a;">Next step</p>
          <p style="margin:0;font-size:15px;color:#3f3f46;line-height:1.5;">${nextStep}</p>
        </td>
      </tr>
    </table>
    <p style="margin:16px 0 0 0;font-size:15px;color:#3f3f46;line-height:1.6;">
      Your personalised Roadmap is waiting. Open it to see your learning path broken down week by week.
    </p>
    ${ctaButton("View my Roadmap", `${BASE_URL}/roadmap`)}
  `);

  const text = `Assessment complete, ${greeting}.\n\nTop skill: ${topSkill}\nNext step: ${nextStep}\n\nYour personalised Roadmap is waiting: ${BASE_URL}/roadmap`;

  return { subject, html, text };
}

export function paymentSuccessEmail({
  name,
}: {
  name: string;
}): EmailTemplate {
  const greeting = name.trim() ? name.trim() : "there";
  const planLabel = "Pro";
  const subject = `You're now on GradifyHub ${planLabel}`;

  const features = [
    "Unlimited quizzes and lessons",
    "Unlimited AI tutor sessions",
    "Advanced Roadmap generation",
    "Mock interviews",
    "Resume builder with AI feedback",
  ];

  const featureRows = features
    .map(
      (f) =>
        `<tr><td style="padding:6px 0;font-size:14px;color:#3f3f46;line-height:1.5;"><span style="color:#22c55e;font-weight:700;margin-right:8px;">&#10003;</span>${f}</td></tr>`
    )
    .join("\n");

  const html = layout(`
    <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#0a0a0a;line-height:1.3;">You're on ${planLabel}, ${greeting}.</h1>
    <p style="margin:0 0 24px 0;font-size:15px;color:#3f3f46;line-height:1.6;">
      Your upgrade is active. Here's what you now have access to:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
      ${featureRows}
    </table>
    <p style="margin:16px 0 0 0;font-size:15px;color:#3f3f46;line-height:1.6;">
      Head to your dashboard to pick up where you left off.
    </p>
    ${ctaButton("Go to dashboard", `${BASE_URL}/dashboard`)}
    <p style="margin:24px 0 0 0;font-size:13px;color:#71717a;line-height:1.5;">
      Questions about your plan? Reply to this email and we'll sort it out.
    </p>
  `);

  const text = `You're on GradifyHub ${planLabel}, ${greeting}.\n\nYour upgrade is active. What you now have access to:\n${features.map((f) => `- ${f}`).join("\n")}\n\nGo to your dashboard: ${BASE_URL}/dashboard`;

  return { subject, html, text };
}

export function streakReminderEmail({
  name,
  streak,
}: {
  name: string;
  streak: number;
}): EmailTemplate {
  const greeting = name.trim() ? name.trim() : "there";
  const subject = `Don't break your ${streak}-day streak`;

  const html = layout(`
    <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#0a0a0a;line-height:1.3;">You're on a ${streak}-day streak, ${greeting}.</h1>
    <p style="margin:0 0 16px 0;font-size:15px;color:#3f3f46;line-height:1.6;">
      Don't let it end tonight. Consistent daily practice is the single biggest predictor of career progress — and you've built something worth protecting.
    </p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#3f3f46;line-height:1.6;">
      Even one lesson keeps your streak alive. It takes 10 minutes.
    </p>
    ${ctaButton("Continue learning", `${BASE_URL}/learn`)}
  `);

  const text = `You're on a ${streak}-day streak, ${greeting}.\n\nDon't let it end tonight. Even one lesson keeps your streak alive — it takes 10 minutes.\n\nContinue here: ${BASE_URL}/learn`;

  return { subject, html, text };
}
