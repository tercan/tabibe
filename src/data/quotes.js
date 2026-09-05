/**
 * 1. Daily quotes pool — multi-language
 */

const QUOTES = {
  en: [
    {
      text: 'One who does not crack the walnut shell to reach its core thinks the whole walnut is just shell.',
      author: 'Al-Ghazali',
    },
    {
      text: "The greatest proof of foolishness is insisting on one's own rightness.",
      author: 'Ibn Sina',
    },
    {
      text: 'I would be a servant for forty years to the one who teaches me a single letter.',
      author: 'Ali ibn Abi Talib',
    },
    {
      text: 'Just as water resembles water, the past resembles the future.',
      author: 'Ibn Khaldun',
    },
    {
      text: 'Ignorance breeds fear, fear breeds hatred, hatred breeds violence.',
      author: 'Ibn Rushd',
    },
    { text: 'Even if you are hurt, do not hurt others.', author: 'Haji Bektash Veli' },
    { text: 'The door will open; just know how to knock.', author: 'Shams Tabrizi' },
    {
      text: 'Truth cannot be found by seeking, yet only seekers find it.',
      author: 'Bayazid Bastami',
    },
    { text: 'Words are like medicine; a little heals, too much kills.', author: "Imam al-Shafi'i" },
    { text: 'Knowledge that is not acted upon is merely a burden.', author: 'Imam Abu Hanifa' },
    { text: 'Keep people alive so that the state may live.', author: 'Sheikh Edebali' },
    { text: 'The worth of a person is measured by what they seek.', author: "Sa'di Shirazi" },
    { text: 'Only those who seek the truth know the value of knowledge.', author: 'Al-Biruni' },
    { text: 'Justice is the foundation of sovereignty.', author: 'Nizam al-Mulk' },
    { text: 'A face washed with tears is the most beautiful face.', author: 'Muhammad Iqbal' },
    {
      text: 'Philosophy is to know the reality of things to the extent of human capacity.',
      author: 'Al-Kindi',
    },
    { text: 'Success is the fruit of patience.', author: 'Akshemseddin' },
    { text: 'Truth is the most precious companion of the seeker.', author: 'Abu Bakr al-Razi' },
    { text: 'The value of people is measured by what they pursue.', author: 'Ali ibn Abi Talib' },
    {
      text: 'Knowledge acquired without purifying the heart is nothing but a burden.',
      author: 'Imam al-Ghazali',
    },
    { text: 'Knowledge is the nourishment of the mind.', author: 'Ibn Sina' },
    { text: 'A virtuous society begins with a virtuous individual.', author: 'Al-Farabi' },
    { text: 'Truth cannot contradict truth.', author: 'Ibn Rushd' },
    {
      text: 'Even when I know I am right, I consider the possibility that I might be wrong.',
      author: "Imam al-Shafi'i",
    },
    {
      text: 'Knowledge becomes beneficial when united with wisdom.',
      author: 'Shah Waliullah Dehlawi',
    },
    { text: 'Admitting what you do not know is also a form of knowledge.', author: 'Abu Hanifa' },
    { text: 'A neglected heart grows dark.', author: 'Ibn Qayyim al-Jawziyya' },
    {
      text: 'The most accepted deed is the one done consistently, even if small.',
      author: 'Imam al-Nawawi',
    },
    { text: 'Even if you are hurt, do not hurt others.', author: 'Haji Bektash Veli' },
    { text: 'Civilization begins with ideas.', author: 'Malek Bennabi' },
    { text: 'Modern man is lonely because he has lost the sacred.', author: 'Seyyed Hossein Nasr' },
  ],
  fr: [
    {
      text: 'Celui qui ne brise pas la coque de la noix pour atteindre son cœur pense que la noix entière n’est que coque.',
      author: 'Al-Ghazali',
    },
    {
      text: 'La plus grande preuve de sottise est de s’obstiner à croire que l’on a raison.',
      author: 'Ibn Sina',
    },
    {
      text: 'Je serais le serviteur pendant quarante ans de celui qui m’enseigne une seule lettre.',
      author: 'Ali ibn Abi Talib',
    },
    {
      text: 'Tout comme l’eau ressemble à l’eau, le passé ressemble à l’avenir.',
      author: 'Ibn Khaldoun',
    },
    {
      text: 'L’ignorance engendre la peur, la peur engendre la haine, la haine engendre la violence.',
      author: 'Averroès',
    },
    { text: 'Même si l’on vous blesse, ne blessez pas les autres.', author: 'Haji Bektash Veli' },
    { text: 'La porte s’ouvrira ; il suffit de savoir frapper.', author: 'Shams de Tabriz' },
    {
      text: 'La vérité ne se trouve pas en la cherchant, pourtant seuls ceux qui cherchent la trouvent.',
      author: 'Bayazid Bastami',
    },
    {
      text: 'Les paroles sont comme un médicament : un peu guérit, trop tue.',
      author: 'Imam al-Shafi’i',
    },
    {
      text: 'Le savoir qui n’est pas mis en pratique n’est qu’un fardeau.',
      author: 'Imam Abou Hanifa',
    },
    { text: 'Faites vivre les gens afin que l’État puisse vivre.', author: 'Cheikh Edebali' },
    {
      text: 'La valeur d’une personne se mesure à ce qu’elle recherche.',
      author: 'Saadi de Chiraz',
    },
    {
      text: 'Seuls ceux qui cherchent la vérité connaissent la valeur du savoir.',
      author: 'Al-Biruni',
    },
    { text: 'La justice est le fondement de la souveraineté.', author: 'Nizam al-Mulk' },
    {
      text: 'Un visage lavé par les larmes est le plus beau des visages.',
      author: 'Muhammad Iqbal',
    },
    {
      text: 'La philosophie consiste à connaître la réalité des choses dans la mesure des capacités humaines.',
      author: 'Al-Kindi',
    },
    { text: 'La réussite est le fruit de la patience.', author: 'Akshemseddin' },
    {
      text: 'La vérité est la compagne la plus précieuse de celui qui cherche.',
      author: 'Abou Bakr al-Razi',
    },
    {
      text: 'La valeur des êtres humains se mesure à ce qu’ils poursuivent.',
      author: 'Ali ibn Abi Talib',
    },
    {
      text: 'Le savoir acquis sans purifier le cœur n’est rien d’autre qu’un fardeau.',
      author: 'Imam al-Ghazali',
    },
    { text: 'Le savoir est la nourriture de l’esprit.', author: 'Ibn Sina' },
    {
      text: 'Une société vertueuse commence par un individu vertueux.',
      author: 'Al-Farabi',
    },
    { text: 'La vérité ne peut contredire la vérité.', author: 'Averroès' },
    {
      text: 'Même lorsque je sais que j’ai raison, j’envisage la possibilité de me tromper.',
      author: 'Imam al-Shafi’i',
    },
    {
      text: 'Le savoir devient bénéfique lorsqu’il s’unit à la sagesse.',
      author: 'Shah Waliullah Dehlawi',
    },
    {
      text: 'Reconnaître ce que l’on ne sait pas est aussi une forme de savoir.',
      author: 'Abou Hanifa',
    },
    { text: 'Un cœur négligé s’assombrit.', author: 'Ibn Qayyim al-Jawziyya' },
    {
      text: 'L’action la mieux acceptée est celle que l’on accomplit avec constance, même si elle est modeste.',
      author: 'Imam al-Nawawi',
    },
    { text: 'Même si l’on vous blesse, ne blessez pas les autres.', author: 'Haji Bektash Veli' },
    { text: 'La civilisation commence par les idées.', author: 'Malek Bennabi' },
    {
      text: 'L’homme moderne est seul parce qu’il a perdu le sens du sacré.',
      author: 'Seyyed Hossein Nasr',
    },
  ],
  de: [
    {
      text: 'Wer die Schale der Walnuss nicht knackt, um an ihren Kern zu gelangen, hält die ganze Walnuss für Schale.',
      author: 'Al-Ghazali',
    },
    {
      text: 'Der größte Beweis für Torheit ist, auf der eigenen Unfehlbarkeit zu beharren.',
      author: 'Ibn Sina',
    },
    {
      text: 'Demjenigen, der mich einen einzigen Buchstaben lehrt, würde ich vierzig Jahre lang dienen.',
      author: 'Ali ibn Abi Talib',
    },
    {
      text: 'Wie Wasser dem Wasser gleicht, so gleicht die Vergangenheit der Zukunft.',
      author: 'Ibn Khaldun',
    },
    {
      text: 'Unwissenheit erzeugt Angst, Angst erzeugt Hass, Hass erzeugt Gewalt.',
      author: 'Ibn Rushd',
    },
    { text: 'Auch wenn du verletzt wirst, verletze andere nicht.', author: 'Haji Bektash Veli' },
    {
      text: 'Die Tür wird sich öffnen; du musst nur wissen, wie man anklopft.',
      author: 'Schams Tabrizi',
    },
    {
      text: 'Die Wahrheit lässt sich nicht durch Suchen finden, und doch finden sie nur die Suchenden.',
      author: 'Bayazid Bastami',
    },
    {
      text: 'Worte sind wie Medizin: Wenig davon heilt, zu viel davon tötet.',
      author: 'Imam al-Schafi’i',
    },
    {
      text: 'Wissen, nach dem nicht gehandelt wird, ist nichts als eine Last.',
      author: 'Imam Abu Hanifa',
    },
    { text: 'Lass die Menschen leben, damit der Staat leben kann.', author: 'Scheich Edebali' },
    {
      text: 'Der Wert eines Menschen bemisst sich nach dem, wonach er strebt.',
      author: 'Saadi Schirazi',
    },
    {
      text: 'Nur wer die Wahrheit sucht, kennt den Wert des Wissens.',
      author: 'Al-Biruni',
    },
    { text: 'Gerechtigkeit ist das Fundament der Herrschaft.', author: 'Nizam al-Mulk' },
    {
      text: 'Ein von Tränen gewaschenes Gesicht ist das schönste Gesicht.',
      author: 'Muhammad Iqbal',
    },
    {
      text: 'Philosophie bedeutet, die Wirklichkeit der Dinge im Rahmen der menschlichen Fähigkeiten zu erkennen.',
      author: 'Al-Kindi',
    },
    { text: 'Erfolg ist die Frucht der Geduld.', author: 'Akshemseddin' },
    {
      text: 'Die Wahrheit ist die wertvollste Begleiterin des Suchenden.',
      author: 'Abu Bakr al-Razi',
    },
    {
      text: 'Der Wert der Menschen bemisst sich nach dem, was sie verfolgen.',
      author: 'Ali ibn Abi Talib',
    },
    {
      text: 'Wissen, das erworben wird, ohne das Herz zu läutern, ist nichts als eine Last.',
      author: 'Imam al-Ghazali',
    },
    { text: 'Wissen ist die Nahrung des Geistes.', author: 'Ibn Sina' },
    {
      text: 'Eine tugendhafte Gesellschaft beginnt mit einem tugendhaften Menschen.',
      author: 'Al-Farabi',
    },
    { text: 'Wahrheit kann der Wahrheit nicht widersprechen.', author: 'Ibn Rushd' },
    {
      text: 'Selbst wenn ich weiß, dass ich recht habe, ziehe ich in Betracht, dass ich mich irren könnte.',
      author: 'Imam al-Schafi’i',
    },
    {
      text: 'Wissen wird nützlich, wenn es sich mit Weisheit verbindet.',
      author: 'Schah Waliullah Dehlawi',
    },
    {
      text: 'Einzugestehen, was man nicht weiß, ist ebenfalls eine Form des Wissens.',
      author: 'Abu Hanifa',
    },
    { text: 'Ein vernachlässigtes Herz wird dunkel.', author: 'Ibn Qayyim al-Dschauziyya' },
    {
      text: 'Die am meisten angenommene Tat ist jene, die beständig ausgeführt wird, auch wenn sie klein ist.',
      author: 'Imam al-Nawawi',
    },
    { text: 'Auch wenn du verletzt wirst, verletze andere nicht.', author: 'Haji Bektash Veli' },
    { text: 'Zivilisation beginnt mit Ideen.', author: 'Malek Bennabi' },
    {
      text: 'Der moderne Mensch ist einsam, weil er das Heilige verloren hat.',
      author: 'Seyyed Hossein Nasr',
    },
  ],
  it: [
    {
      text: 'Chi non rompe il guscio della noce per raggiungerne il cuore pensa che tutta la noce sia soltanto guscio.',
      author: 'Al-Ghazali',
    },
    {
      text: 'La prova più grande della stoltezza è insistere di avere sempre ragione.',
      author: 'Ibn Sina',
    },
    {
      text: 'Sarei servo per quarant’anni di chi mi insegna una sola lettera.',
      author: 'Ali ibn Abi Talib',
    },
    {
      text: 'Come l’acqua somiglia all’acqua, così il passato somiglia al futuro.',
      author: 'Ibn Khaldun',
    },
    {
      text: 'L’ignoranza genera paura, la paura genera odio, l’odio genera violenza.',
      author: 'Ibn Rushd',
    },
    { text: 'Anche se vieni ferito, non ferire gli altri.', author: 'Haji Bektash Veli' },
    { text: 'La porta si aprirà; devi solo sapere come bussare.', author: 'Shams Tabrizi' },
    {
      text: 'La verità non si trova cercandola, eppure solo chi cerca la trova.',
      author: 'Bayazid Bastami',
    },
    {
      text: 'Le parole sono come una medicina: poche guariscono, troppe uccidono.',
      author: 'Imam al-Shafi’i',
    },
    {
      text: 'La conoscenza che non viene messa in pratica è soltanto un peso.',
      author: 'Imam Abu Hanifa',
    },
    { text: 'Mantieni vive le persone affinché lo Stato possa vivere.', author: 'Sheikh Edebali' },
    {
      text: 'Il valore di una persona si misura da ciò che ricerca.',
      author: 'Saadi Shirazi',
    },
    {
      text: 'Solo chi cerca la verità conosce il valore della conoscenza.',
      author: 'Al-Biruni',
    },
    { text: 'La giustizia è il fondamento della sovranità.', author: 'Nizam al-Mulk' },
    {
      text: 'Un volto lavato dalle lacrime è il volto più bello.',
      author: 'Muhammad Iqbal',
    },
    {
      text: 'La filosofia consiste nel conoscere la realtà delle cose nella misura delle capacità umane.',
      author: 'Al-Kindi',
    },
    { text: 'Il successo è il frutto della pazienza.', author: 'Akshemseddin' },
    {
      text: 'La verità è la compagna più preziosa di chi cerca.',
      author: 'Abu Bakr al-Razi',
    },
    {
      text: 'Il valore delle persone si misura da ciò che perseguono.',
      author: 'Ali ibn Abi Talib',
    },
    {
      text: 'La conoscenza acquisita senza purificare il cuore non è altro che un peso.',
      author: 'Imam al-Ghazali',
    },
    { text: 'La conoscenza è il nutrimento della mente.', author: 'Ibn Sina' },
    {
      text: 'Una società virtuosa comincia da una persona virtuosa.',
      author: 'Al-Farabi',
    },
    { text: 'La verità non può contraddire la verità.', author: 'Ibn Rushd' },
    {
      text: 'Anche quando so di avere ragione, considero la possibilità di sbagliarmi.',
      author: 'Imam al-Shafi’i',
    },
    {
      text: 'La conoscenza diventa utile quando si unisce alla saggezza.',
      author: 'Shah Waliullah Dehlawi',
    },
    {
      text: 'Ammettere ciò che non si sa è anch’esso una forma di conoscenza.',
      author: 'Abu Hanifa',
    },
    { text: 'Un cuore trascurato diventa oscuro.', author: 'Ibn Qayyim al-Jawziyya' },
    {
      text: 'L’azione più accettata è quella compiuta con costanza, anche se piccola.',
      author: 'Imam al-Nawawi',
    },
    { text: 'Anche se vieni ferito, non ferire gli altri.', author: 'Haji Bektash Veli' },
    { text: 'La civiltà comincia dalle idee.', author: 'Malek Bennabi' },
    {
      text: 'L’uomo moderno è solo perché ha perduto il senso del sacro.',
      author: 'Seyyed Hossein Nasr',
    },
  ],
  tr: [
    {
      text: 'Ceviz kabuğunu kırıp özüne inmeyen, cevizin hepsini kabuk zanneder.',
      author: 'Gazzali',
    },
    {
      text: 'Aptallığın en büyük kanıtı, kendi haklılığında ısrar etmektir.',
      author: 'İbn-i Sina',
    },
    { text: 'Bana bir harf öğretenin kırk yıl kölesi olurum.', author: 'Hz. Ali' },
    { text: 'Suyun suya benzediği gibi, geçmiş de geleceğe benzer.', author: 'İbn Haldun' },
    { text: 'Cehalet korkuyu, korku nefreti, nefret şiddeti doğurur.', author: 'İbn Rüşd' },
    { text: 'İncinsen de incitme.', author: 'Hacı Bektaş Veli' },
    { text: 'Kapı açılır, sen yeter ki vurmayı bil.', author: 'Şems-i Tebrizi' },
    { text: "Hakk'ı aramakla bulunmaz; ancak bulanlar arayanlardır.", author: 'Bayezid-i Bistami' },
    { text: 'Söz ilaç gibidir; azı yaşatır, çoğu öldürür.', author: 'İmam Şafii' },
    { text: 'Bilgi, kendisiyle amel edilmediği sürece yüktür.', author: 'İmam Azam Ebu Hanife' },
    { text: 'İnsanı yaşat ki devlet yaşasın.', author: 'Şeyh Edebali' },
    { text: 'İnsanın değeri, aradığı şeyle ölçülür.', author: 'Sadi-i Şirazi' },
    { text: 'Ancak hakikati arayanlar, ilmin değerini bilir.', author: 'Biruni' },
    { text: 'Adalet, mülkün temelidir.', author: 'Nizamülmülk' },
    { text: 'Gözyaşı ile yıkanan yüz, en güzel yüzdür.', author: 'Muhammed İkbal' },
    {
      text: 'Felsefe, insanın gücü yettiği ölçüde eşyanın hakikatini bilmesidir.',
      author: 'Kindi',
    },
    { text: 'Başarı, sabrın meyvesidir.', author: 'Akşemseddin' },
    { text: 'Hakikat, arayanın en değerli yoldaşıdır.', author: 'Ebu Bekir er-Razi' },
    { text: 'İnsanların değeri, peşinde koştukları şey kadardır.', author: 'Hz. Ali' },
    { text: 'Kalbi ıslah etmeden yapılan ilim, yükten ibarettir.', author: 'İmam Gazali' },
    { text: 'Bilgi, aklın gıdasıdır.', author: 'İbn Sina' },
    { text: 'Erdemli toplum, erdemli insanla başlar.', author: 'Farabi' },
    { text: 'Hakikat, hakikate aykırı düşemez.', author: 'İbn Rüşd' },
    { text: 'Haklı olduğumu bilsem de yanılabileceğimi düşünürüm.', author: 'İmam Şafii' },
    { text: 'İlim, hikmetle birleşince faydalı olur.', author: 'Şah Veliyyullah Dehlevi' },
    { text: 'Bilmediğini söylemek de ilimdendir.', author: 'Ebu Hanife' },
    { text: 'Kalp, ihmal edilirse kararır.', author: 'İbn Kayyim el Cevziyye' },
    { text: 'Amelin makbul olanı, az da olsa devamlı olanıdır.', author: 'İmam Nevevi' },
    { text: 'İncinsen de incitme.', author: 'Hacı Bektaş Veli' },
    { text: 'Medeniyet, fikirle başlar.', author: 'Malik bin Nebi' },
    { text: 'Modern insan, kutsalı kaybettiği için yalnızdır.', author: 'Seyyid Hüseyin Nasr' },
  ],
};

const DEFAULT_LOCALE = 'en';

/**
 * 2. Get quote for today based on day of year and locale
 */

function get_daily_quote(locale) {
  const lang = QUOTES[locale] ? locale : DEFAULT_LOCALE;
  const pool = QUOTES[lang];

  const now = new Date();
  const start_of_year = new Date(now.getFullYear(), 0, 0);
  const diff = now - start_of_year;
  const day_of_year = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = day_of_year % pool.length;
  return pool[index];
}

export { QUOTES, get_daily_quote };
