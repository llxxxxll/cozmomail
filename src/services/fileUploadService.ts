
import { supabase } from "@/integrations/supabase/client";

export const uploadAttachment = async (file: File, messageId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${messageId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('message_attachments')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  // Save attachment record in the attachments table
  const { error: dbError } = await supabase
    .from('attachments')
    .insert({
      message_id: messageId,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      file_type: file.type,
      user_id: (await supabase.auth.getUser()).data.user?.id
    });

  if (dbError) {
    console.error('Error saving attachment record:', dbError);
    // Try to delete the uploaded file if we couldn't save the record
    await supabase.storage.from('message_attachments').remove([filePath]);
    throw dbError;
  }

  // Return the public URL for the uploaded file
  const { data: publicURL } = supabase.storage
    .from('message_attachments')
    .getPublicUrl(filePath);

  return publicURL.publicUrl;
};

export const getAttachmentsByMessageId = async (messageId: string) => {
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .eq('message_id', messageId);

  if (error) {
    console.error('Error fetching attachments:', error);
    throw error;
  }

  return data.map(attachment => ({
    id: attachment.id,
    fileName: attachment.file_name,
    filePath: attachment.file_path,
    fileSize: attachment.file_size,
    fileType: attachment.file_type,
    url: supabase.storage
      .from('message_attachments')
      .getPublicUrl(attachment.file_path).data.publicUrl
  }));
};

export const deleteAttachment = async (attachmentId: string) => {
  // First get the attachment to find the file path
  const { data: attachment, error: fetchError } = await supabase
    .from('attachments')
    .select('file_path')
    .eq('id', attachmentId)
    .single();

  if (fetchError) {
    console.error('Error fetching attachment:', fetchError);
    throw fetchError;
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('message_attachments')
    .remove([attachment.file_path]);

  if (storageError) {
    console.error('Error deleting file from storage:', storageError);
    throw storageError;
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('attachments')
    .delete()
    .eq('id', attachmentId);

  if (dbError) {
    console.error('Error deleting attachment record:', dbError);
    throw dbError;
  }

  return true;
};
