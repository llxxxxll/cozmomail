
import { supabase } from "@/integrations/supabase/client";

// Statistics
export const getMessageStats = async () => {
  // Get unread message count
  const { count: unreadCount, error: unreadError } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);
  
  if (unreadError) {
    console.error('Error fetching unread count:', unreadError);
    throw unreadError;
  }
  
  // Get unanswered message count
  const { count: unansweredCount, error: unansweredError } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('is_replied', false);
  
  if (unansweredError) {
    console.error('Error fetching unanswered count:', unansweredError);
    throw unansweredError;
  }
  
  // Get channel distribution - we'll need to use SQL query for this
  const { data: channelData, error: channelError } = await supabase
    .rpc('get_channel_distribution');
  
  if (channelError) {
    console.error('Error fetching channel stats:', channelError);
    throw channelError;
  }
  
  // Get category distribution - we'll need to use SQL query for this
  const { data: categoryData, error: categoryError } = await supabase
    .rpc('get_category_distribution');
  
  if (categoryError) {
    console.error('Error fetching category stats:', categoryError);
    throw categoryError;
  }
  
  return {
    unreadCount: unreadCount || 0,
    unansweredCount: unansweredCount || 0,
    channelDistribution: channelData || [],
    categoryDistribution: categoryData || []
  };
};
