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
    formData.append('subject', '¡Bienvenido a Barro y Limón!');
    formData.append('html', `
      <h1>Gracias por suscribirte</h1>
      <p>Te damos la bienvenida a nuestra newsletter de joyería de cerámica.</p>
      <p>Un abrazo,<br/>El equipo de Barro y Limón</p>
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
