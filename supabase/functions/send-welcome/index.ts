// supabase/functions/send-welcome/index.ts
import { serve } from "https://deno.land/std@0.200.0/http/server.ts";

// Estas variables las cargas en Edge Functions → Secrets
const tenantId     = Deno.env.get("AZURE_TENANT_ID")!;
const clientId     = Deno.env.get("AZURE_CLIENT_ID")!;
const clientSecret = Deno.env.get("AZURE_CLIENT_SECRET")!;
const senderEmail  = Deno.env.get("SENDER_EMAIL")!;

/**
 * Obtiene un token OAuth2 mediante el flujo Client Credentials
 */
async function getToken(): Promise<string> {
  const params = new URLSearchParams({
    client_id:     clientId,
    scope:         "https://graph.microsoft.com/.default",
    client_secret: clientSecret,
    grant_type:    "client_credentials",
  });

  const resp = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    { method: "POST", body: params }
  );

  const json = await resp.json();
  if (!resp.ok) {
    console.error("Token error:", json);
    throw new Error(`Token request failed: ${JSON.stringify(json)}`);
  }

  return json.access_token;
}

serve(async (req) => {
  try {
    // 1) Lee el email del body
    const { email } = (await req.json()) as { email: string };

    // 2) Obtiene un token válido
    const token = await getToken();

    // 3) Prepara el payload para enviar con Microsoft Graph
    const mailPayload = {
      message: {
        subject: "¡Bienvenido a Barro y Limón!",
        body: {
          contentType: "HTML",
          content: `
            <h1>Gracias por suscribirte</h1>
            <p>Hola,</p>
            <p>¡Te damos la bienvenida a nuestra newsletter de joyería de cerámica!</p>
            <p>Un abrazo,<br/>El equipo de Barro y Limón</p>
          `,
        },
        toRecipients: [
          { emailAddress: { address: email } }
        ],
        from: { emailAddress: { address: senderEmail } }
      },
      saveToSentItems: false
    };

    // 4) Llama al endpoint sendMail de Graph API
    const graphResp = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(senderEmail)}/sendMail`,
      {
        method:  "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type":  "application/json"
        },
        body: JSON.stringify(mailPayload)
      }
    );

    if (!graphResp.ok) {
      const errText = await graphResp.text();
      console.error("Graph SendMail error:", errText);
      return new Response("Error enviando correo", { status: 502 });
    }

    // 5) Respuesta exitosa
    return new Response("Email enviado", { status: 200 });

  } catch (e) {
    console.error("Error interno en la Function:", e);
    return new Response("Error interno", { status: 500 });
  }
});
