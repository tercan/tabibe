import { useEffect, useState } from 'react';
import { EMPTY_ICON_CATALOG, loadIconCatalog } from '../lib/iconCatalog.js';

function useIconCatalog() {
  const [catalog, setCatalog] = useState(EMPTY_ICON_CATALOG);

  useEffect(() => {
    let active = true;
    loadIconCatalog()
      .then((loadedCatalog) => {
        if (active) setCatalog(loadedCatalog);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  return catalog;
}

export default useIconCatalog;
