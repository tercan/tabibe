const MINUTE_MS = 60 * 1000;

const DEMO_TAG_DEFINITIONS = [
  { id: 'demo-tag-important', name: 'Önemli', colorToken: 'red' },
  { id: 'demo-tag-work', name: 'İş', colorToken: 'blue' },
  { id: 'demo-tag-personal', name: 'Kişisel', colorToken: 'green' },
  { id: 'demo-tag-idea', name: 'Fikir', colorToken: 'yellow' },
];

const DEMO_NOTEBOOK_DEFINITIONS = [
  { id: 'demo-notebook-work', name: 'İş' },
  { id: 'demo-notebook-personal', name: 'Kişisel' },
  { id: 'demo-notebook-ideas', name: 'Fikirler' },
];

const DEMO_NOTE_DEFINITIONS = [
  {
    id: 'demo-note-welcome',
    title: '',
    content:
      '# Tabibe Notlar’a hoş geldin\n\nAklındakileri hızla kaydet, sonra arama, etiketler ve defterlerle kolayca bul.\n\nBu örnek notları dilediğin gibi düzenleyebilir veya silebilirsin.',
    tagIds: ['demo-tag-important'],
    notebookId: null,
    isPinned: true,
    createdMinutesAgo: 43_200,
    updatedMinutesAgo: 5,
  },
  {
    id: 'demo-note-daily-focus',
    title: '',
    content:
      '# Bugünün odak listesi\n\n- [ ] En önemli işi tamamla\n- [ ] Bekleyen iki mesaja yanıt ver\n- [ ] Yarının ilk adımını belirle',
    tagIds: ['demo-tag-important', 'demo-tag-work'],
    notebookId: 'demo-notebook-work',
    isPinned: true,
    createdMinutesAgo: 1_440,
    updatedMinutesAgo: 20,
  },
  {
    id: 'demo-note-product-meeting',
    title: 'Ürün değerlendirme toplantısı',
    content:
      '## Konuşulanlar\n\n- Not alma akışı sade ve hızlı olmalı.\n- Mobilde liste ve editör ayrı yüzeyler olarak çalışmalı.\n- Otomatik kayıt durumu kullanıcıya açıkça gösterilmeli.\n\n## Sonraki adım\n\nKullanılabilirlik testindeki geri bildirimleri grupla.',
    tagIds: ['demo-tag-work'],
    notebookId: 'demo-notebook-work',
    isPinned: false,
    createdMinutesAgo: 4_320,
    updatedMinutesAgo: 120,
  },
  {
    id: 'demo-note-weekly-plan',
    title: 'Haftalık plan',
    content:
      '## Pazartesi\n\nProje hedeflerini netleştir ve öncelikleri sırala.\n\n## Çarşamba\n\nAra kontrol yap, engelleri not et.\n\n## Cuma\n\nTamamlananları değerlendir ve gelecek haftayı hazırla.',
    tagIds: ['demo-tag-work'],
    notebookId: 'demo-notebook-work',
    isPinned: false,
    createdMinutesAgo: 10_080,
    updatedMinutesAgo: 360,
  },
  {
    id: 'demo-note-research-questions',
    title: '',
    content:
      '# Araştırma soruları\n\n1. Kullanıcılar bir notu en çok hangi yolla geri buluyor?\n2. Etiket eklemek hangi noktada gereksiz yük oluşturuyor?\n3. Hızlı yakalama sonrası düzenleme ihtiyacı ne kadar sık?',
    tagIds: ['demo-tag-idea', 'demo-tag-work'],
    notebookId: 'demo-notebook-ideas',
    isPinned: false,
    createdMinutesAgo: 20_160,
    updatedMinutesAgo: 1_440,
  },
  {
    id: 'demo-note-shopping-list',
    title: 'Alışveriş listesi',
    content:
      '- [ ] Kahve\n- [ ] Süt\n- [ ] Yumurta\n- [ ] Mevsim meyveleri\n- [ ] Bulaşık deterjanı',
    tagIds: ['demo-tag-personal'],
    notebookId: 'demo-notebook-personal',
    isPinned: false,
    createdMinutesAgo: 2_880,
    updatedMinutesAgo: 1_500,
  },
  {
    id: 'demo-note-book-notes',
    title: 'Kitap notları',
    content:
      '> İyi bir not, yalnızca bilgiyi değil o bilginin neden önemli olduğunu da hatırlatır.\n\n- Her bölümden tek bir ana fikir çıkar.\n- Alıntıyı kendi cümlelerinle açıkla.\n- Uygulanabilir bir sonraki adım yaz.',
    tagIds: ['demo-tag-personal'],
    notebookId: 'demo-notebook-personal',
    isPinned: false,
    createdMinutesAgo: 14_400,
    updatedMinutesAgo: 2_880,
  },
  {
    id: 'demo-note-trip-preparation',
    title: 'Seyahat hazırlığı',
    content:
      '## Gitmeden önce\n\n- [x] Ulaşım bilgilerini kaydet\n- [ ] Konaklama adresini çevrimdışı erişime aç\n- [ ] Hava durumunu kontrol et\n- [ ] Şarj cihazlarını hazırla',
    tagIds: ['demo-tag-personal', 'demo-tag-important'],
    notebookId: 'demo-notebook-personal',
    isPinned: false,
    createdMinutesAgo: 28_800,
    updatedMinutesAgo: 4_320,
  },
  {
    id: 'demo-note-filter-coffee',
    title: 'Filtre kahve tarifi',
    content:
      '1. 20 gram kahveyi orta incelikte öğüt.\n2. Filtreyi sıcak suyla durula.\n3. 320 mililitre suyu yavaşça ekle.\n4. Toplam demleme süresini yaklaşık 3 dakika tut.',
    tagIds: ['demo-tag-personal'],
    notebookId: 'demo-notebook-personal',
    isPinned: false,
    createdMinutesAgo: 64_800,
    updatedMinutesAgo: 5_760,
  },
  {
    id: 'demo-note-release-checklist',
    title: 'Proje teslim kontrolü',
    content:
      '- [x] Değişiklikleri gözden geçir\n- [x] Birim testlerini çalıştır\n- [ ] Mobil görünümü doğrula\n- [ ] Yedek ve geri alma adımlarını kontrol et\n- [ ] Sürüm notunu hazırla',
    tagIds: ['demo-tag-work', 'demo-tag-important'],
    notebookId: 'demo-notebook-work',
    isPinned: false,
    createdMinutesAgo: 11_520,
    updatedMinutesAgo: 7_200,
  },
  {
    id: 'demo-note-idea-parking-lot',
    title: 'Fikir parkı',
    content:
      '- Haftalık not özeti oluşturmak\n- Sık kullanılan aramaları kaydetmek\n- Notlar arasında bağlantı kurmak\n- Odak modu için dikkat dağıtmayan tema tasarlamak',
    tagIds: ['demo-tag-idea'],
    notebookId: 'demo-notebook-ideas',
    isPinned: false,
    createdMinutesAgo: 86_400,
    updatedMinutesAgo: 11_520,
  },
  {
    id: 'demo-note-completed-week',
    title: 'Tamamlanan haftanın kısa özeti',
    content:
      '- Arama akışı sadeleştirildi.\n- Not listesi mobil görünüme uyarlandı.\n- Otomatik kayıt hata senaryoları test edildi.\n\nBu not, arşivlenmiş içeriğin nasıl saklandığını gösteren bir örnektir.',
    tagIds: ['demo-tag-work'],
    notebookId: 'demo-notebook-work',
    isPinned: false,
    isArchived: true,
    createdMinutesAgo: 30_240,
    updatedMinutesAgo: 20_160,
  },
];

