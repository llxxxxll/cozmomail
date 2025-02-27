
import { supabase } from "@/integrations/supabase/client";
import { ResponseTemplate } from '@/data/mockData';
import { dbToResponseTemplate, responseTemplateToDb } from '@/utils/dataAdapters';

// Response Template services
export const fetchResponseTemplates = async () => {
  const { data, error } = await supabase
    .from('response_templates')
    .select('*')
    .order('title');
  
  if (error) {
    console.error('Error fetching response templates:', error);
    throw error;
  }
  
  return data.map(dbToResponseTemplate);
};

export const createResponseTemplate = async (template: Omit<ResponseTemplate, 'id'>) => {
  const dbTemplate = responseTemplateToDb(template);
  
  const { data, error } = await supabase
    .from('response_templates')
    .insert([{ 
      ...dbTemplate,
      user_id: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating response template:', error);
    throw error;
  }
  
  return dbToResponseTemplate(data);
};

export const updateResponseTemplate = async (id: string, updates: Partial<Omit<ResponseTemplate, 'id'>>) => {
  const dbUpdates = responseTemplateToDb(updates);
  
  const { data, error } = await supabase
    .from('response_templates')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating response template:', error);
    throw error;
  }
  
  return dbToResponseTemplate(data);
};

export const deleteResponseTemplate = async (id: string) => {
  const { error } = await supabase
    .from('response_templates')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting response template:', error);
    throw error;
  }
  
  return true;
};
