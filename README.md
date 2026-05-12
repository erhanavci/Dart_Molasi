# Dart Molası

Ofis molaları için Türkçe arayüzlü, PixiJS destekli arcade dart oyunu.

## Çalıştırma

```bash
npm install
npm run dev
```

## Özellikler

- React + Vite + TypeScript
- PixiJS skor altyapısı ve Three.js ile 3D dart sahnesi
- Hızlı 201, Bull Rush, Ofis Düellosu ve Patron Geliyor modları
- Hareketli Bullseye, parlayan double/triple hedefleri, kombo ve güçlendirmeler
- LocalStorage tabanlı skor tablosu ve ayarlar
- PWA manifest ve service worker
- Avatar/oyuncu profilleri
- Ekli grafik setinden sprite mapping ile logo, buton, skor paneli ve oyun ikonları
- Basılı tutup geriye çekerek güç belirleme ve 3D saplanan dart görseli
- Responsive, touch ve mouse destekli Türkçe arayüz

## Yayınlama

Vercel veya Netlify üzerinde `npm run build` komutu ve `dist` çıkış klasörü ile yayınlanabilir.
PWA desteği üretim build'inde aktifleşir; kullanıcı mobil tarayıcıdan ana ekrana ekleyebilir.
