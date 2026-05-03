import { useEffect, useState } from 'react';

/**
 * 1. Speed dial icon renderer
 */

function SpeedDialIcon({
  site,
  getIconMetadata,
  iconResetKey,
}) {
  const [failedSources, setFailedSources] = useState([]);

  useEffect(() => {
    setFailedSources([]);
  }, [iconResetKey]);

  const metadata = getIconMetadata(site, new Set(failedSources));
  const source = metadata.source || 'fallback';
  const className = `speed-dial-icon speed-dial-icon--${source}`;

  function handleIconError() {
    if (source === 'fallback' || failedSources.includes(source)) return;

    setFailedSources((currentSources) => [...currentSources, source]);
  }

  return (
    <img
      className={className}
      src={metadata.src}
      data-icon-source={source}
      data-icon-failed-sources={failedSources.join(',')}
      alt=""
      aria-hidden="true"
      width="40"
      height="40"
      loading="lazy"
      onError={handleIconError}
    />
  );
}

export default SpeedDialIcon;
