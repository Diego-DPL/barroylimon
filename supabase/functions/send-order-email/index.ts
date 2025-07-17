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

    // Obtener emails de administradores
    const { data: adminUsers, error: adminError } = await supabase
      .from('profiles')
      .select(`
        id,
        role,
        auth_users:id (
          email
        )
      `)
      .eq('role', 'admin');

    if (adminError) {
      console.error('Error fetching admin users:', adminError);
    }

    // Extraer emails de administradores (usando RPC como alternativa)
    const { data: adminEmails, error: adminEmailError } = await supabase
      .rpc('get_admin_emails');

    let adminEmailList: string[] = [];
    
    if (adminEmailError) {
      console.error('Error fetching admin emails:', adminEmailError);
      // Fallback: intentar consulta directa
      try {
        const { data: fallbackAdmins } = await supabase
          .from('auth.users')
          .select('email')
          .in('id', adminUsers?.map(admin => admin.id) || []);
        
        adminEmailList = fallbackAdmins?.map(admin => admin.email).filter(Boolean) || [];
      } catch (error) {
        console.error('Fallback admin email query failed:', error);
        adminEmailList = [];
      }
    } else {
      adminEmailList = adminEmails || [];
    }

    // 1. Enviar email de confirmación al cliente
    const customerEmailHtml = generateOrderEmailHtml(order);
    const customerEmailSuccess = await sendEmail({
      to: customerEmail,
      subject: `Confirmación de Pedido #${order.id.slice(-8)} - Barro y Limón`,
      html: customerEmailHtml,
      type: 'customer'
    });

    // 2. Enviar email de notificación a administradores
    let adminEmailSuccess = true;
    if (adminEmailList.length > 0) {
      const adminEmailHtml = generateAdminNotificationEmailHtml(order);
      adminEmailSuccess = await sendEmail({
        to: adminEmailList.join(','),
        subject: `🚨 Nuevo Pedido #${order.id.slice(-8)} - Acción Requerida`,
        html: adminEmailHtml,
        type: 'admin'
      });
    }

    // Función auxiliar para enviar emails
    async function sendEmail({ to, subject, html, type }: { to: string, subject: string, html: string, type: string }) {
      const formData = new URLSearchParams();
      formData.append('from', `Barro y Limón <${senderEmail}>`);
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('html', html);

      const response = await fetch(`https://api.eu.mailgun.net/v3/${mailgunDomain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Mailgun error (${type}):`, errorText);
        return false;
      }

      const result = await response.json();
      console.log(`${type} email sent successfully:`, result);
      return true;
    }

    if (!customerEmailSuccess) {
      return new Response(
        JSON.stringify({ error: 'Failed to send customer confirmation email' }),
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

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Order confirmation email sent to customer${adminEmailList.length > 0 ? ' and admin notification sent' : ''}`,
        customerEmailSent: customerEmailSuccess,
        adminEmailSent: adminEmailSuccess,
        adminCount: adminEmailList.length
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

function generateAdminNotificationEmailHtml(order: any): string {
  const orderDate = new Date(order.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; width: 60px;">
          ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;">` : ''}
        </td>
        <td style="padding: 12px;">
          <div style="font-weight: 600; color: #1f2937;">${product.name || 'Producto'}</div>
          <div style="color: #6b7280; font-size: 14px;">Código: ${product.slug || 'N/A'}</div>
        </td>
        <td style="padding: 12px; text-align: center;">
          <span style="background-color: #ddd6fe; color: #7c3aed; padding: 4px 8px; border-radius: 4px; font-weight: 600;">${item.quantity}</span>
        </td>
        <td style="padding: 12px; text-align: right;">
          <div>${item.unit_price.toFixed(2)}€</div>
        </td>
        <td style="padding: 12px; text-align: right;">
          <div style="font-weight: 600;">${itemTotal.toFixed(2)}€</div>
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
      <title>🚨 Nuevo Pedido - Acción Requerida</title>
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
          max-width: 700px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
          color: white;
          padding: 25px;
          text-align: center;
        }
        .urgent-badge {
          background-color: rgba(255, 255, 255, 0.2);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 10px;
          display: inline-block;
        }
        .content {
          padding: 30px;
        }
        .alert-box {
          background-color: #fef2f2;
          border-left: 4px solid #dc2626;
          padding: 15px;
          margin: 20px 0;
          border-radius: 6px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }
        .info-section {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .info-section h4 {
          margin: 0 0 10px 0;
          color: #7c3aed;
          font-size: 16px;
        }
        .price-summary {
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
        }
        .action-buttons {
          text-align: center;
          margin: 30px 0;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          margin: 5px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s;
        }
        .btn-primary {
          background-color: #7c3aed;
          color: white;
        }
        .btn-secondary {
          background-color: #6b7280;
          color: white;
        }
        .btn:hover {
          transform: translateY(-2px);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        th {
          background-color: #f3f4f6;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }
        @media (max-width: 600px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
          .container {
            margin: 0;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="urgent-badge">🚨 ACCIÓN REQUERIDA</div>
          <h1 style="margin: 0; font-size: 26px;">Nuevo Pedido Recibido</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Un cliente ha realizado un pedido y está esperando confirmación</p>
        </div>

        <!-- Content -->
        <div class="content">
          <div class="alert-box">
            <h3 style="margin: 0 0 8px 0; color: #dc2626;">⏰ Tiempo de respuesta crítico</h3>
            <p style="margin: 0; color: #7f1d1d;">Este pedido requiere procesamiento inmediato. El cliente está esperando confirmación.</p>
          </div>

          <!-- Información del Pedido -->
          <div class="info-grid">
            <div class="info-section">
              <h4>📋 Datos del Pedido</h4>
              <p style="margin: 5px 0;"><strong>ID:</strong> #${order.id.slice(-8)}</p>
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${orderDate}</p>
              <p style="margin: 5px 0;"><strong>Estado:</strong> 
                <span style="background-color: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                  ${order.status || 'PENDIENTE'}
                </span>
              </p>
            </div>

            <div class="info-section">
              <h4>👤 Datos del Cliente</h4>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${order.email}</p>
              <p style="margin: 5px 0;"><strong>Nombre:</strong> ${order.shipping_first_name} ${order.shipping_last_name}</p>
              <p style="margin: 5px 0;"><strong>Teléfono:</strong> ${order.shipping_phone}</p>
            </div>
          </div>

          <!-- Información de Envío -->
          <div class="info-section" style="margin: 20px 0;">
            <h4>📦 Dirección de Envío</h4>
            <p style="margin: 5px 0; line-height: 1.4;">
              ${order.shipping_first_name} ${order.shipping_last_name}<br>
              ${order.shipping_address_line_1}<br>
              ${order.shipping_address_line_2 ? `${order.shipping_address_line_2}<br>` : ''}
              ${order.shipping_postal_code} ${order.shipping_city}, ${order.shipping_province}<br>
              ${order.shipping_country}<br>
              <strong>Tel:</strong> ${order.shipping_phone}
            </p>
          </div>

          <!-- Productos -->
          <h3 style="color: #1f2937; margin: 25px 0 15px 0;">🛍️ Productos del Pedido</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 60px;">Imagen</th>
                <th>Producto</th>
                <th style="text-align: center; width: 80px;">Cantidad</th>
                <th style="text-align: right; width: 100px;">Precio Unit.</th>
                <th style="text-align: right; width: 100px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Resumen de Precios -->
          <div class="price-summary">
            <h4 style="margin: 0 0 15px 0; color: #059669;">💰 Resumen Financiero</h4>
            <div style="display: flex; justify-content: space-between; margin: 8px 0;">
              <span>Subtotal:</span>
              <span style="font-weight: 600;">${subtotal.toFixed(2)}€</span>
            </div>
            ${discount > 0 ? `
              <div style="display: flex; justify-content: space-between; margin: 8px 0; color: #059669;">
                <span>Descuento aplicado:</span>
                <span style="font-weight: 600;">-${discount.toFixed(2)}€</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin: 15px 0 0 0; padding-top: 12px; border-top: 2px solid #d1fae5; font-size: 18px;">
              <span style="font-weight: 700;">TOTAL A COBRAR:</span>
              <span style="font-weight: 700; color: #059669;">${total.toFixed(2)}€</span>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="action-buttons">
            <h3 style="color: #1f2937; margin: 0 0 20px 0;">🎯 Acciones Requeridas</h3>
            <a href="mailto:${order.email}?subject=Confirmación de Pedido #${order.id.slice(-8)}" class="btn btn-primary">
              ✉️ Contactar Cliente
            </a>
            <a href="#" class="btn btn-secondary">
              🎛️ Ver en Panel Admin
            </a>
          </div>

          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 15px; margin: 25px 0;">
            <h4 style="margin: 0 0 10px 0; color: #1d4ed8;">📝 Próximos Pasos</h4>
            <ol style="margin: 0; padding-left: 20px; color: #1e40af;">
              <li>Verificar disponibilidad de stock</li>
              <li>Confirmar dirección de envío</li>
              <li>Procesar el pago (si no está automatizado)</li>
              <li>Preparar el pedido para envío</li>
              <li>Actualizar estado a "Confirmado" en el sistema</li>
            </ol>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0 0 10px 0; font-weight: 600;">Panel de Administración - Barro y Limón</p>
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">Este email fue generado automáticamente al recibir un nuevo pedido</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
