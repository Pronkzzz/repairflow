// Verstuurt mail/sms rond het hele leven van een afspraak:
//   - Klant: bevestiging (bij "confirmed"), verzetting (datum/tijd wijzigt
//     terwijl de afspraak al bevestigd was) en annulering (bij "cancelled").
//   - Admin: melding zodra een klant een nieuwe afspraak boekt.
//
// Gebruikt Resend (e-mail) en Twilio (sms) via kale fetch-calls, dus er zijn
// geen extra npm-packages nodig. Alles is optioneel: als de bijbehorende
// env-variabelen niet zijn ingevuld, wordt er niets verstuurd maar breekt de
// rest van de app niet. Zet de keys in .env.local (zie .env.example).
//
// BELANGRIJK: elke send-functie hier MOET aangeroepen worden met `await`
// door de caller. Op Vercel (serverless) wordt de function bevroren zodra de
// response terug is — een fire-and-forget call zonder await wordt dan vaak
// halverwege afgebroken en de mail/sms verdwijnt geruisloos.

function formatDate(dateStr) {
  try {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString("nl-BE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function appointmentSummary(appointment) {
  const modelPart = appointment.model?.name ? `${appointment.model.name} — ` : "";
  const servicePart = appointment.service?.name || "je reparatie";
  return `${modelPart}${servicePart} op ${formatDate(appointment.date)} om ${appointment.timeSlot}`;
}

// Generieke e-mail-layout (RepairFlow-huisstijl) — accentkleur en
// vinkje/kruisje-icoon wisselen per soort mail, de rest is gedeeld.
function buildEmailHtml(appointment, { accent, iconBg, iconColor, icon, heading, intro, extraRows = [], footerNote }) {
  const modelLine = appointment.model?.name ? `${appointment.model.name} &mdash; ` : "";
  const serviceLine = appointment.service?.name || "Reparatie";
  const priceLine =
    typeof appointment.service?.priceCents === "number"
      ? `&euro;${(appointment.service.priceCents / 100).toFixed(0)}`
      : null;

  const rows = [
    { label: "Reparatie", value: `${modelLine}${serviceLine}` },
    { label: "Datum &amp; tijd", value: `${formatDate(appointment.date)} om ${appointment.timeSlot}` },
    ...extraRows,
    { label: "Referentie", value: `<span style="font-family:monospace; font-size:13px;">${appointment.id}</span>` },
    ...(priceLine ? [{ label: "Prijs", value: `<span style="color:#1D4ED8; font-weight:700; font-size:16px;">${priceLine}</span>` }] : []),
  ];

  const rowsHtml = rows
    .map(
      (row, i) => `
            <tr>
              <td style="padding:18px 20px; ${i < rows.length - 1 ? "border-bottom:1px solid #E2E8F0;" : ""}">
                <div style="color:#94A3B8; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:4px;">${row.label}</div>
                <div style="color:#0F172A; font-size:15px; font-weight:600;">${row.value}</div>
              </td>
            </tr>`
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0; padding:0;">
  <div style="background:#F5F8FF; padding:32px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" style="max-width:520px; margin:0 auto; border-collapse:collapse;">
      <tr>
        <td style="background:#0F172A; border-radius:20px 20px 0 0; padding:28px 32px;">
          <span style="color:#ffffff; font-size:20px; font-weight:700; letter-spacing:-0.02em;">
            Repair<span style="color:${accent};">Flow</span>
          </span>
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff; padding:36px 32px 8px 32px;">
          <div style="width:52px; height:52px; border-radius:50%; background:${iconBg}; text-align:center; line-height:52px; margin-bottom:20px;">
            <span style="color:${iconColor}; font-size:22px; line-height:52px;">${icon}</span>
          </div>
          <h1 style="margin:0 0 12px 0; color:#0F172A; font-size:22px; font-weight:700; letter-spacing:-0.01em;">
            ${heading}
          </h1>
          <p style="margin:0 0 24px 0; color:#475569; font-size:15px; line-height:1.6;">
            ${intro}
          </p>
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff; padding:0 32px;">
          <table role="presentation" width="100%" style="border-collapse:collapse; border:1px solid #E2E8F0; border-radius:16px; overflow:hidden;">
            ${rowsHtml}
          </table>
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff; padding:28px 32px 36px 32px;">
          <p style="margin:0; color:#475569; font-size:14px; line-height:1.6;">
            ${footerNote}
          </p>
        </td>
      </tr>
      <tr>
        <td style="background:#F5F8FF; border-radius:0 0 20px 20px; padding:24px 32px; text-align:center;">
          <p style="margin:0; color:#94A3B8; font-size:12px; line-height:1.6;">
            RepairFlow · info@repairflow.be · +32 400 00 00 00<br />
            Snelle, transparante reparaties voor je smartphone, tablet en laptop.
          </p>
        </td>
      </tr>
    </table>
  </div>
  </body>
  </html>`;
}

// Kale Resend-call, gedeeld door alle mail-functies hieronder.
async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn(`[notify] RESEND_API_KEY of EMAIL_FROM ontbreekt — mail ("${subject}") niet verstuurd.`);
    return { skipped: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      console.error(`[notify] Resend gaf een foutstatus voor "${subject}":`, res.status, await res.text().catch(() => ""));
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error(`[notify] Versturen van mail ("${subject}") is mislukt:`, err);
    return { ok: false };
  }
}

// Kale Twilio-call, gedeeld door alle sms-functies hieronder.
async function sendSms(to, body) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) {
    console.warn("[notify] Twilio-variabelen ontbreken — sms niet verstuurd.");
    return { skipped: true };
  }

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }),
    });
    if (!res.ok) {
      console.error("[notify] Twilio gaf een foutstatus:", res.status, await res.text().catch(() => ""));
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("[notify] Versturen van sms is mislukt:", err);
    return { ok: false };
  }
}

// --- Klant: bevestiging ------------------------------------------------

export async function sendConfirmationEmail(appointment) {
  const html = buildEmailHtml(appointment, {
    accent: "#3B82F6",
    iconBg: "#ECFDF5",
    iconColor: "#10B981",
    icon: "&#10003;",
    heading: "Je afspraak is bevestigd",
    intro: `Beste ${appointment.customerName},<br />Goed nieuws &mdash; ons team heeft je afspraak bevestigd. Hieronder de details:`,
    footerNote: "Tot dan! Heb je vragen of moet je verzetten? Antwoord gewoon op deze mail of bel ons.",
  });
  return sendEmail({ to: appointment.email, subject: "Je afspraak is bevestigd", html });
}

export async function sendConfirmationSms(appointment) {
  const summary = appointmentSummary(appointment);
  return sendSms(appointment.phone, `RepairFlow: je afspraak is bevestigd — ${summary}. Tot dan!`);
}

// Stuurt beide, elk onafhankelijk — als er eentje niet lukt of niet
// geconfigureerd is, blokkeert dat de andere niet.
export async function sendConfirmationNotifications(appointment) {
  const [emailResult, smsResult] = await Promise.allSettled([
    sendConfirmationEmail(appointment),
    sendConfirmationSms(appointment),
  ]);
  return { emailResult, smsResult };
}

// --- Klant: verzet (datum/tijd gewijzigd op een al-bevestigde afspraak) -

export async function sendRescheduleEmail(appointment, { oldDate, oldTimeSlot }) {
  const html = buildEmailHtml(appointment, {
    accent: "#3B82F6",
    iconBg: "#EFF6FF",
    iconColor: "#2563EB",
    icon: "&#8635;",
    heading: "Je afspraak is verzet",
    intro: `Beste ${appointment.customerName},<br />Je afspraak is verplaatst naar een nieuw moment. Was: <strong>${formatDate(oldDate)} om ${oldTimeSlot}</strong>. De nieuwe gegevens:`,
    footerNote: "Komt dit moment niet uit? Antwoord gewoon op deze mail of bel ons, dan zoeken we iets anders.",
  });
  return sendEmail({ to: appointment.email, subject: "Je afspraak is verzet", html });
}

export async function sendRescheduleSms(appointment) {
  const summary = appointmentSummary(appointment);
  return sendSms(appointment.phone, `RepairFlow: je afspraak is verzet — nieuw moment: ${summary}.`);
}

export async function sendRescheduleNotifications(appointment, oldSlot) {
  const [emailResult, smsResult] = await Promise.allSettled([
    sendRescheduleEmail(appointment, oldSlot),
    sendRescheduleSms(appointment),
  ]);
  return { emailResult, smsResult };
}

// --- Klant: annulering ---------------------------------------------------

export async function sendCancellationEmail(appointment) {
  const html = buildEmailHtml(appointment, {
    accent: "#EF4444",
    iconBg: "#FEF2F2",
    iconColor: "#EF4444",
    icon: "&#10005;",
    heading: "Je afspraak is geannuleerd",
    intro: `Beste ${appointment.customerName},<br />Je afspraak is geannuleerd. Hieronder nog de details ter referentie:`,
    footerNote: "Wil je een nieuwe afspraak inplannen? Dat kan gewoon opnieuw via onze website.",
  });
  return sendEmail({ to: appointment.email, subject: "Je afspraak is geannuleerd", html });
}

export async function sendCancellationSms(appointment) {
  const summary = appointmentSummary(appointment);
  return sendSms(appointment.phone, `RepairFlow: je afspraak (${summary}) is geannuleerd.`);
}

export async function sendCancellationNotifications(appointment) {
  const [emailResult, smsResult] = await Promise.allSettled([
    sendCancellationEmail(appointment),
    sendCancellationSms(appointment),
  ]);
  return { emailResult, smsResult };
}

// --- Admin: nieuwe boeking binnengekomen ---------------------------------

export async function sendAdminNewBookingEmail(appointment) {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;
  if (!to) {
    console.warn("[notify] ADMIN_NOTIFICATION_EMAIL (of ADMIN_EMAIL) ontbreekt — admin-melding niet verstuurd.");
    return { skipped: true };
  }

  const html = buildEmailHtml(appointment, {
    accent: "#3B82F6",
    iconBg: "#EFF6FF",
    iconColor: "#2563EB",
    icon: "&#128276;",
    heading: "Nieuwe afspraak binnengekomen",
    intro: `Er is zonet een nieuwe afspraak geboekt door <strong>${appointment.customerName}</strong> (${appointment.email}, ${appointment.phone}). Status: <strong>${appointment.status}</strong> — controleer en bevestig in het admin-dashboard.`,
    extraRows: [
      { label: "Klant", value: `${appointment.customerName}<br /><span style="font-weight:400; color:#475569;">${appointment.email} · ${appointment.phone}</span>` },
      ...(appointment.notes ? [{ label: "Opmerking", value: `<span style="font-weight:400;">${appointment.notes}</span>` }] : []),
    ],
    footerNote: "Log in op het admin-dashboard om deze afspraak te bevestigen of aan te passen.",
  });
  return sendEmail({ to, subject: `Nieuwe afspraak — ${appointment.customerName}`, html });
}
