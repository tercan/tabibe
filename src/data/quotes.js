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
