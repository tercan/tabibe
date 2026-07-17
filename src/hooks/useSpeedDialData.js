import { useCallback, useEffect, useRef, useState } from 'react';
import { cloneSites } from '../domain/speedDialOperations.js';
import { loadSites, saveSites } from '../lib/storage.js';

function useSpeedDialData(restoredMessage) {
  const [sites, setSites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [undoState, setUndoState] = useState(null);
  const sitesRef = useRef([]);
  const undoTimerRef = useRef(null);

  useEffect(() => {
    sitesRef.current = sites;
  }, [sites]);

  const retryLoad = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);

    try {
      const loadedSites = await loadSites();
      setSites(loadedSites);
      sitesRef.current = loadedSites;
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    retryLoad();
  }, [retryLoad]);

  useEffect(
    () => () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    },
    [],
  );

  async function persistSites(nextSites, rollbackSites = sitesRef.current) {
    const previousSites = cloneSites(rollbackSites || sitesRef.current);
    setSites(nextSites);
    sitesRef.current = nextSites;
    setSaveError(false);

    try {
      await saveSites(nextSites);
      return true;
    } catch {
      setSites(previousSites);
      sitesRef.current = previousSites;
      setSaveError(true);
      return false;
    }
  }

  function queueUndo(message, previousSites) {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

    setUndoState({ message, previousSites });
    undoTimerRef.current = setTimeout(() => {
      setUndoState(null);
      undoTimerRef.current = null;
    }, 7000);
  }

  async function undo() {
    if (!undoState) return false;
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }

    const saved = await persistSites(undoState.previousSites);
    if (!saved) return false;
    setUndoState({ message: restoredMessage, previousSites: null });
    undoTimerRef.current = setTimeout(() => {
      setUndoState(null);
      undoTimerRef.current = null;
    }, 2500);
    return true;
  }

  return {
    clearSaveError: () => setSaveError(false),
    isLoading,
    loadError,
    persistSites,
    queueUndo,
    reportSaveError: () => setSaveError(true),
    retryLoad,
    saveError,
    setSites,
    sites,
    sitesRef,
    undo,
    undoState,
  };
}

export default useSpeedDialData;
