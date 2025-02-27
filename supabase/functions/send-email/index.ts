
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get API key from environment variable
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.error('RESEND_API_KEY is not set');
    return new Response(
      JSON.stringify({ error: 'Email service is not configured' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  const resend = new Resend(resendApiKey);

  try {
    const { to, subject, content, from, fromName } = await req.json();

    if (!to || !subject || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, or content' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Allow customizing the from address or use a default
    const fromEmail = from || Deno.env.get('DEFAULT_FROM_EMAIL') || 'onboarding@resend.dev';
    const fromDisplayName = fromName || Deno.env.get('DEFAULT_FROM_NAME') || 'CozmoMail';

    // Send the email
    const emailResponse = await resend.emails.send({
      from: `${fromDisplayName} <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: content,
    });

    console.log("Email sending response:", emailResponse);

    return new Response(
      JSON.stringify({ message: 'Email sent successfully', id: emailResponse.id }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
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
