/* =========================================================
   RINGBOX — Boks Eğitim Müfredatı, Teknikler & Kombolar
   ========================================================= */

const RINGBOX_DATA = (() => {
  // Stance-aware text resolver: Orthodox (lead=Sol, rear=Sağ) | Southpaw (lead=Sağ, rear=Sol)
  function adaptText(str, stance = 'orthodox') {
    const isOrtho = stance !== 'southpaw';
    const map = {
      '{LEAD}': isOrtho ? 'Sol' : 'Sağ',
      '{lead}': isOrtho ? 'sol' : 'sağ',
      '{REAR}': isOrtho ? 'Sağ' : 'Sol',
      '{rear}': isOrtho ? 'sağ' : 'sol',
      '{LEAD_FOOT}': isOrtho ? 'sol ayak' : 'sağ ayak',
      '{REAR_FOOT}': isOrtho ? 'sağ ayak' : 'sol ayak'
    };
    return str.replace(/\{(LEAD|lead|REAR|rear|LEAD_FOOT|REAR_FOOT)\}/g, (m) => map[m] || m);
  }

  // Animated SVG diagrams for boxing techniques
  const SVGS = {
    gard: `<svg viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="20" y1="102" x2="160" y2="102" stroke="#2D2D3D" stroke-width="2" stroke-dasharray="4 4"/>
      <ellipse cx="64" cy="96" rx="18" ry="7" fill="#E5192D" fill-opacity="0.28" stroke="#E5192D" stroke-width="2"/>
      <ellipse cx="118" cy="100" rx="18" ry="7" fill="#F5B700" fill-opacity="0.24" stroke="#F5B700" stroke-width="2"/>
      <circle cx="90" cy="34" r="14" stroke="#F8FAFC" stroke-width="2.5"/>
      <path d="M74 52 C74 46, 106 46, 106 52 L112 80 L68 80 Z" fill="#1E1E2B" stroke="#94A3B8" stroke-width="2"/>
      <g class="anim-pulse">
        <circle cx="72" cy="40" r="8" fill="#E5192D"/>
        <circle cx="104" cy="38" r="8" fill="#F5B700"/>
      </g>
      <text x="64" y="114" fill="#FF6B78" font-size="9" font-weight="700" text-anchor="middle">ÖN AYAK</text>
      <text x="118" y="114" fill="#F5B700" font-size="9" font-weight="700" text-anchor="middle">ARKA AYAK</text>
    </svg>`,

    jab: `<svg viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="90" cy="22" r="10" stroke="#94A3B8" stroke-width="2" stroke-dasharray="3 3"/>
      <circle cx="90" cy="86" r="14" fill="#1C1C26" stroke="#F8FAFC" stroke-width="2.5"/>
      <g class="anim-punch">
        <line x1="72" y1="80" x2="86" y2="34" stroke="#E5192D" stroke-width="5" stroke-linecap="round"/>
        <circle cx="86" cy="32" r="9" fill="#E5192D"/>
        <polygon points="86,18 92,28 80,28" fill="#F5B700"/>
      </g>
      <circle cx="108" cy="78" r="7" fill="#F5B700"/>
      <text x="142" y="34" fill="#FF6B78" font-size="11" font-weight="800">1 · JAB</text>
    </svg>`,

    cross: `<svg viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="90" cy="22" r="10" stroke="#94A3B8" stroke-width="2" stroke-dasharray="3 3"/>
      <circle cx="90" cy="86" r="14" fill="#1C1C26" stroke="#F8FAFC" stroke-width="2.5"/>
      <circle cx="72" cy="78" r="7" fill="#94A3B8"/>
      <g class="anim-punch">
        <line x1="108" y1="82" x2="92" y2="32" stroke="#F5B700" stroke-width="6" stroke-linecap="round"/>
        <circle cx="92" cy="30" r="10" fill="#E5192D" stroke="#F5B700" stroke-width="2"/>
      </g>
      <path d="M114 96 A24 24 0 0 1 88 106" stroke="#F5B700" stroke-width="2" stroke-dasharray="3 3"/>
      <text x="138" y="34" fill="#F5B700" font-size="11" font-weight="800">2 · CROSS</text>
    </svg>`,

    hookLead: `<svg viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="92" cy="26" r="11" stroke="#94A3B8" stroke-width="2" stroke-dasharray="3 3"/>
      <circle cx="92" cy="86" r="14" fill="#1C1C26" stroke="#F8FAFC" stroke-width="2.5"/>
      <g class="anim-hook">
        <path d="M68 78 Q42 46 82 28" stroke="#E5192D" stroke-width="5.5" stroke-linecap="round" fill="none"/>
        <circle cx="83" cy="28" r="9" fill="#E5192D"/>
      </g>
      <circle cx="110" cy="78" r="7" fill="#F5B700"/>
      <text x="142" y="34" fill="#FF6B78" font-size="11" font-weight="800">3 · KROŞE</text>
    </svg>`,

    hookRear: `<svg viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="88" cy="26" r="11" stroke="#94A3B8" stroke-width="2" stroke-dasharray="3 3"/>
      <circle cx="88" cy="86" r="14" fill="#1C1C26" stroke="#F8FAFC" stroke-width="2.5"/>
      <circle cx="70" cy="78" r="7" fill="#94A3B8"/>
      <g class="anim-hook">
        <path d="M112 78 Q138 46 98 28" stroke="#F5B700" stroke-width="5.5" stroke-linecap="round" fill="none"/>
        <circle cx="97" cy="28" r="9" fill="#F5B700"/>
      </g>
      <text x="38" y="34" fill="#F5B700" font-size="11" font-weight="800">4 · KROŞE</text>
    </svg>`,

    upperLead: `<svg viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="92" cy="24" r="11" stroke="#94A3B8" stroke-width="2" stroke-dasharray="3 3"/>
      <path d="M72 96 C60 72, 74 52, 90 32" stroke="#E5192D" stroke-width="5" stroke-linecap="round" class="anim-punch"/>
      <circle cx="90" cy="34" r="9" fill="#E5192D" class="anim-punch"/>
      <line x1="36" y1="102" x2="144" y2="102" stroke="#2D2D3D" stroke-width="2"/>
      <text x="138" y="36" fill="#FF6B78" font-size="10" font-weight="800">5 · APARKAT</text>
    </svg>`,

    upperRear: `<svg viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="88" cy="24" r="11" stroke="#94A3B8" stroke-width="2" stroke-dasharray="3 3"/>
      <path d="M108 96 C120 72, 106 52, 90 32" stroke="#F5B700" stroke-width="5" stroke-linecap="round" class="anim-punch"/>
      <circle cx="90" cy="34" r="9" fill="#F5B700" class="anim-punch"/>
      <line x1="36" y1="102" x2="144" y2="102" stroke="#2D2D3D" stroke-width="2"/>
      <text x="40" y="36" fill="#F5B700" font-size="10" font-weight="800">6 · APARKAT</text>
    </svg>`,

    slip: `<svg viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="90" y1="12" x2="90" y2="62" stroke="#E5192D" stroke-width="4" stroke-dasharray="5 4"/>
      <polygon points="90,68 84,56 96,56" fill="#E5192D"/>
      <g class="anim-slip">
        <circle cx="90" cy="64" r="15" fill="#1C1C26" stroke="#F5B700" stroke-width="3"/>
        <circle cx="72" cy="66" r="7" fill="#F8FAFC"/>
        <circle cx="108" cy="66" r="7" fill="#F8FAFC"/>
      </g>
      <text x="90" y="108" fill="#F5B700" font-size="10" font-weight="800" text-anchor="middle">MERKEZ HATTAN KAÇIŞ</text>
    </svg>`,

    bobWeave: `<svg viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M35 34 L145 34" stroke="#E5192D" stroke-width="4" stroke-dasharray="6 4"/>
      <path d="M56 54 Q90 96 124 54" stroke="#F5B700" stroke-width="2.5" stroke-dasharray="4 4" fill="none"/>
      <g class="anim-bob">
        <circle cx="90" cy="54" r="14" fill="#1C1C26" stroke="#10B981" stroke-width="3"/>
      </g>
      <text x="90" y="108" fill="#10B981" font-size="10" font-weight="800" text-anchor="middle">U HARFİ EĞİLİŞ</text>
    </svg>`,

    block: `<svg viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="90" cy="56" r="18" fill="#1C1C26" stroke="#94A3B8" stroke-width="2"/>
      <rect x="65" y="34" width="20" height="40" rx="9" fill="#E5192D" stroke="#F8FAFC" stroke-width="2"/>
      <rect x="95" y="34" width="20" height="40" rx="9" fill="#E5192D" stroke="#F8FAFC" stroke-width="2"/>
      <path d="M32 54 L60 54" stroke="#F5B700" stroke-width="4" stroke-linecap="round" class="anim-pulse"/>
      <text x="90" y="104" fill="#F8FAFC" font-size="10" font-weight="800" text-anchor="middle">SIKI YÜKSEK GARD</text>
    </svg>`,

    parry: `<svg viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="90" y1="14" x2="90" y2="62" stroke="#E5192D" stroke-width="4"/>
      <path d="M90 54 Q76 58 64 48" stroke="#F5B700" stroke-width="4" stroke-linecap="round" class="anim-pulse"/>
      <circle cx="90" cy="84" r="14" fill="#1C1C26" stroke="#F8FAFC" stroke-width="2.5"/>
      <circle cx="104" cy="56" r="9" fill="#F5B700" class="anim-slip"/>
      <text x="90" y="112" fill="#F5B700" font-size="10" font-weight="800" text-anchor="middle">YÖN SAPTIRMA (PARRY)</text>
    </svg>`,

    pull: `<svg viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="40" y1="48" x2="96" y2="48" stroke="#E5192D" stroke-width="4" stroke-dasharray="5 4"/>
      <g class="anim-slip">
        <circle cx="114" cy="48" r="14" fill="#1C1C26" stroke="#38BDF8" stroke-width="3"/>
        <line x1="114" y1="62" x2="104" y2="96" stroke="#F8FAFC" stroke-width="3"/>
      </g>
      <text x="90" y="112" fill="#38BDF8" font-size="10" font-weight="800" text-anchor="middle">GERİ ÇEKİL & KONTRA</text>
    </svg>`,

    stepDrag: `<svg viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="56" cy="52" rx="18" ry="8" fill="#E5192D" fill-opacity="0.3" stroke="#E5192D" stroke-width="2"/>
      <ellipse cx="108" cy="72" rx="18" ry="8" fill="#F5B700" fill-opacity="0.25" stroke="#F5B700" stroke-width="2"/>
      <path d="M56 36 L56 16" stroke="#E5192D" stroke-width="3" stroke-linecap="round"/>
      <polygon points="56,12 50,20 62,20" fill="#E5192D"/>
      <path d="M126 72 L148 72" stroke="#F5B700" stroke-width="3" stroke-linecap="round"/>
      <polygon points="154,72 146,66 146,78" fill="#F5B700"/>
      <text x="90" y="106" fill="#94A3B8" font-size="10" font-weight="800" text-anchor="middle">AYAKLAR ASLA ÇAPRAZLANMAZ</text>
    </svg>`,

    pivot: `<svg viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="75" r="9" fill="#E5192D"/>
      <g class="anim-pivot">
        <line x1="80" y1="75" x2="132" y2="75" stroke="#F5B700" stroke-width="3" stroke-dasharray="4 3"/>
        <circle cx="132" cy="75" r="9" fill="#F5B700"/>
      </g>
      <path d="M132 75 A52 52 0 0 0 116 36" stroke="#10B981" stroke-width="2.5" fill="none"/>
      <text x="90" y="108" fill="#10B981" font-size="10" font-weight="800" text-anchor="middle">ÖN AYAK ÜZERİNDE PİVOT</text>
    </svg>`
  };

  // Punch Legend (1-6)
  const PUNCH_LEGEND = [
    { num: '1', name: 'Jab ({LEAD})' },
    { num: '2', name: 'Cross ({REAR})' },
    { num: '3', name: '{LEAD} Kroşe' },
    { num: '4', name: '{REAR} Kroşe' },
    { num: '5', name: '{LEAD} Aparkat' },
    { num: '6', name: '{REAR} Aparkat' }
  ];

  // Technique Library (14 Core Techniques)
  const TECHNIQUES = [
    {
      id: 'gard',
      category: 'gard',
      catLabel: 'GARD & DURUŞ',
      level: 'Seviye 1',
      title: 'Temel Boks Gardı',
      svg: SVGS.gard,
      summary: 'Denge, güç üretimi ve savunmanın temelidir. {LEAD_FOOT} önde, {REAR_FOOT} çapraz arkada, çene göğse yakın durur.',
      steps: [
        'Ayakları omuz genişliğinde aç; {LEAD_FOOT} önde, {REAR_FOOT} 45 derece açıyla arkada ve topuk hafif havada olsun.',
        'Dizleri hafifçe bük; ağırlığını iki ayak arasında %50-%50 dengeli dağıt.',
        '{REAR} elini çene/yanak hizasına yapıştır, {LEAD} elini göz hizasında bir yumruk önde tut.',
        'Dirseklerini kaburgalarına yakın kapat, çeneni hafifçe aşağı eğ ve kaş altından bak.'
      ],
      mistakes: [
        'Ayakları tek düz çizgide (ip üstünde yürür gibi) hizalamak dengeyi bozar.',
        'Dirsekleri dışarı açmak gövdeyi aparkat ve gövde kroşelerine açık bırakır.',
        'Çeneyi yukarıda tutmak savunmasız hedef yaratır.'
      ],
      practicePool: 'beginner'
    },
    {
      id: 'punch-1',
      category: 'yumruk',
      catLabel: 'YUMRUK · 1',
      level: 'Seviye 1',
      title: '1 · Jab ({LEAD} Direkt)',
      svg: SVGS.jab,
      summary: 'Boksun en önemli yumruğu. Mesafe ölçer, rakibin ritmini bozar ve güçlü kombinasyonları hazırlar.',
      steps: [
        '{LEAD} elini dirseği dışa açmadan düz bir çizgide hedefe fırlat.',
        'Vuruş anında bileğini içeri çevir (avuç içi yere baksın) ve {LEAD} omzunu çeneni koruyacak şekilde hafifçe kaldır.',
        '{REAR} elini kesinlikle çenenden ayırma.',
        'Vurduğun hızdan daha hızlı şekilde elini doğrudan gardına geri çek.'
      ],
      mistakes: [
        'Vurmadan önce eli geri çekerek (telgraf çekerek) rakibe haber vermek.',
        'Yumruk sonrası eli göğüs hizasına düşürmek.',
        'Nefesi tutmak — her vuruşta kısa ve keskin nefes ver.'
      ],
      practicePool: 'beginner'
    },
    {
      id: 'punch-2',
      category: 'yumruk',
      catLabel: 'YUMRUK · 2',
      level: 'Seviye 1',
      title: '2 · Cross ({REAR} Direkt)',
      svg: SVGS.cross,
      summary: 'Arka elden gelen yüksek güçlü düz yumruk. Gücünü koldan değil, arka ayak ve kalça dönüşünden alır.',
      steps: [
        '{REAR_FOOT} parmak ucu üzerinde dönerek topuğu dışa çevir ve kalçanı öne doğru döndür.',
        '{REAR} elini çenenden düz bir hat boyunca tam uzatarak çıkar.',
        'Vuruş sırasında {LEAD} elini sıkıca çenende savunmada tut.',
        'Ağırlığını hafifçe öne aktar ama ön dizinin ilerisine devrilme.'
      ],
      mistakes: [
        'Sadece kol gücüyle vurup arka ayağı ve kalçayı döndürmemek.',
        'Öne aşırı eğilerek dengeyi kaybetmek.',
        'Cross atarken ön eli bel hizasına indirmek.'
      ],
      practicePool: 'beginner'
    },
    {
      id: 'punch-3',
      category: 'yumruk',
      catLabel: 'YUMRUK · 3',
      level: 'Seviye 2',
      title: '3 · {LEAD} Kroşe (Lead Hook)',
      svg: SVGS.hookLead,
      summary: 'Orta ve yakın mesafede rakibin gardının yanından dolanan yıkıcı dairesel yumruk.',
      steps: [
        'Ağırlığını hafifçe ön bacağa yükle, ardından {LEAD_FOOT} topuğunu döndürerek gövdeni ters yöne çevir.',
        'Dirseğini yaklaşık 90 derece bükülü ve omuz hizasında tut.',
        'Bilek düz, avuç içi sana (veya yere) bakacak şekilde kısa bir yay çiz.',
        '{REAR} elini şakağında/çenende kilitle.'
      ],
      mistakes: [
        'Kolu arkaya çok fazla savurarak geniş ve yavaş vurmak.',
        'Dirseği bilekten aşağıda tutmak bilek sakatlığına yol açar.',
        'Kroşeyi kol ile savurup kalçayı sabit bırakmak.'
      ],
      practicePool: 'intermediate'
    },
    {
      id: 'punch-4',
      category: 'yumruk',
      catLabel: 'YUMRUK · 4',
      level: 'Seviye 2',
      title: '4 · {REAR} Kroşe (Rear Hook)',
      svg: SVGS.hookRear,
      summary: 'Arka elden gelen sert yan vuruş. Özellikle yakın mesafe çatışmalarında ve kontra ataklarda etkilidir.',
      steps: [
        '{REAR_FOOT} üzerinde pivot yaparak kalçanı ve arka omzunu öne çevir.',
        'Dirseği 90 derece bükülü kaldır ve kısa, sıkı bir kavisle hedefe vur.',
        '{LEAD} elinle çeneni tamamen kapat.',
        'Vuruş sonunda merkeze dönerek hemen savunma pozisyonunu al.'
      ],
      mistakes: [
        'Uzak mesafeden 4 numara atmaya çalışarak açık vermek.',
        'Başını dik ve hareketsiz bırakmak.'
      ],
      practicePool: 'intermediate'
    },
    {
      id: 'punch-5',
      category: 'yumruk',
      catLabel: 'YUMRUK · 5',
      level: 'Seviye 2',
      title: '5 · {LEAD} Aparkat',
      svg: SVGS.upperLead,
      summary: 'Rakibin gardının ortasından aşağıdan yukarıya yükselen keskin çene veya solar pleksus yumruğu.',
      steps: [
        'Dizlerini hafifçe bükerek {LEAD} omzunu çok kısa bir açıyla aşağı düşür.',
        'Bacak itişi ve kalça dönüşüyle yumruğu avuç içi sana bakacak şekilde yukarı fırlat.',
        'Vuruş gücünü yerden al; kolu beline kadar indirme.',
        '{REAR} elin çenede kalsın.'
      ],
      mistakes: [
        'Elini bele kadar indirip kocaman bir yay çizmek.',
        'Sadece kolu yukarı kaldırmak, bacak itişini kullanmamak.'
      ],
      practicePool: 'intermediate'
    },
    {
      id: 'punch-6',
      category: 'yumruk',
      catLabel: 'YUMRUK · 6',
      level: 'Seviye 2',
      title: '6 · {REAR} Aparkat',
      svg: SVGS.upperRear,
      summary: 'Arka bacak ve kalça patlamasıyla çıkan, rakibin yüksek gardını yaran güçlü aparkat.',
      steps: [
        'Arka dizini hafifçe kır, arka topuğu çevirerek ağırlığı yukarı ve öne it.',
        '{REAR} yumruğunu dirseği vücuda yakın tutarak çene hattına doğru yükselt.',
        'Vuruş sonunda elini hemen çenene geri çek.'
      ],
      mistakes: [
        'Kafayı öne çok eğerek rakibin kroşesine hedef olmak.',
        'Çene açık bırakmak.'
      ],
      practicePool: 'intermediate'
    },
    {
      id: 'def-slip',
      category: 'savunma',
      catLabel: 'SAVUNMA',
      level: 'Seviye 2',
      title: 'Slip (Sağa / Sola Kaçış)',
      svg: SVGS.slip,
      summary: 'Düz yumruklardan (1 ve 2) başı merkez hattan birkaç santim kaydırarak kaçıp anında kontra pozisyonu alma tekniği.',
      steps: [
        'Sadece boynunu değil, dizlerini ve belini hafifçe kırarak üst gövdeni 45 derece döndür.',
        'Gelen yumruğun dış tarafına başını bir yumruk genişliği kadar kaydır.',
        'Gözlerini kesinlikle rakipten ayırma ve ellerini yüzünde tut.',
        'Ağırlığın yüklendiği taraftaki elinle anında kontra çıkar (ör. {LEAD} slip -> 3 veya 5).'
      ],
      mistakes: [
        'Belden aşırı yana yatıp dengeyi kaybetmek.',
        'Gözleri kapatmak veya yere bakmak.'
      ],
      practicePool: 'defense'
    },
    {
      id: 'def-bob',
      category: 'savunma',
      catLabel: 'SAVUNMA',
      level: 'Seviye 2',
      title: 'Bob & Weave (Eğil ve Çık)',
      svg: SVGS.bobWeave,
      summary: 'Kroşelerin altından dizleri kırarak akıcı bir "U" harfi çizerek geçme tekniği.',
      steps: [
        'Belden öne eğilmek yerine dizlerini bükerek alçal (squat hissiyatı).',
        'Gelen kroşenin yönüne doğru başınla yumuşak bir "U" çizip diğer taraftan yüksel.',
        'Tüm hareket boyunca gözler rakibin göğsünde/gözünde, eller gardda kalır.',
        'Yükseldiğin anda kroşe veya aparkatla karşılık ver.'
      ],
      mistakes: [
        'Dizleri kırmadan sırtı bükerek yere bakmak — aparkata açık hedef olur.',
        'Ellerin göğüs hizasına düşmesi.'
      ],
      practicePool: 'defense'
    },
    {
      id: 'def-block',
      category: 'savunma',
      catLabel: 'SAVUNMA',
      level: 'Seviye 1',
      title: 'Yüksek Blok (High Guard)',
      svg: SVGS.block,
      summary: 'Seri yumruklara karşı eldivenleri alın ve şakaklara kilitleyerek darbeyi soğuran temel kalkan.',
      steps: [
        'Eldivenlerini kaş hizasında sıkıca birleştir, dirseklerini öne kapat.',
        'Gövdeni hafifçe sıkılaştır ve darbeyi geri savrulmadan dizlerle em.',
        'Eldivenlerin arasından küçük bir boşluktan rakibi izlemeye devam et.'
      ],
      mistakes: [
        'Eldivenleri yüzünden uzakta tutmak (kendi eldivenin yüzüne çarpar).',
        'Blok yaptıktan sonra hareketsiz beklemek — hemen açı değiştir veya kontra at.'
      ],
      practicePool: 'defense'
    },
    {
      id: 'def-parry',
      category: 'savunma',
      catLabel: 'SAVUNMA',
      level: 'Seviye 3',
      title: 'Parry (Yön Saptırma)',
      svg: SVGS.parry,
      summary: 'Gelen direkt yumruğu avuç içi / eldiven yanıyla hafifçe yana iterek rakibin dengesini bozma.',
      steps: [
        'Gelen 1 (Jab) yumruğunu {REAR} elinle çene önünden çok kısa bir dokunuşla içeri/yana it.',
        'Kolu öne uzatıp yumruğu kovalamak yerine yüzüne yaklaşınca saptır.',
        'Rakibin kolu boşa düştüğü an aynı taraftan 1 veya 2 ile anında karşılık ver.'
      ],
      mistakes: [
        'Yumruğu yakalamak için kolu çok öne uzatmak (sahte hamlelere yakalanırsın).',
        'Aşırı büyük hareketle kendi yüzünü açık bırakmak.'
      ],
      practicePool: 'defense'
    },
    {
      id: 'def-pull',
      category: 'savunma',
      catLabel: 'SAVUNMA',
      level: 'Seviye 3',
      title: 'Geri Çekme (Pull Counter)',
      svg: SVGS.pull,
      summary: 'Ağırlığı anlık arka bacağa kaydırarak yumruğu milimetrelerle boşa düşürüp sert Cross (2) ile cevap verme.',
      steps: [
        'Ayaklarını yerden kaldırmadan ağırlığını hızla arka bacağa aktar ve üst gövdeyi hafif geri yasla.',
        'Çeneni göğse bastır, ön elinle mesafeyi kontrol et.',
        'Rakibin yumruğu boşa çıktığı salisede arka bacak yaylanmasıyla 2 (Cross) patlat.'
      ],
      mistakes: [
        'Çeneyi havaya kaldırarak geri yatmak.',
        'İplere sırtı dönükken geri çekmeye çalışmak.'
      ],
      practicePool: 'advanced'
    },
    {
      id: 'foot-step',
      category: 'ayak',
      catLabel: 'AYAK OYUNU',
      level: 'Seviye 1',
      title: 'Temel Adım (Step & Drag)',
      svg: SVGS.stepDrag,
      summary: 'Ringde dengeni hiç bozmadan her yöne hareket etmenin altın kuralı: Gideceğin yöndeki ayak önce gider.',
      steps: [
        'İleri giderken önce {LEAD_FOOT} adım atar, sonra {REAR_FOOT} aynı mesafede takip eder.',
        'Geri giderken önce {REAR_FOOT}, sonra {LEAD_FOOT} gelir.',
        'Sola giderken önce sol ayak, sağa giderken önce sağ ayak hareket eder.',
        'Adımlar kısa ve hafif olsun; ayakların asla birbirine yaklaşmasın veya çaprazlanmasın.'
      ],
      mistakes: [
        'Ayakları birbirine yaklaştırmak veya çaprazlamak (en hafif darbede düşersin).',
        'Topuklar üzerinde ağır yürümek.'
      ],
      practicePool: 'beginner'
    },
    {
      id: 'foot-pivot',
      category: 'ayak',
      catLabel: 'AYAK OYUNU',
      level: 'Seviye 3',
      title: 'Pivot & Açı Değiştirme',
      svg: SVGS.pivot,
      summary: 'Rakibin hücum hattından çıkıp yan açısına geçerek savunmasız hedef yakalama manevrası.',
      steps: [
        'Ağırlığını hafifçe {LEAD_FOOT} parmak ucuna ver.',
        '{LEAD_FOOT} sabit eksen olarak kalırken {REAR_FOOT} ayağını 45-90 derece yay çizerek yana/arkaya çevir.',
        'Pivotu genellikle 1-2 veya 3 (kroşe) sonrasında rakibin gücünden çıkmak için kullan.',
        'Dönüş bittiğinde gardın hazır ve rakibe dönük olmalı.'
      ],
      mistakes: [
        'Dönerken ayakları sürükleyip dengesiz kalmak.',
        'Pivot sırasında elleri aşağı indirmek.'
      ],
      practicePool: 'advanced'
    }
  ];

  // Combo Database (Tokens: 1-6, EĞİL, SLİP SOL, SLİP SAĞ, BLOK, GERİ, PİVOT, GÖVDE)
  const COMBO_POOLS = {
    beginner: [
      { badges: ['1'], text: '1 — Tek {LEAD} Direkt (Jab)!', say: 'Bir! {lead} direkt!' },
      { badges: ['1', '1'], text: '1-1 — Çift Jab!', say: 'Bir, bir! Çift jab!' },
      { badges: ['1', '2'], text: '1-2 — {LEAD} Direkt, {REAR} Direkt!', say: 'Bir, iki!' },
      { badges: ['1', '1', '2'], text: '1-1-2 — Çift Jab ve Güçlü {REAR}!', say: 'Bir, bir, iki!' },
      { badges: ['1', '2', 'BLOK'], text: '1-2 ve Yüksek Blok!', say: 'Bir, iki, blok!' },
      { badges: ['2', '1'], text: '2-1 — {REAR} Direkt, {LEAD} Jab!', say: 'İki, bir!' },
      { badges: ['1', '2', 'GERİ'], text: '1-2 ve Adım Geri!', say: 'Bir, iki, geri çık!' },
      { badges: ['1', '2', '1'], text: '1-2-1 — Üçlü Direkt!', say: 'Bir, iki, bir!' }
    ],
    intermediate: [
      { badges: ['1', '2', '3'], text: '1-2-3 — Direktler ve {LEAD} Kroşe!', say: 'Bir, iki, üç!' },
      { badges: ['1', '2', '3', '2'], text: '1-2-3-2 — Klasik Dörtlü!', say: 'Bir, iki, üç, iki!' },
      { badges: ['1', '2', 'EĞİL'], text: '1-2, Hemen Eğil (Bob & Weave)!', say: 'Bir, iki, eğil!' },
      { badges: ['1', '6', '3'], text: '1-6-3 — Jab, {REAR} Aparkat, {LEAD} Kroşe!', say: 'Bir, altı, üç!' },
      { badges: ['2', '3', '2'], text: '2-3-2 — {REAR}, {LEAD} Kroşe, {REAR}!', say: 'İki, üç, iki!' },
      { badges: ['1', '5', '2'], text: '1-5-2 — Jab, {LEAD} Aparkat, Cross!', say: 'Bir, beş, iki!' },
      { badges: ['SLİP', '2', '3'], text: 'Slip Kaçış, Kontra 2-3!', say: 'Slip! İki, üç!' },
      { badges: ['1', '2', '3B'], text: '1-2, Gövdeye {LEAD} Kroşe!', say: 'Bir, iki, gövde kroşe!' },
      { badges: ['3', '4', 'EĞİL'], text: '3-4 — Çift Kroşe ve Eğil!', say: 'Üç, dört, eğil!' },
      { badges: ['1', '1', '2', '3'], text: '1-1-2-3 — Baskı Serisi!', say: 'Bir, bir, iki, üç!' }
    ],
    advanced: [
      { badges: ['1', '2', 'SLİP', '3', '2'], text: '1-2, Slip, Kontra 3-2!', say: 'Bir, iki, slip! Üç, iki!' },
      { badges: ['1', '2', '3', 'EĞİL', '6', '3'], text: '1-2-3, Eğil, 6-3 Aparkat Kroşe!', say: 'Bir, iki, üç! Eğil! Altı, üç!' },
      { badges: ['GERİ', '2', '3', '2'], text: 'Pull Counter: Geri Çek, 2-3-2!', say: 'Geri çek! İki, üç, iki!' },
      { badges: ['1', '2', 'PİVOT', '2', '3'], text: '1-2, Pivot Açı Değiştir, 2-3!', say: 'Bir, iki, pivot! İki, üç!' },
      { badges: ['1', '6', '3', '2', 'EĞİL'], text: '1-6-3-2 ve Eğilerek Çık!', say: 'Bir, altı, üç, iki, eğil!' },
      { badges: ['1', '2B', '3', '2'], text: 'Jab, Gövdeye 2, Başa 3-2!', say: 'Bir, gövde iki, başa üç, iki!' },
      { badges: ['PARRY', '1', '2', '3', '4'], text: 'Parry Saptır, 1-2-3-4 Yağdır!', say: 'Parry! Bir, iki, üç, dört!' },
      { badges: ['5', '6', '3', '2', 'PİVOT'], text: '5-6 Aparkat, 3-2, Pivot Çık!', say: 'Beş, altı, üç, iki, pivot!' },
      { badges: ['1', '1', '2', 'EĞİL', '3B', '3'], text: '1-1-2, Eğil, Gövde ve Başa 3!', say: 'Bir, bir, iki, eğil! Gövde üç, başa üç!' }
    ],
    defense: [
      { badges: ['SLİP', 'SLİP', '2'], text: 'Sol Slip, Sağ Slip, Kontra 2!', say: 'Slip, slip, iki!' },
      { badges: ['EĞİL', '3', '2'], text: 'Kroşeden Eğil, 3-2 Cevap Ver!', say: 'Eğil! Üç, iki!' },
      { badges: ['BLOK', 'BLOK', '6', '3'], text: 'Çift Blok, 6-3 Kontra!', say: 'Blok, blok! Altı, üç!' },
      { badges: ['PARRY', '2', '3'], text: 'Jab Saptır (Parry), 2-3!', say: 'Parry! İki, üç!' },
      { badges: ['GERİ', '2', 'PİVOT'], text: 'Geri Çek, Sert 2, Pivotla Çık!', say: 'Geri çek, iki, pivot!' },
      { badges: ['1', '2', 'EĞİL', 'PİVOT'], text: '1-2 Vur, Eğil ve Pivotla Kaç!', say: 'Bir, iki, eğil, pivot!' },
      { badges: ['SLİP', '5', '2'], text: 'İçe Slip, 5 Aparkat ve 2!', say: 'Slip! Beş, iki!' }
    ]
  };

  // 10 Progressive Training Programs (Sıfırdan İleri Seviyeye)
  const PROGRAMS = [
    {
      id: 'prog-1',
      level: 1,
      levelName: 'Seviye 1 · Sıfırdan',
      title: 'İlk Gün: Gard & 1-2 Temeli',
      desc: 'Boksa ilk adım. Gardını koruyarak temiz Jab (1) ve Cross (2) atma alışkanlığı kazandırır.',
      rounds: 3,
      roundSec: 120,
      restSec: 60,
      prepSec: 5,
      comboLevel: 'beginner',
      cadenceMs: 6000,
      xp: 80,
      focus: 'Gard · 1-2 Direkt'
    },
    {
      id: 'prog-2',
      level: 1,
      levelName: 'Seviye 1 · Sıfırdan',
      title: 'Ritim, Nefes ve Çift Jab',
      desc: 'Ayak-el koordinasyonu, her yumrukta nefes kontrolü ve 1-1-2 ritmini oturtma antrenmanı.',
      rounds: 4,
      roundSec: 120,
      restSec: 45,
      prepSec: 5,
      comboLevel: 'beginner',
      cadenceMs: 5200,
      xp: 100,
      focus: 'Nefes · Çift Jab'
    },
    {
      id: 'prog-3',
      level: 1,
      levelName: 'Seviye 1 · Sıfırdan',
      title: 'Temel Gölge Boksu & Mesafe',
      desc: 'Step & Drag adımlarıyla ringde gezerek vur-çık refleksi geliştirir.',
      rounds: 4,
      roundSec: 150,
      restSec: 45,
      prepSec: 5,
      comboLevel: 'beginner',
      cadenceMs: 4800,
      xp: 120,
      focus: 'Gölge Boksu · Ayak'
    },
    {
      id: 'prog-4',
      level: 2,
      levelName: 'Seviye 2 · Gelişim',
      title: '1-2-3 Kroşe Akışı',
      desc: 'Kalça dönüşünü kullanarak direkt yumrukları sert ön kroşeye bağlama çalışması.',
      rounds: 5,
      roundSec: 150,
      restSec: 45,
      prepSec: 5,
      comboLevel: 'intermediate',
      cadenceMs: 4500,
      xp: 150,
      focus: 'Kroşe · Kalça Dönüşü'
    },
    {
      id: 'prog-5',
      level: 2,
      levelName: 'Seviye 2 · Gelişim',
      title: 'Yakın Mesafe: Aparkat & Gövde',
      desc: '5 ve 6 numaralı aparkatlarla seviye değiştirme (baş-gövde kombinasyonları).',
      rounds: 5,
      roundSec: 180,
      restSec: 60,
      prepSec: 5,
      comboLevel: 'intermediate',
      cadenceMs: 4300,
      xp: 170,
      focus: 'Aparkat · Gövde'
    },
    {
      id: 'prog-6',
      level: 2,
      levelName: 'Seviye 2 · Gelişim',
      title: 'Vur ve Kaç: Savunma Refleksi',
      desc: 'Her kombinasyon sonrası Slip, Bob & Weave veya Yüksek Blok ekleyerek açık vermemeyi öğretir.',
      rounds: 6,
      roundSec: 150,
      restSec: 45,
      prepSec: 5,
      comboLevel: 'defense',
      cadenceMs: 4200,
      xp: 180,
      focus: 'Slip · Bob & Weave'
    },
    {
      id: 'prog-7',
      level: 3,
      levelName: 'Seviye 3 · Orta',
      title: 'Kum Torbası Güç & Kombinasyon',
      desc: '3 dakikalık gerçek maç rauntlarıyla yüksek hacimli 4-5 yumruklu kombinasyonlar.',
      rounds: 6,
      roundSec: 180,
      restSec: 60,
      prepSec: 5,
      comboLevel: 'intermediate',
      cadenceMs: 3600,
      xp: 220,
      focus: 'Kum Torbası · Güç'
    },
    {
      id: 'prog-8',
      level: 3,
      levelName: 'Seviye 3 · Orta',
      title: 'Kontra Atak ve Pivot Açı',
      desc: 'Parry, Pull Counter ve Pivot ile rakibin hücumunu boşa çıkarıp yan açıdan cezalandırma.',
      rounds: 8,
      roundSec: 180,
      restSec: 60,
      prepSec: 5,
      comboLevel: 'advanced',
      cadenceMs: 3500,
      xp: 260,
      focus: 'Kontra · Pivot'
    },
    {
      id: 'prog-9',
      level: 4,
      levelName: 'Seviye 4 · İleri',
      title: 'HIIT Ring Kondisyonu',
      desc: 'Kısa dinlenme, hızlı sesli komutlar ve aralıksız tempo. Dayanıklılık ve patlayıcılık testi.',
      rounds: 8,
      roundSec: 180,
      restSec: 45,
      prepSec: 5,
      comboLevel: 'advanced',
      cadenceMs: 2600,
      xp: 310,
      focus: 'HIIT · Yüksek Tempo'
    },
    {
      id: 'prog-10',
      level: 4,
      levelName: 'Seviye 4 · İleri',
      title: '12 Raunt Şampiyonluk Maçı',
      desc: 'Tam profesyonel maç süresi: 12×3 dakika. Tüm yumruklar, savunmalar ve kontra seriler devrede.',
      rounds: 12,
      roundSec: 180,
      restSec: 60,
      prepSec: 10,
      comboLevel: 'advanced',
      cadenceMs: 3000,
      xp: 450,
      focus: 'Pro Maç · Tam Cephanelik'
    }
  ];

  // Career Ranks
  const RANKS = [
    { name: 'Çaylak', minXp: 0, emblem: '🥊' },
    { name: 'Amatör Dövüşçü', minXp: 150, emblem: '🔥' },
    { name: 'Kulüp Boksörü', minXp: 450, emblem: '⚡' },
    { name: 'Bölge Şampiyonu', minXp: 1000, emblem: '🏅' },
    { name: 'Profesyonel', minXp: 2000, emblem: '🏆' },
    { name: 'Dünya Şampiyonu', minXp: 3800, emblem: '👑' }
  ];

  return {
    adaptText,
    PUNCH_LEGEND,
    TECHNIQUES,
    COMBO_POOLS,
    PROGRAMS,
    RANKS
  };
})();