function createTimestamp(referenceTimestamp, minutesAgo) {
  return new Date(referenceTimestamp - minutesAgo * MINUTE_MS).toISOString();
}

function getNameKey(value) {
  return typeof value === 'string' ? value.trim().toLocaleLowerCase() : '';
}

function getAvailableId(preferredId, usedIds) {
  if (!usedIds.has(preferredId)) return preferredId;

  let suffix = 2;
  while (usedIds.has(`${preferredId}-${suffix}`)) suffix += 1;
  return `${preferredId}-${suffix}`;
}

function mergeNamedDemoItems(currentItems, demoItems) {
  const items = currentItems.map((item) => ({ ...item }));
  const usedIds = new Set(items.map((item) => item.id));
  const idsByName = new Map(items.map((item) => [getNameKey(item.name), item.id]));
  const resolvedIds = new Map();
  let addedCount = 0;

  demoItems.forEach((demoItem) => {
    const nameKey = getNameKey(demoItem.name);
    const matchingId = idsByName.get(nameKey);
    if (matchingId) {
      resolvedIds.set(demoItem.id, matchingId);
      return;
    }

    const nextId = getAvailableId(demoItem.id, usedIds);
    items.push({ ...demoItem, id: nextId });
    usedIds.add(nextId);
    idsByName.set(nameKey, nextId);
    resolvedIds.set(demoItem.id, nextId);
    addedCount += 1;
  });

  return { addedCount, items, resolvedIds };
}

