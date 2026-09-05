import { useCallback, useEffect, useState } from 'react';

function addChromeListener(event, listener) {
  if (!event?.addListener) return () => undefined;
  event.addListener(listener);
  return () => event.removeListener?.(listener);
}

function useBrowserStats(showMemory) {
  const [tabCount, setTabCount] = useState(0);
  const [windowCount, setWindowCount] = useState(0);
  const [memoryInfo, setMemoryInfo] = useState(null);

  const synchronizeCounts = useCallback(() => {
    if (!globalThis.chrome?.tabs || !globalThis.chrome?.windows) return;

    globalThis.chrome.tabs.query({}, (tabs) => {
      if (!globalThis.chrome.runtime.lastError) setTabCount(tabs.length);
    });
    globalThis.chrome.windows.getAll({}, (windows) => {
      if (!globalThis.chrome.runtime.lastError) setWindowCount(windows.length);
    });
  }, []);

  const refreshMemory = useCallback(() => {
    if (!showMemory || !globalThis.chrome?.system?.memory) {
      setMemoryInfo(null);
      return;
    }

    globalThis.chrome.system.memory.getInfo((info) => {
      if (globalThis.chrome.runtime.lastError) return;
      const usedGb = ((info.capacity - info.availableCapacity) / 1024 ** 3).toFixed(1);
      const totalGb = (info.capacity / 1024 ** 3).toFixed(0);
      setMemoryInfo(`${usedGb}/${totalGb} GB`);
    });
  }, [showMemory]);

  useEffect(() => {
    synchronizeCounts();

    const removeListeners = [
      addChromeListener(globalThis.chrome?.tabs?.onCreated, () =>
        setTabCount((count) => count + 1),
      ),
      addChromeListener(globalThis.chrome?.tabs?.onRemoved, () =>
        setTabCount((count) => Math.max(0, count - 1)),
      ),
      addChromeListener(globalThis.chrome?.windows?.onCreated, () =>
        setWindowCount((count) => count + 1),
      ),
      addChromeListener(globalThis.chrome?.windows?.onRemoved, () =>
        setWindowCount((count) => Math.max(0, count - 1)),
      ),
    ];

    function handleVisibilityChange() {
      if (!document.hidden) synchronizeCounts();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      removeListeners.forEach((removeListener) => removeListener());
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [synchronizeCounts]);

  useEffect(() => {
    refreshMemory();
  }, [refreshMemory]);

  return { memoryInfo, refreshMemory, tabCount, windowCount };
}

export default useBrowserStats;
