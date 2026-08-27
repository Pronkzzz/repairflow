// Verstuurt bevestigingsmail + sms zodra een afspraak op "confirmed" wordt gezet.
//
// Gebruikt Resend (e-mail) en Twilio (sms) via kale fetch-calls, dus er zijn
// geen extra npm-packages nodig. Beide zijn optioneel: als de bijbehorende
// env-variabelen niet zijn ingevuld, wordt er niets verstuurd maar breekt de
// rest van de app niet. Zet de keys in .env.local (zie .env.example).

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

function buildEmailHtml(appointment) {
  const summary = appointmentSummary(appointment);
  const modelLine = appointment.model?.name ? `${appointment.model.name} &mdash; ` : "";
  const serviceLine = appointment.service?.name || "Reparatie";
  const priceLine =
    typeof appointment.service?.priceCents === "number"
      ? `&euro;${(appointment.service.priceCents / 100).toFixed(0)}`
      : null;

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
            Repair<span style="color:#3B82F6;">Flow</span>
          </span>
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff; padding:36px 32px 8px 32px;">
          <div style="width:52px; height:52px; border-radius:50%; background:#ECFDF5; text-align:center; line-height:52px; margin-bottom:20px;">
            <span style="color:#10B981; font-size:22px; line-height:52px;">&#10003;</span>
          </div>
          <h1 style="margin:0 0 12px 0; color:#0F172A; font-size:22px; font-weight:700; letter-spacing:-0.01em;">
            Je afspraak is bevestigd
          </h1>
          <p style="margin:0 0 24px 0; color:#475569; font-size:15px; line-height:1.6;">
            Beste ${appointment.customerName},<br />
            Goed nieuws &mdash; ons team heeft je afspraak bevestigd. Hieronder de details:
          </p>
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff; padding:0 32px;">
          <table role="presentation" width="100%" style="border-collapse:collapse; border:1px solid #E2E8F0; border-radius:16px; overflow:hidden;">
            <tr>
              <td style="padding:18px 20px; border-bottom:1px solid #E2E8F0;">
                <div style="color:#94A3B8; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:4px;">Reparatie</div>
                <div style="color:#0F172A; font-size:15px; font-weight:600;">${modelLine}${serviceLine}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 20px; border-bottom:1px solid #E2E8F0;">
                <div style="color:#94A3B8; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:4px;">Datum &amp; tijd</div>
                <div style="color:#0F172A; font-size:15px; font-weight:600;">${formatDate(appointment.date)} om ${appointment.timeSlot}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 20px; ${priceLine ? "border-bottom:1px solid #E2E8F0;" : ""}">
                <div style="color:#94A3B8; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:4px;">Referentie</div>
                <div style="color:#0F172A; font-size:13px; font-family:monospace;">${appointment.id}</div>
              </td>
            </tr>
            ${
              priceLine
                ? `<tr>
              <td style="padding:18px 20px;">
                <div style="color:#94A3B8; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:4px;">Prijs</div>
                <div style="color:#1D4ED8; font-size:16px; font-weight:700;">${priceLine}</div>
              </td>
            </tr>`
                : ""
            }
          </table>
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff; padding:28px 32px 36px 32px;">
          <p style="margin:0; color:#475569; font-size:14px; line-height:1.6;">
            Tot dan! Heb je vragen of moet je verzetten? Antwoord gewoon op deze mail of bel ons.
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

export async function sendConfirmationEmail(appointment) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn("[notify] RESEND_API_KEY of EMAIL_FROM ontbreekt — bevestigingsmail niet verstuurd.");
    return { skipped: true };
  }

  const html = buildEmailHtml(appointment);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: appointment.email,
        subject: "Je afspraak is bevestigd",
        html,
      }),
    });
    if (!res.ok) {
      console.error("[notify] Resend gaf een foutstatus:", res.status, await res.text().catch(() => ""));
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("[notify] Versturen van bevestigingsmail is mislukt:", err);
    return { ok: false };
  }
}

export async function sendConfirmationSms(appointment) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) {
    console.warn("[notify] Twilio-variabelen ontbreken — bevestigings-sms niet verstuurd.");
    return { skipped: true };
  }

  const summary = appointmentSummary(appointment);
  const body = `RepairFlow: je afspraak is bevestigd — ${summary}. Tot dan!`;

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: appointment.phone, From: from, Body: body }),
      }
    );
    if (!res.ok) {
      console.error("[notify] Twilio gaf een foutstatus:", res.status, await res.text().catch(() => ""));
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("[notify] Versturen van bevestigings-sms is mislukt:", err);
    return { ok: false };
  }
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
