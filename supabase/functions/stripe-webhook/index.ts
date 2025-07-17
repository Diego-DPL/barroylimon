import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Inicializar Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    // Crear cliente de Supabase con service role para operaciones admin
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Obtener el body del webhook
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      throw new Error('No Stripe signature found')
    }

    // Verificar el webhook
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    console.log('Webhook received:', event.type)

    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Actualizar el estado del pedido en la base de datos
        const orderId = paymentIntent.metadata.order_id
        
        if (orderId) {
          const { error } = await supabaseClient
            .from('orders')
            .update({
              status: 'confirmed',
              stripe_payment_intent_id: paymentIntent.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)

          if (error) {
            console.error('Error updating order:', error)
            throw error
          }

          console.log(`Order ${orderId} marked as paid`)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Marcar el pedido como fallido
        const orderId = paymentIntent.metadata.order_id
        
        if (orderId) {
          const { error } = await supabaseClient
            .from('orders')
            .update({
              status: 'cancelled',
              stripe_payment_intent_id: paymentIntent.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)

          if (error) {
            console.error('Error updating failed order:', error)
            throw error
          }

          console.log(`Order ${orderId} marked as failed`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
