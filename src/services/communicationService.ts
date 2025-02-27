
import { supabase } from "@/integrations/supabase/client";

// Communication channel integrations
export const sendEmailMessage = async (to: string, subject: string, content: string): Promise<boolean> => {
  try {
    console.log(`[EMAIL INTEGRATION] Sending email to ${to}: ${subject}`);
    
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject,
        content,
      }
    });
    
    if (error) {
      console.error('Error sending email:', error);
      return false;
    }
    
    console.log('Email sent successfully:', data);
    return true;
  } catch (err) {
    console.error('Error sending email:', err);
    return false;
  }
};

export const sendWhatsAppMessage = async (to: string, content: string): Promise<boolean> => {
  try {
    console.log(`[WHATSAPP INTEGRATION] Sending WhatsApp message to ${to}`);
    
    const { data, error } = await supabase.functions.invoke('send-whatsapp', {
      body: {
        to,
        content,
      }
    });
    
    if (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
    
    console.log('WhatsApp message sent successfully:', data);
    return true;
  } catch (err) {
    console.error('Error sending WhatsApp message:', err);
    return false;
  }
};
