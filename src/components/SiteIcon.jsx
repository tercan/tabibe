import { useEffect, useMemo, useRef, useState } from 'react';
import { getMonogram, getMonogramColor, resolveIconCandidates } from '../lib/iconResolver.js';

const FAVICON_TIMEOUT = 2000;

function SiteIcon({
  site,
  catalog,
  globalStyle = 'favicon',
  hasFaviconPermission = false,
  eager = true,
  compact = false,
}) {
  const candidates = useMemo(
    () => resolveIconCandidates({ site, catalog, globalStyle, hasFaviconPermission }),
    [catalog, globalStyle, hasFaviconPermission, site],
  );
  const resetKey = `${site?.id || 'preview'}:${site?.url || ''}:${site?.name || ''}:${site?.icon?.preference || 'auto'}:${site?.icon?.slug || ''}:${globalStyle}:${hasFaviconPermission}:${catalog?.version || ''}`;
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef(null);
  const candidate = candidates[candidateIndex] || candidates.at(-1);
  const isMonogram = candidate?.type === 'monogram';
  const isMask = candidate?.type === 'brand' && candidate.variant === 'monochrome';
  const visibleSource = isMonogram || isMask || isLoaded ? candidate?.type : 'monogram';
  const monogramVariant = candidates.at(-1)?.variant || 'color';
  const monogramStyle =
    monogramVariant === 'color' ? { backgroundColor: getMonogramColor(site) } : undefined;

  useEffect(() => {
    setCandidateIndex(0);
    setIsLoaded(false);
  }, [resetKey]);

  useEffect(() => {
    setIsLoaded(false);
    const image = imageRef.current;
    if (image?.complete) {
      if (image.naturalWidth > 0) setIsLoaded(true);
      else setCandidateIndex((currentIndex) => Math.min(currentIndex + 1, candidates.length - 1));
    }
    if (candidate?.type !== 'favicon') return undefined;

    const timeout = setTimeout(() => {
      setCandidateIndex((currentIndex) => Math.min(currentIndex + 1, candidates.length - 1));
    }, FAVICON_TIMEOUT);
    return () => clearTimeout(timeout);
  }, [candidate?.src, candidate?.type, candidates.length, resetKey]);

  function handleError() {
    setIsLoaded(false);
    setCandidateIndex((currentIndex) => Math.min(currentIndex + 1, candidates.length - 1));
  }

  return (
    <span
      className={`site-icon${compact ? ' site-icon--compact' : ''}`}
      data-icon-source={visibleSource}
      data-icon-candidate={candidate?.type || 'monogram'}
      aria-hidden="true"
    >
      <span
        className={`site-icon-monogram site-icon-monogram--${monogramVariant}`}
        style={monogramStyle}
      >
        {getMonogram(site)}
      </span>
      {isMask && (
        <span
          className="site-icon-layer site-icon-brand-mask"
          style={{ '--site-icon-mask': `url("${candidate.src}")` }}
        />
      )}
      {!isMonogram && !isMask && (
        <img
          ref={imageRef}
          key={candidate.src}
          className={`site-icon-layer site-icon-image site-icon-image--${candidate.type} site-icon-image--${candidate.variant}${isLoaded ? ' site-icon-image--loaded' : ''}`}
          src={candidate.src}
          alt=""
          width="48"
          height="48"
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
        />
      )}
    </span>
  );
}

export default SiteIcon;
