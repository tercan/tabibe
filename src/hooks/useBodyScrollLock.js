import { useEffect } from 'react';

let activeLockCount = 0;

function acquireBodyScrollLock() {
  activeLockCount += 1;
  document.body.classList.add('no-scroll');
}

function releaseBodyScrollLock() {
  activeLockCount = Math.max(0, activeLockCount - 1);
  if (activeLockCount === 0) document.body.classList.remove('no-scroll');
}

function useBodyScrollLock(isActive) {
  useEffect(() => {
    if (!isActive) return undefined;

    acquireBodyScrollLock();
    return releaseBodyScrollLock;
  }, [isActive]);
}

export { acquireBodyScrollLock, releaseBodyScrollLock };
export default useBodyScrollLock;
