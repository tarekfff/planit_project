import nodemailer from 'nodemailer';

// You will need to add these to your .env.local file:
// EMAIL_USER=your-email@gmail.com
// EMAIL_PASS=your-app-password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface AppointmentEmailProps {
  to: string;
  clientName: string;
  serviceName: string;
  establishmentName: string;
  address: string;
  startTime: Date;
}

export async function sendAppointmentConfirmationEmail({
  to,
  clientName,
  serviceName,
  establishmentName,
  address,
  startTime,
}: AppointmentEmailProps) {
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  
  const formattedDate = startTime.toLocaleDateString('fr-FR', dateOptions);
  const formattedTime = startTime.toLocaleTimeString('fr-FR', timeOptions);
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || establishmentName)}`;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f4f7f6;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      padding: 40px 30px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 10px 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
    }
    .greeting {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #1f2937;
    }
    .card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 30px;
    }
    .detail-row {
      margin-bottom: 16px;
    }
    .detail-row:last-child {
      margin-bottom: 0;
    }
    .detail-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .detail-value {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
    }
    .button-container {
      text-align: center;
      margin-top: 30px;
    }
    .button {
      display: inline-block;
      background-color: #4f46e5;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: #4338ca;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 30px;
      text-align: center;
      color: #64748b;
      font-size: 14px;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Rendez-vous Confirmé 🎉</h1>
      <p>Nous avons hâte de vous recevoir !</p>
    </div>
    
    <div class="content">
      <div class="greeting">Bonjour ${clientName},</div>
      <p style="line-height: 1.6; color: #475569; margin-bottom: 24px;">
        Bonne nouvelle ! Votre rendez-vous chez <strong>${establishmentName}</strong> a été accepté par le professionnel.
        Veuillez trouver ci-dessous les détails de votre réservation.
      </p>
      
      <div class="card">
        <div class="detail-row">
          <div class="detail-label">Prestation</div>
          <div class="detail-value">${serviceName}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Date & Heure</div>
          <div class="detail-value">${formattedDate} à ${formattedTime}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Lieu</div>
          <div class="detail-value">${establishmentName}<br><span style="font-size: 14px; color: #475569; font-weight: normal;">${address || 'Adresse non spécifiée'}</span></div>
        </div>
      </div>
      
      <div class="button-container">
        <a href="${mapLink}" class="button" target="_blank">📍 Voir sur Google Maps</a>
      </div>
      
      <p style="line-height: 1.6; color: #475569; margin-top: 30px; font-size: 14px; text-align: center;">
        En cas d'empêchement, merci de nous prévenir à l'avance en modifiant ou en annulant votre rendez-vous depuis votre espace client.
      </p>
    </div>
    
    <div class="footer">
      © ${new Date().getFullYear()} Planit - Votre plateforme de prise de rendez-vous.
    </div>
  </div>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"Planit Notifications" <' + process.env.EMAIL_USER + '>',
      to,
      subject: `✅ Votre rendez-vous chez ${establishmentName} est confirmé`,
      html,
    });
    console.log("Email envoyé: %s", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return { success: false, error };
  }
}
