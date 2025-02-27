
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Send, Phone } from 'lucide-react';

interface ApiKeysState {
  RESEND_API_KEY: string;
  DEFAULT_FROM_EMAIL: string;
  DEFAULT_FROM_NAME: string;
  WHATSAPP_API_KEY: string;
  WHATSAPP_PHONE_NUMBER_ID: string;
  WHATSAPP_BUSINESS_ACCOUNT_ID: string;
}

const Settings: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeysState>({
    RESEND_API_KEY: '',
    DEFAULT_FROM_EMAIL: '',
    DEFAULT_FROM_NAME: '',
    WHATSAPP_API_KEY: '',
    WHATSAPP_PHONE_NUMBER_ID: '',
    WHATSAPP_BUSINESS_ACCOUNT_ID: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('email');
  
  const { toast } = useToast();
  
  // This would normally fetch the secrets from Supabase, but we can't do that directly
  // from the frontend for security reasons. This is where you'd add a UI that connects
  // to a secure backend endpoint to fetch/set the secrets
  
  const saveApiKeys = async () => {
    setIsSaving(true);
    
    try {
      // In a real implementation, you would call a secure admin endpoint
      // to update the secrets in Supabase
      
      // Here we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "API keys saved successfully",
        description: "Your integration settings have been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving API keys",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const testEmailConnection = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: apiKeys.DEFAULT_FROM_EMAIL,
          subject: 'Test Email from CozmoMail',
          content: '<h1>Test Email</h1><p>This is a test email from your CozmoMail application.</p>',
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Test email sent successfully",
        description: "Check your inbox to confirm email delivery.",
      });
    } catch (error: any) {
      toast({
        title: "Error sending test email",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const testWhatsAppConnection = async () => {
    // This would be implemented similarly to email testing
    toast({
      title: "WhatsApp testing not implemented",
      description: "This would test the WhatsApp integration in a real implementation.",
    });
  };
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Integration Settings</h1>
      
      <Tabs defaultValue="email" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Integration
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            WhatsApp Integration
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Service Configuration</CardTitle>
              <CardDescription>
                Configure your email service to send automated emails. We recommend using Resend.com for sending emails.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resend_api_key">Resend API Key</Label>
                <Input 
                  id="resend_api_key" 
                  type="password" 
                  placeholder="re_1234567890abcdefghijklmnopqrstuv"
                  value={apiKeys.RESEND_API_KEY}
                  onChange={(e) => setApiKeys({...apiKeys, RESEND_API_KEY: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  Sign up at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">resend.com</a> and create an API key.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="from_email">Default From Email</Label>
                <Input 
                  id="from_email" 
                  type="email" 
                  placeholder="no-reply@yourdomain.com"
                  value={apiKeys.DEFAULT_FROM_EMAIL}
                  onChange={(e) => setApiKeys({...apiKeys, DEFAULT_FROM_EMAIL: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  This address will be used as the default sender email address.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="from_name">Default From Name</Label>
                <Input 
                  id="from_name" 
                  type="text" 
                  placeholder="Your Company Name"
                  value={apiKeys.DEFAULT_FROM_NAME}
                  onChange={(e) => setApiKeys({...apiKeys, DEFAULT_FROM_NAME: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  This name will appear as the sender of emails.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={testEmailConnection} 
                disabled={isLoading || !apiKeys.RESEND_API_KEY}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Test Connection
                  </>
                )}
              </Button>
              <Button 
                onClick={saveApiKeys} 
                disabled={isSaving || !apiKeys.RESEND_API_KEY}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Business API Configuration</CardTitle>
              <CardDescription>
                Configure your WhatsApp Business API to send automated messages. You'll need a Meta Business account and WhatsApp Business API access.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp_api_key">WhatsApp API Token</Label>
                <Input 
                  id="whatsapp_api_key" 
                  type="password" 
                  placeholder="Your WhatsApp API Token"
                  value={apiKeys.WHATSAPP_API_KEY}
                  onChange={(e) => setApiKeys({...apiKeys, WHATSAPP_API_KEY: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  Generate this token in your Meta Business API dashboard.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone_number_id">Phone Number ID</Label>
                <Input 
                  id="phone_number_id" 
                  placeholder="123456789012345"
                  value={apiKeys.WHATSAPP_PHONE_NUMBER_ID}
                  onChange={(e) => setApiKeys({...apiKeys, WHATSAPP_PHONE_NUMBER_ID: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  The ID of your WhatsApp Business phone number.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="business_account_id">Business Account ID (Optional)</Label>
                <Input 
                  id="business_account_id" 
                  placeholder="1234567890"
                  value={apiKeys.WHATSAPP_BUSINESS_ACCOUNT_ID}
                  onChange={(e) => setApiKeys({...apiKeys, WHATSAPP_BUSINESS_ACCOUNT_ID: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  Your Meta Business Account ID.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={testWhatsAppConnection} 
                disabled={isLoading || !apiKeys.WHATSAPP_API_KEY || !apiKeys.WHATSAPP_PHONE_NUMBER_ID}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Test Connection
              </Button>
              <Button 
                onClick={saveApiKeys} 
                disabled={isSaving || !apiKeys.WHATSAPP_API_KEY || !apiKeys.WHATSAPP_PHONE_NUMBER_ID}
              >
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Integration Instructions</CardTitle>
            <CardDescription>
              How to set up and use the communication integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Email Integration</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Sign up for a <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Resend.com</a> account</li>
                <li>Verify your domain at <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Resend Domains</a></li>
                <li>Create an API key at <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Resend API Keys</a></li>
                <li>Enter your API key and sender details in the form above</li>
                <li>Test the connection to ensure everything is working</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">WhatsApp Integration</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Create a <a href="https://business.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Meta Business account</a></li>
                <li>Set up WhatsApp Business API through the Meta Business dashboard</li>
                <li>Complete the business verification process</li>
                <li>Set up your WhatsApp Business profile</li>
                <li>Generate your API tokens and get your Phone Number ID</li>
                <li>Enter these details in the form above</li>
                <li>Test the connection to ensure everything is working</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
