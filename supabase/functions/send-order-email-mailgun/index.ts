// supabase/functions/send-order-email/index.ts
import { serve } from "https://deno.land/std@0.200.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// --- Variables de Entorno ---
const mailgunApiKey = Deno.env.get("MAILGUN_API_KEY")!;
const mailgunDomain = Deno.env.get("MAILGUN_DOMAIN")!; // ej: "barrolimon.com"
const senderEmail   = Deno.env.get("SENDER_EMAIL")!;   // ej: "info@barrolimon.com"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log(`[${new Date().toISOString()}] Order email function invoked: ${req.method}`);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId, customerEmail } = await req.json();
    
    if (!orderId || !customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing orderId or customerEmail' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Obtener datos completos del pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            price,
            product_images (
              url
            )
          )
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generar HTML del email
    const emailHtml = generateOrderEmailHtml(order);

    // Preparar datos para Mailgun
    const formData = new URLSearchParams();
    formData.append('from', `Barro y Limón <${senderEmail}>`);
    formData.append('to', customerEmail);
    formData.append('subject', `Confirmación de Pedido #${order.id.slice(-8)} - Barro y Limón`);
    formData.append('html', emailHtml);

    // Enviar email con Mailgun
    const mailgunResponse = await fetch(`https://api.eu.mailgun.net/v3/${mailgunDomain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
      },
      body: formData
    });

    if (!mailgunResponse.ok) {
      const errorText = await mailgunResponse.text();
      console.error('Mailgun error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Marcar email como enviado en la base de datos
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        email_sent: true, 
        email_sent_at: new Date().toISOString() 
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order email status:', updateError);
      // No fallar por esto, el email ya se envió
    }

    const mailgunResult = await mailgunResponse.json();
    console.log('Email sent successfully:', mailgunResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order confirmation email sent successfully',
        mailgunId: mailgunResult.id 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in send-order-email function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateOrderEmailHtml(order: any): string {
  const orderDate = new Date(order.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const orderItems = order.order_items || [];
  const subtotal = order.subtotal_amount || 0;
  const discount = order.discount_amount || 0;
  const total = order.total_amount || 0;

  const itemsHtml = orderItems.map((item: any) => {
    const product = item.products || {};
    const imageUrl = product.product_images?.[0]?.url || '';
    const itemTotal = item.unit_price * item.quantity;

    return `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 80px; vertical-align: top;">
                ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px;">` : ''}
              </td>
              <td style="padding-left: 15px; vertical-align: top;">
                <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${product.name || 'Producto'}</div>
                <div style="color: #6b7280; font-size: 14px;">Cantidad: ${item.quantity}</div>
                <div style="color: #6b7280; font-size: 14px;">Precio unitario: ${item.unit_price.toFixed(2)}€</div>
              </td>
              <td style="text-align: right; vertical-align: top;">
                <div style="font-weight: 600; color: #1f2937; font-size: 16px;">${itemTotal.toFixed(2)}€</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Pedido - Barro y Limón</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          background-color: #f9fafb;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .content {
          padding: 30px;
        }
        .order-summary {
          background-color: #f3f4f6;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .footer {
          background-color: #1f2937;
          color: white;
          padding: 20px;
          text-align: center;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          background-color: #7c3aed;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          margin: 10px 0;
        }
        .address-section {
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
        }
        .price-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
        }
        .price-row.total {
          font-weight: 600;
          font-size: 18px;
          border-top: 2px solid #e5e7eb;
          padding-top: 12px;
          margin-top: 8px;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .content {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">¡Gracias por tu pedido!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Tu pedido ha sido confirmado y está siendo procesado</p>
        </div>

        <!-- Content -->
        <div class="content">
          <div class="order-summary">
            <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">Resumen del Pedido</h2>
            <p style="margin: 5px 0;"><strong>Número de pedido:</strong> #${order.id.slice(-8)}</p>
            <p style="margin: 5px 0;"><strong>Fecha:</strong> ${orderDate}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${order.email}</p>
          </div>

          <h3 style="color: #1f2937; margin: 25px 0 15px 0;">Información de Envío</h3>
          <div class="address-section">
            <p style="margin: 5px 0; font-weight: 600;">${order.shipping_first_name} ${order.shipping_last_name}</p>
            <p style="margin: 5px 0;">${order.shipping_address_line_1}</p>
            ${order.shipping_address_line_2 ? `<p style="margin: 5px 0;">${order.shipping_address_line_2}</p>` : ''}
            <p style="margin: 5px 0;">${order.shipping_postal_code} ${order.shipping_city}, ${order.shipping_province}</p>
            <p style="margin: 5px 0;">${order.shipping_country}</p>
            <p style="margin: 5px 0;"><strong>Teléfono:</strong> ${order.shipping_phone}</p>
          </div>

          <h3 style="color: #1f2937; margin: 25px 0 15px 0;">Productos Pedidos</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            ${itemsHtml}
          </table>

          <div style="margin-top: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Resumen de Precios</h3>
            <div class="price-row">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}€</span>
            </div>
            ${discount > 0 ? `
              <div class="price-row" style="color: #10b981;">
                <span>Descuento aplicado:</span>
                <span>-${discount.toFixed(2)}€</span>
              </div>
            ` : ''}
            <div class="price-row total">
              <span>Total:</span>
              <span>${total.toFixed(2)}€</span>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 15px 0; color: #6b7280;">¿Tienes alguna pregunta sobre tu pedido?</p>
            <a href="mailto:info@barrolimon.com" class="button">Contactar con Soporte</a>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p style="margin: 0 0 10px 0;"><strong>Barro y Limón</strong></p>
          <p style="margin: 0 0 10px 0;">Joyería artesanal con alma</p>
          <p style="margin: 0;">info@barrolimon.com | www.barrolimon.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
