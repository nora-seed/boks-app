# RINGBOX — Boks Eğitim & Antrenman PWA

`https://nora-seed.github.io/boks-app/` için özel olarak hazırlanmış, derleme (build) gerektirmeyen, çevrimdışı çalışabilen (PWA) boks eğitim uygulaması.

## Özellikler
- **Raunt Zamanlayıcı:** Özelleştirilebilir raunt sayısı, süre, dinlenme, hazırlık, Web Audio API gong sesi, son 10 saniye tahta clapper ve 3-2-1 uyarıları.
- **Türkçe Sesli Kombinasyon Çağırıcı:** Seviyeye göre (Başlangıç, Orta, İleri, Savunma) sesli ve görsel komutlar; Ortodoks / Ters Gard (Solak) otomatik uyarlaması.
- **Eldiven Modu & Ekran Açık (Wake Lock):** Tam ekran büyük dokunma alanı ve antrenman boyunca telefon ekranının kapanmaması.
- **10 Kademeli Program:** Sıfırdan başlayarak 12 rauntluk şampiyonluk temposuna uzanan 4 seviyeli müfredat.
- **Teknik Kütüphanesi:** 14 temel teknik (Gard, 1-6 Yumruklar, Savunmalar, Ayak Oyunu) için animasyonlu SVG diyagramlar, adım adım form rehberi ve sık yapılan hatalar.
- **Kariyer & İlerleme Takibi:** Günlük seri (streak), XP ve rütbe sistemi, son 7 gün takibi ve `localStorage` kalıcı geçmiş.

## GitHub Pages Kurulumu (`nora-seed.github.io/boks-app`)
1. GitHub'da **`boks-app`** adında herkese açık (Public) bir repo oluşturun.
2. Bu klasördeki tüm dosyaları (`index.html`, `style.css`, `data.js`, `app.js`, `manifest.json`, `sw.js` ve `icons/` klasörü) reponun kök dizinine yükleyin.
3. Repo ayarlarından **Settings → Pages → Build and deployment → Source: Deploy from a branch** seçip `main` / `/(root)` dalını kaydedin.
4. 1-2 dakika içinde `https://nora-seed.github.io/boks-app/` adresinden yayına girer.
5. Telefonda tarayıcıdan açıp **"Ana Ekrana Ekle"** (iOS Safari: Paylaş → Ana Ekrana Ekle / Android Chrome: Yükle) diyerek tam ekran uygulama gibi kullanabilirsiniz.
