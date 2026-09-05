import { useEffect, useState } from 'react';

function dataUrlToBlob(dataUrl) {
  const match = dataUrl.match(/^data:([^;,]+);base64,(.+)$/i);
  if (!match) return null;

  try {
    const binary = atob(match[2]);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new Blob([bytes], { type: match[1] });
  } catch {
    return null;
  }
}

function useBackgroundImageUrl(dataUrl) {
  const [renderSource, setRenderSource] = useState({ source: dataUrl, url: dataUrl });

  useEffect(() => {
    const blob = dataUrl ? dataUrlToBlob(dataUrl) : null;
    if (!blob || typeof URL.createObjectURL !== 'function') {
      setRenderSource({ source: dataUrl, url: dataUrl });
      return undefined;
    }

    const objectUrl = URL.createObjectURL(blob);
    setRenderSource({ source: dataUrl, url: objectUrl });

    return () => URL.revokeObjectURL(objectUrl);
  }, [dataUrl]);

  return renderSource.source === dataUrl ? renderSource.url : dataUrl;
}

export { dataUrlToBlob };
export default useBackgroundImageUrl;
