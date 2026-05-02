import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { handleAuthCallback } = useAuth();

  useEffect(() => {
    let isCancelled = false;

    void (async () => {
      try {
        await handleAuthCallback(window.location.href);
        if (!isCancelled) {
          navigate('/', { replace: true });
        }
      } catch (callbackError) {
        if (isCancelled) {
          return;
        }
        const message = callbackError instanceof Error ? callbackError.message : 'Unable to complete sign-in.';
        navigate('/', {
          replace: true,
          state: { authError: message },
        });
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [handleAuthCallback, navigate]);

  return <p>Completing sign-in...</p>;
}
