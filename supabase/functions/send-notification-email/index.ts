const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface EmailRequest {
  to: string;
  type: 'application_received' | 'application_approved' | 'application_rejected' | 'new_application_admin';
  data: any;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, type, data }: EmailRequest = await req.json();
    
    console.log('📧 Envoi email:', { to, type });
    
    // Générer le contenu de l'email selon le type
    let subject = '';
    let htmlContent = '';
    
    switch (type) {
      case 'application_received':
        subject = '✅ Inscription OmnIA.sale reçue - Validation sous 24h';
        htmlContent = generateApplicationReceivedEmail(data);
        break;
      case 'application_approved':
        subject = '🎉 Bienvenue sur OmnIA.sale - Votre compte est activé !';
        htmlContent = generateApplicationApprovedEmail(data);
        break;
      case 'application_rejected':
        subject = '❌ Inscription OmnIA.sale - Informations complémentaires requises';
        htmlContent = generateApplicationRejectedEmail(data);
        break;
      case 'new_application_admin':
        subject = '🔔 Nouvelle demande revendeur OmnIA.sale - Validation requise';
        htmlContent = generateNewApplicationAdminEmail(data);
        break;
      default:
        throw new Error('Type d\'email non supporté');
    }
    
    // Simulation d'envoi d'email (remplacez par votre service d'email)
    console.log('📧 Email simulé envoyé à:', to);
    console.log('📧 Sujet:', subject);
    console.log('📧 Contenu:', htmlContent.substring(0, 100) + '...');
    
    // Ici vous pourriez intégrer un vrai service d'email comme:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Resend
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Email ${type} envoyé à ${to}`,
        email_id: `sim_${Date.now()}`,
        sent_at: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de l\'envoi de l\'email',
        details: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});

function generateApplicationReceivedEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Inscription OmnIA.sale reçue</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0891b2 0%, #1e40af 100%); padding: 30px; border-radius: 20px; text-align: center; margin-bottom: 30px;">
        <!-- Logo OmnIA SVG -->
        <div style="margin-bottom: 20px;">
          <svg width="80" height="80" viewBox="0 0 100 100" style="margin: 0 auto; display: block;">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="20" fill="url(#logoGrad)"/>
            <text x="50" y="35" font-family="Arial,sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">OmnIA</text>
            <text x="50" y="55" font-family="Arial,sans-serif" font-size="10" text-anchor="middle" fill="#bfdbfe">Robot IA</text>
            <circle cx="75" cy="25" r="8" fill="#10b981"/>
          </svg>
        </div>
        <h1 style="color: white; margin: 0; font-size: 28px;">OmnIA.sale</h1>
        <p style="color: #bfdbfe; margin: 10px 0 0 0;">Assistant Robot IA pour Revendeurs Mobilier</p>
      </div>
      
      <h2 style="color: #0891b2;">✅ Inscription reçue avec succès !</h2>
      
      <p>Bonjour <strong>${data.firstName} ${data.lastName}</strong>,</p>
      
      <p>Nous avons bien reçu votre demande d'inscription pour <strong>${data.companyName}</strong> sur la plateforme OmnIA.sale.</p>
      
      <div style="background: #ecfdf5; padding: 20px; border-radius: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #10b981;">📅 Détails de soumission :</h3>
        <ul style="margin: 0;">
          <li><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
          <li><strong>Heure :</strong> ${new Date().toLocaleTimeString('fr-FR')}</li>
          <li><strong>Référence :</strong> #${data.id || Date.now()}</li>
        </ul>
      </div>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 15px; border-left: 4px solid #0891b2; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #0891b2;">📋 Récapitulatif de votre demande :</h3>
        <ul style="margin: 0;">
          <li><strong>Entreprise :</strong> ${data.companyName}</li>
          <li><strong>Plan choisi :</strong> ${(data.selectedPlan || 'professional').charAt(0).toUpperCase() + (data.selectedPlan || 'professional').slice(1)}</li>
          <li><strong>Sous-domaine :</strong> ${(data.companyName || 'boutique').toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)}.omnia.sale</li>
          <li><strong>SIRET :</strong> ${data.siret}</li>
          <li><strong>Email :</strong> ${data.email}</li>
        </ul>
      </div>
      
      <h3 style="color: #0891b2;">⏱️ Prochaines étapes :</h3>
      <ol>
        <li><strong>Validation (24-48h)</strong> : Notre équipe examine votre dossier</li>
        <li><strong>Email de confirmation</strong> : Réception de vos identifiants</li>
        <li><strong>Configuration</strong> : Import de votre catalogue</li>
        <li><strong>Formation</strong> : Prise en main de l'interface</li>
      </ol>
      
      <div style="background: #ecfdf5; padding: 20px; border-radius: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #10b981;">🎁 Pendant l'attente :</h3>
        <ul style="margin: 0;">
          <li>📖 <a href="https://omnia.sale/documentation" style="color: #0891b2;">Consultez la documentation</a></li>
          <li>🎥 <a href="https://omnia.sale/guides" style="color: #0891b2;">Regardez nos tutoriels</a></li>
          <li>🤖 <a href="https://omnia.sale/chat" style="color: #0891b2;">Testez OmnIA en démo</a></li>
        </ul>
      </div>
      
      <p>Une question ? Contactez-nous à <a href="mailto:support@omnia.sale" style="color: #0891b2;">support@omnia.sale</a></p>
      
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          © 2025 OmnIA.sale - Assistant Robot IA pour Revendeurs Mobilier<br>
          <a href="https://omnia.sale" style="color: #0891b2;">omnia.sale</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

function generateApplicationApprovedEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Bienvenue sur OmnIA.sale !</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 20px; text-align: center; margin-bottom: 30px;">
        <!-- Logo OmnIA SVG -->
        <div style="margin-bottom: 20px;">
          <svg width="80" height="80" viewBox="0 0 100 100" style="margin: 0 auto; display: block;">
            <defs>
              <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="20" fill="url(#logoGrad2)"/>
            <text x="50" y="35" font-family="Arial,sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">OmnIA</text>
            <text x="50" y="55" font-family="Arial,sans-serif" font-size="10" text-anchor="middle" fill="#bfdbfe">Robot IA</text>
            <circle cx="75" cy="25" r="8" fill="#10b981"/>
          </svg>
        </div>
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Bienvenue sur OmnIA.sale !</h1>
        <p style="color: #d1fae5; margin: 10px 0 0 0;">Votre compte revendeur est activé</p>
      </div>
      
      <p>Félicitations <strong>${data.firstName}</strong> !</p>
      
      <p>Votre inscription pour <strong>${data.companyName}</strong> a été approuvée. Votre assistant robot IA est maintenant opérationnel !</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #10b981;">🔑 Vos accès :</h3>
        <ul style="margin: 0;">
          <li><strong>Interface Admin :</strong> <a href="https://omnia.sale/admin" style="color: #0891b2;">omnia.sale/admin</a></li>
          <li><strong>Votre domaine :</strong> <a href="https://${(data.companyName || 'boutique').toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)}.omnia.sale" style="color: #0891b2;">${(data.companyName || 'boutique').toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)}.omnia.sale</a></li>
          <li><strong>Email :</strong> ${data.email}</li>
          <li><strong>Mot de passe :</strong> ${data.password || 'Défini lors de l\'inscription'}</li>
          <li><strong>Plan :</strong> ${(data.selectedPlan || 'professional').charAt(0).toUpperCase() + (data.selectedPlan || 'professional').slice(1)}</li>
        </ul>
      </div>
      
      <h3 style="color: #0891b2;">🚀 Prochaines étapes :</h3>
      <ol>
        <li><strong>Connectez-vous</strong> à votre interface admin</li>
        <li><strong>Importez</strong> votre catalogue (CSV/Shopify/XML)</li>
        <li><strong>Personnalisez</strong> OmnIA selon votre marque</li>
        <li><strong>Intégrez</strong> le widget sur votre site</li>
      </ol>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://omnia.sale/admin" style="background: linear-gradient(135deg, #0891b2 0%, #1e40af 100%); color: white; padding: 15px 30px; border-radius: 15px; text-decoration: none; font-weight: bold; display: inline-block;">
          🚀 Accéder à mon interface
        </a>
      </div>
      
      <p>Besoin d'aide ? Notre équipe est là : <a href="mailto:support@omnia.sale" style="color: #0891b2;">support@omnia.sale</a></p>
      
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          © 2025 OmnIA.sale - Assistant Robot IA pour Revendeurs Mobilier
        </p>
      </div>
    </body>
    </html>
  `;
}

function generateApplicationRejectedEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Inscription OmnIA.sale - Informations complémentaires</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 20px; text-align: center; margin-bottom: 30px;">
        <!-- Logo OmnIA SVG -->
        <div style="margin-bottom: 20px;">
          <svg width="80" height="80" viewBox="0 0 100 100" style="margin: 0 auto; display: block;">
            <defs>
              <linearGradient id="logoGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="20" fill="url(#logoGrad3)"/>
            <text x="50" y="35" font-family="Arial,sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">OmnIA</text>
            <text x="50" y="55" font-family="Arial,sans-serif" font-size="10" text-anchor="middle" fill="#bfdbfe">Robot IA</text>
            <circle cx="75" cy="25" r="8" fill="#10b981"/>
          </svg>
        </div>
        <h1 style="color: white; margin: 0; font-size: 28px;">📋 OmnIA.sale</h1>
        <p style="color: #fef3c7; margin: 10px 0 0 0;">Informations complémentaires requises</p>
      </div>
      
      <p>Bonjour <strong>${data.firstName}</strong>,</p>
      
      <p>Merci pour votre intérêt pour OmnIA.sale. Nous avons examiné votre demande d'inscription pour <strong>${data.companyName}</strong>.</p>
      
      <div style="background: #fef3c7; padding: 20px; border-radius: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #d97706;">📝 Informations manquantes :</h3>
        <p style="margin: 0;">${data.rejection_reason || 'Veuillez nous contacter pour plus de détails.'}</p>
      </div>
      
      <p>Pour finaliser votre inscription, veuillez nous envoyer les éléments manquants à <a href="mailto:support@omnia.sale" style="color: #0891b2;">support@omnia.sale</a></p>
      
      <p>Notre équipe vous accompagne dans cette démarche !</p>
      
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          © 2025 OmnIA.sale - Assistant Robot IA pour Revendeurs Mobilier
        </p>
      </div>
    </body>
    </html>
  `;
}

function generateNewApplicationAdminEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nouvelle demande revendeur - OmnIA.sale</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 20px; text-align: center; margin-bottom: 30px;">
        <!-- Logo OmnIA SVG -->
        <div style="margin-bottom: 20px;">
          <svg width="80" height="80" viewBox="0 0 100 100" style="margin: 0 auto; display: block;">
            <defs>
              <linearGradient id="logoGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="20" fill="url(#logoGrad4)"/>
            <text x="50" y="35" font-family="Arial,sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">OmnIA</text>
            <text x="50" y="55" font-family="Arial,sans-serif" font-size="10" text-anchor="middle" fill="#bfdbfe">Robot IA</text>
            <circle cx="75" cy="25" r="8" fill="#10b981"/>
          </svg>
        </div>
        <h1 style="color: white; margin: 0; font-size: 28px;">🔔 Nouvelle Demande Revendeur</h1>
        <p style="color: #fef3c7; margin: 10px 0 0 0;">Validation requise - Super Admin</p>
      </div>
      
      <h2 style="color: #0891b2;">📋 Nouvelle demande d'inscription</h2>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 15px; border-left: 4px solid #0891b2; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #0891b2;">🏢 Informations entreprise :</h3>
        <ul style="margin: 0;">
          <li><strong>Entreprise :</strong> ${data.companyName}</li>
          <li><strong>SIRET :</strong> ${data.siret}</li>
          <li><strong>Adresse :</strong> ${data.address}, ${data.postalCode} ${data.city}</li>
          <li><strong>Pays :</strong> ${data.country}</li>
          <li><strong>Plan choisi :</strong> ${data.selectedPlan.charAt(0).toUpperCase() + data.selectedPlan.slice(1)}</li>
          <li><strong>Sous-domaine :</strong> ${(data.companyName || 'boutique').toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)}.omnia.sale</li>
        </ul>
      </div>
      
      <div style="background: #ecfdf5; padding: 20px; border-radius: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #10b981;">👤 Contact responsable :</h3>
        <ul style="margin: 0;">
          <li><strong>Nom :</strong> ${data.firstName} ${data.lastName}</li>
          <li><strong>Email :</strong> ${data.email}</li>
          <li><strong>Téléphone :</strong> ${data.phone}</li>
          <li><strong>Fonction :</strong> ${data.position}</li>
          <li><strong>Mot de passe :</strong> ${data.password ? '••••••••' : 'Non défini'}</li>
        </ul>
      </div>
      
      ${data.kbisFile ? `
      <div style="background: #fef3c7; padding: 20px; border-radius: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #d97706;">📄 Document Kbis :</h3>
        <p style="margin: 0;">
          <strong>Fichier :</strong> ${data.kbisFile.name} (${(data.kbisFile.size / 1024 / 1024).toFixed(2)} MB)<br>
          <strong>Statut :</strong> En attente de validation
        </p>
      </div>
      ` : ''}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://omnia.sale/admin" style="background: linear-gradient(135deg, #0891b2 0%, #1e40af 100%); color: white; padding: 15px 30px; border-radius: 15px; text-decoration: none; font-weight: bold; display: inline-block; margin-right: 10px;">
          ✅ Valider la demande
        </a>
        <a href="https://omnia.sale/admin" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 15px 30px; border-radius: 15px; text-decoration: none; font-weight: bold; display: inline-block;">
          ❌ Rejeter
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; text-align: center;">
        Connectez-vous à l'interface Super Admin pour traiter cette demande.<br>
        <a href="https://omnia.sale/admin" style="color: #0891b2;">https://omnia.sale/admin</a>
      </p>
      
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          © 2025 OmnIA.sale - Assistant Robot IA pour Revendeurs Mobilier
        </p>
      </div>
    </body>
    </html>
  `;
}