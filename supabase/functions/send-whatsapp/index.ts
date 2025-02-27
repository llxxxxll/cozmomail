
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get API keys from environment variables
  const whatsappApiKey = Deno.env.get('WHATSAPP_API_KEY');
  const whatsappPhoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  const whatsappBusinessAccountId = Deno.env.get('WHATSAPP_BUSINESS_ACCOUNT_ID');

  if (!whatsappApiKey || !whatsappPhoneNumberId) {
    console.error('WhatsApp API credentials are not set');
    return new Response(
      JSON.stringify({ error: 'WhatsApp service is not configured' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  try {
    const { to, content } = await req.json();

    if (!to || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to or content' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Format phone number (remove any non-numeric characters)
    const formattedPhone = to.replace(/\D/g, '');

    // WhatsApp API endpoint
    const apiUrl = `https://graph.facebook.com/v13.0/${whatsappPhoneNumberId}/messages`;

    // Request data for WhatsApp API
    const requestData = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: content
      }
    };

    // Send the WhatsApp message
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${whatsappApiKey}`
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`WhatsApp API error: ${JSON.stringify(errorData)}`);
    }

    const responseData = await response.json();
    console.log("WhatsApp sending response:", responseData);

    return new Response(
      JSON.stringify({ message: 'WhatsApp message sent successfully', data: responseData }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
