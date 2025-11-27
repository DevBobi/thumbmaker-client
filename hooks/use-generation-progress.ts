import { useState, useEffect } from 'react';
import { useAuthFetch } from './use-auth-fetch';

interface GenerationProgress {
  completed: number;
  total: number;
  status: string;
  percent: number;
  isCompleted: boolean;
  isFailed: boolean;
}

const initialProgress: GenerationProgress = {
  completed: 0,
  total: 0,
  status: 'PENDING',
  percent: 0,
  isCompleted: false,
  isFailed: false
};

/**
 * Hook for tracking thumbnail generation progress in real-time
 * Polls the server for updates on the generation process
 */
export function useGenerationProgress(setId: string | undefined) {
  const { authFetch } = useAuthFetch();
  const [progress, setProgress] = useState<GenerationProgress>(initialProgress);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!setId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    const fetchProgress = async () => {
      try {
        const response = await authFetch(`/metrics/set/${setId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch progress: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (mounted) {
          const status = data.status || 'PENDING';
          const isCompleted = status === 'COMPLETED';
          const isFailed = status === 'FAILED';
          
          setProgress({
            completed: data.completed || 0,
            total: data.total || 0,
            status,
            percent: data.percent || 0,
            isCompleted,
            isFailed
          });
          
          // Stop polling if we're done
          if (isCompleted || isFailed) {
            if (pollInterval) {
              clearInterval(pollInterval);
              pollInterval = null;
            }
          }
          
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching generation progress:', err);
        if (mounted) {
          setError((err as Error).message || 'Failed to fetch generation progress');
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchProgress();
    
    // Set up polling every 2 seconds
    pollInterval = setInterval(fetchProgress, 2000);

    // Clean up on unmount
    return () => {
      mounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [setId, authFetch]);

  return { progress, loading, error };
}
