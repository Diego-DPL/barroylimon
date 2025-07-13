// supabase/functions/send-welcome/index.ts
import { serve } from "https://deno.land/std@0.200.0/http/server.ts";

// --- Variables de Entorno ---
// Deberás configurar estos secrets en tu proyecto de Supabase
const mailgunApiKey = Deno.env.get("MAILGUN_API_KEY")!;
const mailgunDomain = Deno.env.get("MAILGUN_DOMAIN")!; // ej: "barrolimon.com"
const senderEmail   = Deno.env.get("SENDER_EMAIL")!;   // ej: "info@barrolimon.com"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log(`[${new Date().toISOString()}] Function invoked: ${req.method}`);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: "Email es requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Payload para Mailgun (form-urlencoded) ---
    const formData = new URLSearchParams();
    formData.append('from', `Barro y Limón <${senderEmail}>`);
    formData.append('to', email);
    formData.append('subject', '¡Bienvenido a la familia Barro y Limón!');
    formData.append('html', `
      <!DOCTYPE html>
      <html lang="es">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenido a Barro y Limón</title>
      <style>
        body {
        font-family: 'Georgia', serif;
        line-height: 1.6;
        color: #5a4a3a;
        background-color: #faf9f7;
        margin: 0;
        padding: 0;
        }
        .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
        background: linear-gradient(135deg, #8b7355 0%, #a68b5b 100%);
        color: white;
        padding: 40px 30px;
        text-align: center;
        }
        .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 300;
        letter-spacing: 2px;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }
        .content {
        padding: 40px 30px;
        }
        .welcome-text {
        font-size: 18px;
        color: #6b5b4a;
        margin-bottom: 20px;
        }
        .message {
        font-size: 16px;
        line-height: 1.8;
        margin-bottom: 20px;
        color: #5a4a3a;
        }
        .highlight {
        background-color: #f5f3f0;
        padding: 20px;
        border-left: 4px solid #8b7355;
        margin: 25px 0;
        font-style: italic;
        }
        .signature {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e8e6e3;
        color: #8b7355;
        font-size: 14px;
        }
        .footer {
        background-color: #f5f3f0;
        padding: 20px 30px;
        text-align: center;
        font-size: 12px;
        color: #8b7355;
        }
      </style>
      </head>
      <body>
      <div class="container">
        <div class="header">
        <h1>BARRO Y LIMÓN</h1>
        </div>
        
        <div class="content">
        <p class="welcome-text">¡Qué alegría tenerte aquí!</p>
        
        <p class="message">
          Te damos la más cálida bienvenida a nuestra comunidad de amantes de la cerámica artesanal. 
          Al unirte a nosotros, no solo te suscribes a una newsletter, sino que te conviertes en parte 
          de una familia que celebra la belleza de lo hecho a mano.
        </p>
        
        <div class="highlight">
          "Cada pieza que creamos lleva consigo el alma de la tradición y la pasión por el arte 
          que perdura en el tiempo."
        </div>
        
        <p class="message">
          En las próximas comunicaciones, compartiremos contigo:
        </p>
        
        <ul style="color: #5a4a3a; line-height: 1.8;">
          <li>Nuevas colecciones exclusivas de joyería cerámica</li>
          <li>Historias detrás de cada pieza artesanal</li>
          <li>Consejos de cuidado para tus joyas favoritas</li>
          <li>Acceso anticipado a ofertas especiales</li>
          <li>Inspiración sobre el arte cerámico tradicional</li>
        </ul>
        
        <p class="message">
          Esperamos que disfrutes de este viaje junto a nosotros, donde cada creación es única 
          y cada historia vale la pena ser contada.
        </p>
        
        <div class="signature">
          <p>Con cariño y gratitud,</p>
          <p><strong>El equipo de Barro y Limón</strong></p>
          <p><em>Creando belleza desde la tradición</em></p>
        </div>
        </div>
        
        <div class="footer">
        <p>Barro y Limón • Joyería Artesanal de Cerámica</p>
        <p>Donde cada pieza cuenta una historia única</p>
        </div>
      </div>
      </body>
      </html>
    `);

    // --- Llamada a la API de Mailgun ---
    const mailgunResp = await fetch(`https://api.eu.mailgun.net/v3/${mailgunDomain}/messages`, {
      method: 'POST',
      headers: {
        // Mailgun usa Basic Auth con 'api' como usuario y la API key como contraseña
        'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
      },
      body: formData,
    });

    const responseData = await mailgunResp.json();

    if (!mailgunResp.ok) {
      console.error("Mailgun API error:", responseData);
      return new Response(JSON.stringify({ error: "Error al enviar el correo" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[${new Date().toISOString()}] Email sent via Mailgun to: ${email}. Response:`, responseData);
    return new Response(JSON.stringify({ message: "Email enviado correctamente" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error(`[${new Date().toISOString()}] Internal function error:`, e);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
