import { supabase } from '@/lib/supabase';
import type { Request } from '@/lib/types';
import { useCallback, useEffect, useState } from 'react';

export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRequests((data as Request[]) ?? []);
    } catch (err) {
      console.error('fetchRequests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRequest = async (requestData: Record<string, any>) => {
    const { data, error } = await supabase
      .from('requests')
      .insert(requestData)
      .select()
      .single();
    if (error) throw error;
    await fetchRequests();
    return data as Request;
  };

  const updateRequestStatus = async (id: string, status?: string, agentId?: string) => {
    const payload: Record<string, any> = {};
    if (status) payload.status = status;
    if (agentId) payload.agent_id = agentId;
    const { data, error } = await supabase
      .from('requests')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await fetchRequests();
    return data as Request;
  };

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, loading, createRequest, updateRequestStatus, refresh: fetchRequests };
}
