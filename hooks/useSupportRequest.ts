import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export function useSupportRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitSupportRequest = async (
    subject: string,
    message: string,
    attachmentName?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      if (!subject.trim() || !message.trim()) throw new Error('Subject and message are required');
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error: insertError } = await supabase
        .from('support_requests')
        .insert({
          user_id: user?.id ?? null,
          subject: subject.trim(),
          message: message.trim(),
          attachment_name: attachmentName?.trim() || null,
        })
        .select()
        .single();
      if (insertError) throw insertError;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitSupportRequest, loading, error };
}