function createDemoNoteWorkspace(referenceDate = new Date()) {
  const candidateTimestamp = new Date(referenceDate).getTime();
  const referenceTimestamp = Number.isFinite(candidateTimestamp) ? candidateTimestamp : Date.now();
  const organizationTimestamp = createTimestamp(referenceTimestamp, 129_600);

  return {
    notes: DEMO_NOTE_DEFINITIONS.map(
      ({ createdMinutesAgo, updatedMinutesAgo, isArchived = false, ...note }) => ({
        ...note,
        tagIds: [...note.tagIds],
        captureSessionId: null,
        isArchived,
        createdAt: createTimestamp(referenceTimestamp, createdMinutesAgo),
        updatedAt: createTimestamp(referenceTimestamp, updatedMinutesAgo),
        revision: 1,
      }),
    ),
    noteTags: DEMO_TAG_DEFINITIONS.map((tag) => ({
      ...tag,
      createdAt: organizationTimestamp,
      updatedAt: organizationTimestamp,
    })),
    noteNotebooks: DEMO_NOTEBOOK_DEFINITIONS.map((notebook) => ({
      ...notebook,
      createdAt: organizationTimestamp,
      updatedAt: organizationTimestamp,
    })),
  };
}

function mergeDemoNoteWorkspace(workspace, referenceDate = new Date()) {
  const currentNotes = Array.isArray(workspace?.notes) ? workspace.notes : [];
  const currentTags = Array.isArray(workspace?.noteTags) ? workspace.noteTags : [];
  const currentNotebooks = Array.isArray(workspace?.noteNotebooks) ? workspace.noteNotebooks : [];
  const demoWorkspace = createDemoNoteWorkspace(referenceDate);
  const tagMerge = mergeNamedDemoItems(currentTags, demoWorkspace.noteTags);
  const notebookMerge = mergeNamedDemoItems(currentNotebooks, demoWorkspace.noteNotebooks);
  const usedNoteIds = new Set(currentNotes.map((note) => note.id));
  const addedNotes = demoWorkspace.notes
    .filter((note) => !usedNoteIds.has(note.id))
    .map((note) => ({
      ...note,
      tagIds: note.tagIds.map((tagId) => tagMerge.resolvedIds.get(tagId)).filter(Boolean),
      notebookId: note.notebookId ? notebookMerge.resolvedIds.get(note.notebookId) || null : null,
    }));

  return {
    workspace: {
      notes: [...currentNotes, ...addedNotes],
      noteTags: tagMerge.items,
      noteNotebooks: notebookMerge.items,
    },
    addedNotes: addedNotes.length,
    addedTags: tagMerge.addedCount,
    addedNotebooks: notebookMerge.addedCount,
    didChange: addedNotes.length > 0 || tagMerge.addedCount > 0 || notebookMerge.addedCount > 0,
  };
}

export { createDemoNoteWorkspace, mergeDemoNoteWorkspace };
