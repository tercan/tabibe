import { useEffect, useRef, useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import {
  cloneSites,
  moveFolderChild,
  moveRootItem,
  moveSiteToFolder,
  moveSiteToRoot,
} from '../domain/speedDialOperations.js';
import speedDialMoveAnimation from '../lib/speedDialMotion.js';

const FOLDER_DROP_DELAY = 250;
const FOLDER_SWAP_DELAY = 650;

function isInFolderSwapZone(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const edgeX = rect.width * 0.12;
  const edgeY = rect.height * 0.12;

  return x < edgeX || x > rect.width - edgeX || y < edgeY || y > rect.height - edgeY;
}

function useSpeedDialDrag({ sites, setSites, sitesRef, persistSites, queueUndo, messages }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dragOverFolderId, setDragOverFolderId] = useState(null);
  const [folderChildDragState, setFolderChildDragState] = useState(null);
  const [folderChildDragOverIndex, setFolderChildDragOverIndex] = useState(null);
  const dragNodeRef = useRef(null);
  const draggingSiteRef = useRef(null);
  const dragStartSitesRef = useRef(null);
  const dragClickBlockedRef = useRef(false);
  const dragIndexRef = useRef(null);
  const folderChildDragStateRef = useRef(null);
  const dragClickTimerRef = useRef(null);
  const folderDropTimerRef = useRef(null);
  const folderDropCandidateRef = useRef(null);
  const folderDropTargetRef = useRef(null);
  const folderSwapTimerRef = useRef(null);
  const folderSwapCandidateRef = useRef(null);
  const [animationParent] = useAutoAnimate(speedDialMoveAnimation);

  useEffect(() => {
    dragIndexRef.current = dragIndex;
  }, [dragIndex]);

  useEffect(
    () => () => {
      [dragClickTimerRef, folderDropTimerRef, folderSwapTimerRef].forEach((timerRef) => {
        if (timerRef.current) clearTimeout(timerRef.current);
      });
    },
    [],
  );

  function isClickBlocked() {
    return Boolean(dragNodeRef.current || dragClickBlockedRef.current);
  }

  function blockClickAfterDrag() {
    dragClickBlockedRef.current = true;
    if (dragClickTimerRef.current) clearTimeout(dragClickTimerRef.current);

    dragClickTimerRef.current = setTimeout(() => {
      dragClickBlockedRef.current = false;
      dragClickTimerRef.current = null;
    }, 150);
  }

  function clearFolderDropCandidate() {
    if (folderDropTimerRef.current) {
      clearTimeout(folderDropTimerRef.current);
      folderDropTimerRef.current = null;
    }

    folderDropCandidateRef.current = null;
    folderDropTargetRef.current = null;
    setDragOverFolderId(null);
  }

  function clearFolderSwapCandidate() {
    if (folderSwapTimerRef.current) {
      clearTimeout(folderSwapTimerRef.current);
      folderSwapTimerRef.current = null;
    }
    folderSwapCandidateRef.current = null;
  }

  function performSwap(index) {
    const currentIndex = dragIndexRef.current;
    if (currentIndex === null || currentIndex === index) return;

    const nextSites = moveRootItem(sitesRef.current, currentIndex, index);
    if (!nextSites) return;

    setSites(nextSites);
    sitesRef.current = nextSites;
    setDragIndex(index);
    dragIndexRef.current = index;
    setDragOverIndex(index);
  }

  function queueFolderDropCandidate(folderId) {
    if (folderDropCandidateRef.current === folderId) return;

    clearFolderDropCandidate();
    folderDropCandidateRef.current = folderId;
    folderDropTimerRef.current = setTimeout(() => {
      if (folderDropCandidateRef.current === folderId) {
        folderDropTargetRef.current = folderId;
        setDragOverFolderId(folderId);
        setDragOverIndex(null);
      }
      folderDropTimerRef.current = null;
    }, FOLDER_DROP_DELAY);
  }

  function queueFolderSwapCandidate(index) {
    if (folderSwapCandidateRef.current === index) return;

    clearFolderSwapCandidate();
    folderSwapCandidateRef.current = index;
    folderSwapTimerRef.current = setTimeout(() => {
      if (folderSwapCandidateRef.current === index && folderDropTargetRef.current === null) {
        performSwap(index);
      }
      folderSwapTimerRef.current = null;
    }, FOLDER_SWAP_DELAY);
  }

  function handleDragStart(event, index) {
    dragNodeRef.current = event.currentTarget;
    draggingSiteRef.current = sites[index];
    dragStartSitesRef.current = cloneSites(sitesRef.current);
    setDragIndex(index);
    dragIndexRef.current = index;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', sites[index]?.id || '');
  }

  function handleDragEnter(event) {
    event.preventDefault();
  }

  function handleDragOver(event, index) {
    event.preventDefault();
    const currentIndex = dragIndexRef.current;
    if (currentIndex === null) return;

    event.dataTransfer.dropEffect = 'move';
    const draggedSite = sitesRef.current[currentIndex];
    const targetSite = sitesRef.current[index];
    if (!draggedSite || !targetSite) return;

    if (targetSite.type === 'folder' && draggedSite.type !== 'folder') {
      if (isInFolderSwapZone(event)) {
        clearFolderDropCandidate();
        setDragOverIndex(index);
        queueFolderSwapCandidate(index);
      } else {
        clearFolderSwapCandidate();
        setDragOverIndex(index);
        queueFolderDropCandidate(targetSite.id);
      }
      return;
    }

    clearFolderDropCandidate();
    clearFolderSwapCandidate();
    if (index !== currentIndex) {
      setDragOverIndex(index);
      performSwap(index);
    }
  }

  function handleDragLeave(event) {
    const related = event.relatedTarget;
    if (related && event.currentTarget.contains(related)) return;
    clearFolderSwapCandidate();
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    if (dragNodeRef.current) blockClickAfterDrag();
    clearFolderSwapCandidate();
    dragNodeRef.current = null;
    draggingSiteRef.current = null;
    dragStartSitesRef.current = null;
    setDragIndex(null);
    dragIndexRef.current = null;
    setDragOverIndex(null);
    clearFolderDropCandidate();
  }

  async function handleDrop(event, targetIndex = null) {
    event.preventDefault();
    if (
      typeof targetIndex === 'number' &&
      folderDropTargetRef.current === null &&
      dragIndexRef.current !== targetIndex
    ) {
      performSwap(targetIndex);
    }

    await persistSites(cloneSites(sitesRef.current), dragStartSitesRef.current);
    handleDragEnd();
  }

  async function handleDropOnFolder(folderId) {
    const site = draggingSiteRef.current;
    if (!site || site.type === 'folder') return;

    const previousSites = cloneSites(sitesRef.current);
    const nextSites = moveSiteToFolder(previousSites, site.id, folderId);
    if (!nextSites) {
      handleDragEnd();
      return;
    }

    const saved = await persistSites(nextSites, previousSites);
    if (saved) queueUndo(messages.siteMovedToFolder, previousSites);
    handleDragEnd();
  }

  async function handleDropOnItem(event, item, index) {
    event.preventDefault();
    if (draggingSiteRef.current?.type === 'folder') {
      await handleDrop(event);
      return;
    }

    if (folderDropTargetRef.current === item.id || folderDropCandidateRef.current === item.id) {
      await handleDropOnFolder(item.id);
      return;
    }

    await handleDrop(event, index);
  }

  function handleFolderChildDragStart(event, folderId, childIndex) {
    event.stopPropagation();
    const folder = sitesRef.current.find((item) => item.type === 'folder' && item.id === folderId);
    const child = folder?.children?.[childIndex] || null;
    const nextState = { folderId, index: childIndex };

    dragNodeRef.current = event.currentTarget;
    draggingSiteRef.current = child;
    dragStartSitesRef.current = cloneSites(sitesRef.current);
    folderChildDragStateRef.current = nextState;
    setFolderChildDragState(nextState);
    setFolderChildDragOverIndex(childIndex);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', child?.id || '');
  }

  function handleFolderChildDragEnter(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  function performFolderChildSwap(folderId, childIndex) {
    const currentState = folderChildDragStateRef.current;
    if (!currentState || currentState.folderId !== folderId || currentState.index === childIndex) {
      return;
    }

    const nextSites = moveFolderChild(sitesRef.current, folderId, currentState.index, childIndex);
    if (!nextSites) return;

    const nextState = { folderId, index: childIndex };
    setSites(nextSites);
    sitesRef.current = nextSites;
    folderChildDragStateRef.current = nextState;
    setFolderChildDragState(nextState);
    setFolderChildDragOverIndex(childIndex);
  }

  function handleFolderChildDragOver(event, folderId, childIndex) {
    event.preventDefault();
    event.stopPropagation();
    const currentState = folderChildDragStateRef.current;
    if (!currentState || currentState.folderId !== folderId) return;

    event.dataTransfer.dropEffect = 'move';
    if (childIndex === currentState.index) return;
    setFolderChildDragOverIndex(childIndex);
    performFolderChildSwap(folderId, childIndex);
  }

  function handleFolderChildDragLeave(event) {
    event.stopPropagation();
    const related = event.relatedTarget;
    if (related && event.currentTarget.contains(related)) return;
    setFolderChildDragOverIndex(null);
  }

  function handleFolderChildDragEnd(event) {
    event?.stopPropagation();
    if (dragNodeRef.current) blockClickAfterDrag();

    dragNodeRef.current = null;
    draggingSiteRef.current = null;
    dragStartSitesRef.current = null;
    folderChildDragStateRef.current = null;
    setFolderChildDragState(null);
    setFolderChildDragOverIndex(null);
  }

  async function handleFolderChildDrop(event, folderId, childIndex) {
    event.preventDefault();
    event.stopPropagation();
    const currentState = folderChildDragStateRef.current;
    if (currentState && currentState.folderId === folderId) {
      performFolderChildSwap(folderId, childIndex);
      await persistSites(cloneSites(sitesRef.current), dragStartSitesRef.current);
    }
    handleFolderChildDragEnd();
  }

  async function handleFolderChildDropToRoot(event, folderId) {
    event.preventDefault();
    event.stopPropagation();
    const draggedSite = draggingSiteRef.current;
    const currentState = folderChildDragStateRef.current;

    if (!draggedSite || !currentState || currentState.folderId !== folderId) {
      handleFolderChildDragEnd(event);
      return;
    }

    const previousSites = cloneSites(sitesRef.current);
    const nextSites = moveSiteToRoot(previousSites, draggedSite.id);
    if (!nextSites) {
      handleFolderChildDragEnd(event);
      return;
    }

    const saved = await persistSites(nextSites, previousSites);
    if (saved) queueUndo(messages.siteMovedToRoot, previousSites);
    handleFolderChildDragEnd(event);
  }

  return {
    animationParent,
    dragIndex,
    dragOverFolderId,
    dragOverIndex,
    folderChildDragOverIndex,
    folderChildDragState,
    handleDragEnd,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDragStart,
    handleDrop,
    handleDropOnItem,
    handleDropOnFolder,
    handleFolderChildDragEnd,
    handleFolderChildDragEnter,
    handleFolderChildDragLeave,
    handleFolderChildDragOver,
    handleFolderChildDragStart,
    handleFolderChildDrop,
    handleFolderChildDropToRoot,
    isClickBlocked,
  };
}

export default useSpeedDialDrag;
