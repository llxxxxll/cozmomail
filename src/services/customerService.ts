
import { supabase } from "@/integrations/supabase/client";
import { Customer } from '@/data/mockData';
import { dbToCustomer, customerToDb } from '@/utils/dataAdapters';

// Customer services
export const fetchCustomers = async () => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
  
  return data.map(dbToCustomer);
};

export const fetchCustomerById = async (id: string) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
  
  return dbToCustomer(data);
};

export const createCustomer = async (customer: Omit<Customer, 'id'>) => {
  const dbCustomer = customerToDb(customer);
  
  const { data, error } = await supabase
    .from('customers')
    .insert([{ 
      ...dbCustomer,
      user_id: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
  
  return dbToCustomer(data);
};

export const updateCustomer = async (id: string, updates: Partial<Customer>) => {
  const dbUpdates = customerToDb(updates);
  
  const { data, error } = await supabase
    .from('customers')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
  
  return dbToCustomer(data);
};

export const deleteCustomer = async (id: string) => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
  
  return true;
};
