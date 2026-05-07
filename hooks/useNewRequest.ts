import { supabase } from '@/lib/supabase';
import type { RequestFormData, ServiceType } from '@/lib/types';
import { useState } from 'react';

export function useNewRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitRequest = async (
    serviceType: ServiceType,
    compensation: number,
    formData: RequestFormData
  ) => {
    try {
      setLoading(true);
      setError(null);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: insertError } = await supabase
        .from('requests')
        .insert({
          client_id: user.id,
          service_type: serviceType,
          compensation: compensation.toString(),
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          mls_number: formData.mlsNumber || null,
          client_name: formData.clientName || null,
          client_phone: formData.clientPhone || null,
          access_notes: formData.accessNotes || null,
          lockbox_code: formData.lockboxCode || null,
          additional_notes: formData.additionalNotes || null,
          date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime,
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

  return { submitRequest, loading, error };
}
