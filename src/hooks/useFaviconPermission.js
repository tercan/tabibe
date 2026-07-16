import { useCallback, useEffect, useState } from 'react';

const FAVICON_PERMISSION = { permissions: ['favicon'] };

function supportsFaviconPermission() {
  return Boolean(
    globalThis.chrome?.runtime?.id &&
    globalThis.chrome?.permissions?.contains &&
    globalThis.chrome?.runtime?.getURL,
  );
}

function useFaviconPermission() {
  const [hasPermission, setHasPermission] = useState(false);
  const [requestState, setRequestState] = useState('idle');
  const supported = supportsFaviconPermission();

  const refresh = useCallback(() => {
    if (!supported) {
      setHasPermission(false);
      return;
    }

    chrome.permissions.contains(FAVICON_PERMISSION, (granted) => {
      if (chrome.runtime.lastError) {
        setHasPermission(false);
        return;
      }
      setHasPermission(Boolean(granted));
    });
  }, [supported]);

  useEffect(() => {
    refresh();
    const permissions = globalThis.chrome?.permissions;
    if (!supported || !permissions?.onAdded || !permissions?.onRemoved) return undefined;

    permissions.onAdded.addListener(refresh);
    permissions.onRemoved.addListener(refresh);
    return () => {
      permissions.onAdded.removeListener(refresh);
      permissions.onRemoved.removeListener(refresh);
    };
  }, [refresh, supported]);

  const requestPermission = useCallback(async () => {
    if (!supported) return false;
    setRequestState('requesting');

    return new Promise((resolve) => {
      chrome.permissions.request(FAVICON_PERMISSION, (granted) => {
        const accepted = !chrome.runtime.lastError && Boolean(granted);
        setHasPermission(accepted);
        setRequestState(accepted ? 'granted' : 'denied');
        resolve(accepted);
      });
    });
  }, [supported]);

  const revokePermission = useCallback(async () => {
    if (!supported || !globalThis.chrome?.permissions?.remove) return false;
    setRequestState('revoking');

    return new Promise((resolve) => {
      chrome.permissions.remove(FAVICON_PERMISSION, (removed) => {
        const revoked = !chrome.runtime.lastError && Boolean(removed);
        if (revoked) setHasPermission(false);
        setRequestState(revoked ? 'revoked' : 'granted');
        resolve(revoked);
      });
    });
  }, [supported]);

  return {
    supported,
    hasPermission,
    requestState,
    requestPermission,
    revokePermission,
    refresh,
  };
}

export { FAVICON_PERMISSION, supportsFaviconPermission };
export default useFaviconPermission;
