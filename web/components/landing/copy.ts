export type LandingLanguage = "en" | "ko" | "fr";

type LandingFeature = {
  img: string;
  title: string;
  desc: string;
};

type LandingExample = {
  src: string;
  alt: string;
  label: string;
  title: string;
  summary: string;
  prompt: string;
  originalState: string;
  turnaround: string;
  resultUse: string;
};

type LandingCopy = {
  languageLabel: string;
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleHighlight: string;
    subtitleLine1: string;
    subtitleLine2: string;
    primaryCtaSignedOut: string;
    primaryCtaSignedIn: string;
    secondaryCta: string;
    proofPoints: string[];
  };
  features: {
    heading: string;
    subheading: string;
    koreanPromptInputLabel: string;
    koreanPromptInputText: string;
    koreanPromptOutputLabel: string;
    koreanPromptOutputText: string;
    koreanPromptResultLabel: string;
    koreanPromptResultMeta: string;
    items: LandingFeature[];
  };
  gallery: {
    heading: string;
    subheading: string;
    promptLabel: string;
    originalStateLabel: string;
    turnaroundLabel: string;
    resultUseLabel: string;
    items: LandingExample[];
  };
  footer: {
    description: string;
    contactLabel: string;
    contactPage: string;
    refundPolicy: string;
    pricing: string;
    privacy: string;
    terms: string;
    aiImageGenerator: string;
    aiPhotoEnhancer: string;
    aiPortraitEnhancer: string;
  };
};

export const landingCopy: Record<LandingLanguage, LandingCopy> = {
  en: {
    languageLabel: "Language",
    hero: {
      eyebrow: "For creators and profile photos",
      titleLine1: "Turn weak portraits into",
      titleHighlight: "publish-ready images",
      subtitleLine1: "EditLuma is positioned first around creator portraits, selfies, and profile shots",
      subtitleLine2: "that need cleaner skin, stronger light, and faster turnaround before you spend on traffic.",
      primaryCtaSignedOut: "Start free",
      primaryCtaSignedIn: "Open dashboard",
      secondaryCta: "See proof",
      proofPoints: ["Creator profile photos", "Selfie cleanup", "Prompt-guided variations"],
    },
    features: {
      heading: "What The Product Is Optimized For",
      subheading: "The core flow stays simple: upload, guide the result, review the output, and decide whether it is usable.",
      koreanPromptInputLabel: "Prompt input",
      koreanPromptInputText: "A cleaner creator portrait with softer skin texture and brighter light",
      koreanPromptOutputLabel: "Model-ready prompt",
      koreanPromptOutputText: "Clean creator portrait, natural skin detail, brighter light, polished but realistic finish",
      koreanPromptResultLabel: "Processing target",
      koreanPromptResultMeta: "Korean / English / French supported",
      items: [
        {
          img: "/landing/feature-enhance-portrait.png",
          title: "Creator portrait cleanup",
          desc: "Improve profile photos and headshots without flattening the skin or killing facial detail.",
        },
        {
          img: "/landing/features/selfie-retouch.png",
          title: "Natural selfie retouch",
          desc: "Handle blemishes, tone balance, and minor cleanup while keeping the image believable.",
        },
        {
          img: "/landing/features/upscale-4k.png",
          title: "Low-res profile rescue",
          desc: "Useful when the source image is small, soft, or cropped too tightly for a profile refresh.",
        },
        {
          img: "",
          title: "Multilingual prompt support",
          desc: "Write direction in Korean, English, or French and let the workflow normalize it for the model.",
        },
        {
          img: "/landing/features/easy-upload.png",
          title: "Upload and review fast",
          desc: "Drop in one photo, add a short direction, and see whether the result is usable before buying more credits.",
        },
        {
          img: "/landing/features/fast-process.png",
          title: "Fast decision loop",
          desc: "The product is designed for short feedback cycles so you can test, reject, or retry quickly.",
        },
        {
          img: "/landing/features/style-transfer.png",
          title: "Campaign style variations",
          desc: "Once the core portrait works, you can branch into stronger visual treatments for launch or promo assets.",
        },
        {
          img: "/landing/ai-landing_2.png",
          title: "Secondary visual variations",
          desc: "When you need a supporting visual, you can still branch into prompt-based image generation inside the same account.",
        },
      ],
    },
    gallery: {
      heading: "Proof, Not Just Claims",
      subheading:
        "Each example now shows the original condition, prompt direction, review speed, and where that result is meant to be used before purchase.",
      promptLabel: "Prompt direction",
      originalStateLabel: "Original state",
      turnaroundLabel: "Typical turnaround",
      resultUseLabel: "Result use",
      items: [
        {
          src: "/landing/feature-enhance-portrait.png",
          alt: "Creator portrait enhancement sample",
          label: "Portrait cleanup",
          title: "Cleaner headshot for public-facing profiles",
          summary: "A more polished portrait without pushing skin texture into an artificial plastic look.",
          prompt: "Clean creator portrait, natural skin detail, balanced light, polished but realistic finish.",
          originalState: "Usable headshot with flat light and a slightly tired skin finish.",
          turnaround: "Usually one pass.",
          resultUse: "Profile photos, creator pages, speaker bios, and landing-page introductions.",
        },
        {
          src: "/landing/gallery-enhance.png",
          alt: "Before and after portrait cleanup sample",
          label: "Before / after",
          title: "Weak source image made usable again",
          summary: "A softer portrait becomes clearer and more presentable for quick publishing or client review.",
          prompt: "Restore portrait clarity, cleaner skin tone, balanced contrast, keep the face natural.",
          originalState: "Older upload with weak contrast and a flatter facial read than desired.",
          turnaround: "Usually one to two retries.",
          resultUse: "Older uploads, low-confidence drafts, and fast turnarounds when a full reshoot is not realistic.",
        },
        {
          src: "/prompt-examples/beauty-portrait.png",
          alt: "Beauty portrait example",
          label: "Beauty portrait",
          title: "Sharper thumbnail or profile visual",
          summary: "A clean editorial portrait direction that keeps the subject centered and credible.",
          prompt: "Clean beauty portrait of a young East Asian woman, natural glowing skin, centered composition, soft daylight, realistic facial detail.",
          originalState: "Centered portrait with a readable face and already-stable daylight.",
          turnaround: "Usually one pass.",
          resultUse: "Thumbnails, beauty creators, portfolio intros, and polished social profile images.",
        },
        {
          src: "/prompt-examples/cinematic-street.png",
          alt: "Cinematic street portrait example",
          label: "Social thumbnail",
          title: "A stronger social-facing portrait mood",
          summary: "Useful when the goal is not just cleanup, but a more intentional editorial atmosphere.",
          prompt: "Cinematic street portrait, soft bokeh lights, warm glow, fashion editorial mood, realistic photography.",
          originalState: "Clear face, but the original mood and background energy feel too weak for promotion.",
          turnaround: "One pass, then mood tuning if needed.",
          resultUse: "X headers, Instagram promos, creator launch posts, and campaign thumbnails.",
        },
        {
          src: "/prompt-examples/pop-art-grid.png",
          alt: "Pop art style variation example",
          label: "Style variation",
          title: "Intentional visual shift for campaign experiments",
          summary: "A reminder that the product can extend into styled variations after the core portrait is working.",
          prompt: "A four-panel pop art portrait series, neon cyan and magenta palette, bold graphic shapes, gallery poster composition.",
          originalState: "The main portrait direction is already approved and the next step is campaign variation testing.",
          turnaround: "Two to three retries when style matters.",
          resultUse: "Creative tests, launch art, campaign experiments, and high-contrast social assets.",
        },
        {
          src: "/prompt-examples/fairytale-cafe.png",
          alt: "Fairytale prompt example",
          label: "Supporting visual",
          title: "Prompt-based side visual when you need more than retouching",
          summary: "Generation still exists, but it is now positioned as a supporting workflow after the portrait use case.",
          prompt: "A fairytale princess with very long golden hair sitting at a cozy cafe table, warm indoor lighting, whimsical cinematic detail.",
          originalState: "The portrait job is already solved and a side visual is needed for the same campaign.",
          turnaround: "Usually more prompt tuning than portrait cleanup.",
          resultUse: "Supporting creatives, mood boards, and visual variations that sit next to a stronger portrait-first offer.",
        },
      ],
    },
    footer: {
      description: "Portrait-focused AI image cleanup and supporting generation workflow",
      contactLabel: "Contact",
      contactPage: "Contact",
      refundPolicy: "Refund Policy",
      pricing: "Pricing",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      aiImageGenerator: "AI Image Generator",
      aiPhotoEnhancer: "AI Photo Enhancer",
      aiPortraitEnhancer: "AI Portrait Enhancer",
    },
  },
  ko: {
    languageLabel: "언어",
    hero: {
      eyebrow: "크리에이터와 프로필 사진용",
      titleLine1: "아쉬운 인물 사진을",
      titleHighlight: "바로 쓸 수 있는 결과로",
      subtitleLine1: "EditLuma의 첫 화면은 이제 범용 AI 툴이 아니라",
      subtitleLine2: "크리에이터 프로필 사진, 셀피, 인물 보정 흐름에 먼저 맞춰집니다.",
      primaryCtaSignedOut: "무료로 시작하기",
      primaryCtaSignedIn: "대시보드 열기",
      secondaryCta: "결과 보기",
      proofPoints: ["프로필 사진 보정", "셀피 정리", "프롬프트 기반 변형"],
    },
    features: {
      heading: "지금 제품이 가장 잘 맞는 흐름",
      subheading: "업로드하고, 방향을 짧게 적고, 결과를 확인하고, 쓸 만한지 빠르게 판단하는 흐름에 맞춰져 있습니다.",
      koreanPromptInputLabel: "프롬프트 입력",
      koreanPromptInputText: "피부 질감은 자연스럽게 두고, 빛을 더 정리한 프로필 사진",
      koreanPromptOutputLabel: "생성용 프롬프트 정리",
      koreanPromptOutputText: "Clean creator portrait, natural skin detail, brighter light, polished but realistic finish",
      koreanPromptResultLabel: "처리 목표",
      koreanPromptResultMeta: "한국어 / 영어 / 프랑스어 지원",
      items: [
        {
          img: "/landing/feature-enhance-portrait.png",
          title: "크리에이터 인물 보정",
          desc: "피부를 과하게 뭉개지 않고 프로필 사진과 헤드샷을 더 정리된 결과로 만듭니다.",
        },
        {
          img: "/landing/features/selfie-retouch.png",
          title: "자연스러운 셀피 리터치",
          desc: "잡티, 톤 밸런스, 가벼운 보정을 처리하되 사람이 달라 보일 정도로 과하게 밀지 않습니다.",
        },
        {
          img: "/landing/features/upscale-4k.png",
          title: "저해상도 프로필 복구",
          desc: "작게 저장됐거나 다소 흐린 원본도 프로필용으로 다시 살려야 할 때 유용합니다.",
        },
        {
          img: "",
          title: "다국어 프롬프트 지원",
          desc: "한국어, 영어, 프랑스어로 원하는 방향을 적으면 모델이 처리하기 쉬운 형태로 정리합니다.",
        },
        {
          img: "/landing/features/easy-upload.png",
          title: "업로드 후 바로 판단",
          desc: "사진 한 장과 짧은 방향만 넣고, 추가 결제 전에 결과가 쓸 만한지 빠르게 확인할 수 있습니다.",
        },
        {
          img: "/landing/features/fast-process.png",
          title: "짧은 피드백 루프",
          desc: "한 번 돌려보고, 마음에 안 들면 바로 다시 시도하거나 버릴 수 있는 짧은 판단 사이클에 맞습니다.",
        },
        {
          img: "/landing/features/style-transfer.png",
          title: "캠페인용 스타일 확장",
          desc: "핵심 인물 사진이 잡힌 뒤에는 런칭이나 프로모션용 강한 톤의 변형도 이어갈 수 있습니다.",
        },
        {
          img: "/landing/ai-landing_2.png",
          title: "보조 이미지 생성",
          desc: "핵심은 인물 보정이지만, 필요할 때는 같은 계정 안에서 보조 비주얼 생성도 이어갈 수 있습니다.",
        },
      ],
    },
    gallery: {
      heading: "말보다 결과로 판단하세요",
      subheading:
        "각 카드에 원본 상태, 프롬프트 방향, 처리 감각, 결과 용도를 같이 붙여 결제 전에 바로 판단할 수 있게 했습니다.",
      promptLabel: "프롬프트 방향",
      originalStateLabel: "원본 상태",
      turnaroundLabel: "처리 감각",
      resultUseLabel: "결과 용도",
      items: [
        {
          src: "/landing/feature-enhance-portrait.png",
          alt: "크리에이터 인물 보정 예시",
          label: "인물 보정",
          title: "공개용 프로필에 바로 쓸 수 있는 인상 정리",
          summary: "피부 질감을 완전히 지우지 않으면서 더 정돈된 인물 사진으로 만드는 방향입니다.",
          prompt: "Clean creator portrait, natural skin detail, balanced light, polished but realistic finish.",
          originalState: "기본 인상은 괜찮지만 빛이 평평하고 피부 표현이 다소 지친 헤드샷입니다.",
          turnaround: "대체로 1회 시도.",
          resultUse: "프로필 사진, 크리에이터 소개 페이지, 발표자 소개, 랜딩 헤드샷에 잘 맞습니다.",
        },
        {
          src: "/landing/gallery-enhance.png",
          alt: "비포 애프터 인물 보정 예시",
          label: "비포 / 애프터",
          title: "아쉬운 원본을 다시 쓸 수 있게 정리",
          summary: "부드럽고 힘이 빠진 사진을 조금 더 또렷하고 게시 가능한 결과로 끌어올리는 예시입니다.",
          prompt: "Restore portrait clarity, cleaner skin tone, balanced contrast, keep the face natural.",
          originalState: "대비가 약하고 얼굴 인상이 흐릿하게 읽히는 오래된 업로드입니다.",
          turnaround: "대체로 1~2회 재시도.",
          resultUse: "오래된 업로드, 급한 시안, 재촬영이 어려운 상황에서 특히 유용합니다.",
        },
        {
          src: "/prompt-examples/beauty-portrait.png",
          alt: "뷰티 포트레이트 예시",
          label: "뷰티 포트레이트",
          title: "썸네일과 프로필에 강한 중심 인물 컷",
          summary: "주인공이 분명하고 신뢰감 있는 인물 이미지를 만들고 싶을 때 적합한 방향입니다.",
          prompt: "Clean beauty portrait of a young East Asian woman, natural glowing skin, centered composition, soft daylight, realistic facial detail.",
          originalState: "얼굴이 잘 보이고 자연광도 안정적인 중심 인물 컷입니다.",
          turnaround: "대체로 1회 시도.",
          resultUse: "뷰티 크리에이터, 포트폴리오 첫 화면, 소셜 프로필, 썸네일 이미지에 잘 맞습니다.",
        },
        {
          src: "/prompt-examples/cinematic-street.png",
          alt: "시네마틱 스트리트 포트레이트 예시",
          label: "소셜 썸네일",
          title: "분위기까지 포함한 인물 중심 비주얼",
          summary: "단순 보정보다 한 단계 더 나아가 에디토리얼 무드가 필요한 경우에 쓸 수 있습니다.",
          prompt: "Cinematic street portrait, soft bokeh lights, warm glow, fashion editorial mood, realistic photography.",
          originalState: "얼굴은 선명하지만 홍보용으로 쓰기엔 무드와 배경 에너지가 약한 컷입니다.",
          turnaround: "1회 생성 후 무드 튜닝 추가.",
          resultUse: "X 헤더, 인스타 프로모션, 런칭 포스트, 캠페인용 썸네일에 어울립니다.",
        },
        {
          src: "/prompt-examples/pop-art-grid.png",
          alt: "팝아트 스타일 변형 예시",
          label: "스타일 변형",
          title: "핵심 사진이 잡힌 뒤 시도하는 확장 실험",
          summary: "기본 인물 흐름이 잡힌 다음에 캠페인용 스타일 변형을 시험할 때 적합합니다.",
          prompt: "A four-panel pop art portrait series, neon cyan and magenta palette, bold graphic shapes, gallery poster composition.",
          originalState: "핵심 인물 컷은 이미 확보됐고, 다음 단계로 스타일 실험을 붙이는 상황입니다.",
          turnaround: "스타일 중요도에 따라 2~3회 조정.",
          resultUse: "크리에이티브 테스트, 런칭 아트, 캠페인 시안, 강한 대비의 소셜 자산에 맞습니다.",
        },
        {
          src: "/prompt-examples/fairytale-cafe.png",
          alt: "동화풍 카페 프롬프트 예시",
          label: "보조 비주얼",
          title: "인물 보정 외에 필요한 보조 이미지",
          summary: "생성 기능은 여전히 있지만, 이제는 보조 흐름으로 뒤에 배치해 제품의 핵심 메시지를 흐리지 않게 합니다.",
          prompt: "A fairytale princess with very long golden hair sitting at a cozy cafe table, warm indoor lighting, whimsical cinematic detail.",
          originalState: "인물 사진 작업은 끝났고 같은 캠페인에 붙일 보조 비주얼이 필요한 상태입니다.",
          turnaround: "인물 보정보다 프롬프트 조정 비중이 큽니다.",
          resultUse: "보조 크리에이티브, 무드보드, 사이드 비주얼, 콘셉트 보강 이미지에 적합합니다.",
        },
      ],
    },
    footer: {
      description: "인물 보정 중심의 AI 이미지 정리와 보조 생성 워크플로우",
      contactLabel: "문의",
      contactPage: "문의",
      refundPolicy: "환불 정책",
      pricing: "요금제",
      privacy: "개인정보처리방침",
      terms: "이용약관",
      aiImageGenerator: "AI 이미지 생성기",
      aiPhotoEnhancer: "AI 사진 보정",
      aiPortraitEnhancer: "AI 인물 보정",
    },
  },
  fr: {
    languageLabel: "Langue",
    hero: {
      eyebrow: "Pour créateurs et photos de profil",
      titleLine1: "Transformez des portraits faibles en",
      titleHighlight: "images prêtes à publier",
      subtitleLine1: "EditLuma met désormais l’accent d’abord sur les portraits de créateurs, les selfies et les photos de profil",
      subtitleLine2: "qui ont besoin d’un rendu plus propre, d’une meilleure lumière et d’une décision plus rapide.",
      primaryCtaSignedOut: "Commencer gratuitement",
      primaryCtaSignedIn: "Ouvrir le tableau de bord",
      secondaryCta: "Voir les preuves",
      proofPoints: ["Photos de profil", "Nettoyage selfie", "Variations guidées par prompt"],
    },
    features: {
      heading: "Le flux auquel le produit correspond le mieux",
      subheading: "Uploader, donner une direction courte, vérifier le rendu, puis décider vite si le résultat est exploitable.",
      koreanPromptInputLabel: "Prompt saisi",
      koreanPromptInputText: "Un portrait créateur plus propre avec une lumière mieux équilibrée",
      koreanPromptOutputLabel: "Prompt prêt pour le modèle",
      koreanPromptOutputText: "Clean creator portrait, natural skin detail, brighter light, polished but realistic finish",
      koreanPromptResultLabel: "Cible de traitement",
      koreanPromptResultMeta: "Coréen / anglais / français",
      items: [
        {
          img: "/landing/feature-enhance-portrait.png",
          title: "Nettoyage portrait",
          desc: "Améliorez photos de profil et headshots sans détruire la texture du visage.",
        },
        {
          img: "/landing/features/selfie-retouch.png",
          title: "Retouche selfie naturelle",
          desc: "Corrigez petites imperfections et équilibre de teint sans exagérer.",
        },
        {
          img: "/landing/features/upscale-4k.png",
          title: "Récupération profil basse résolution",
          desc: "Pratique quand l’image source est petite, douce ou trop recadrée pour une photo de profil propre.",
        },
        {
          img: "",
          title: "Support multilingue",
          desc: "Rédigez la direction en coréen, en anglais ou en français et laissez le modèle la normaliser.",
        },
        {
          img: "/landing/features/easy-upload.png",
          title: "Upload puis revue rapide",
          desc: "Ajoutez une photo, une courte direction, et décidez vite si le rendu mérite l’étape suivante.",
        },
        {
          img: "/landing/features/fast-process.png",
          title: "Boucle de décision courte",
          desc: "Tester, rejeter, ajuster ou relancer rapidement fait partie du flux principal.",
        },
        {
          img: "/landing/features/style-transfer.png",
          title: "Variations de style campagne",
          desc: "Une fois le portrait validé, vous pouvez pousser des traitements plus marqués pour des assets de lancement.",
        },
        {
          img: "/landing/ai-landing_2.png",
          title: "Visuels secondaires",
          desc: "La génération existe toujours, mais comme workflow secondaire après le besoin portrait principal.",
        },
      ],
    },
    gallery: {
      heading: "Des preuves, pas seulement des promesses",
      subheading:
        "Chaque exemple montre désormais l’état initial, la direction du prompt, le rythme de revue et l’usage final attendu avant l’achat.",
      promptLabel: "Direction du prompt",
      originalStateLabel: "État initial",
      turnaroundLabel: "Rythme typique",
      resultUseLabel: "Usage final",
      items: [
        {
          src: "/landing/feature-enhance-portrait.png",
          alt: "Exemple de nettoyage portrait créateur",
          label: "Nettoyage portrait",
          title: "Headshot plus propre pour un usage public",
          summary: "Un portrait plus net et mieux présenté sans effet plastique excessif.",
          prompt: "Clean creator portrait, natural skin detail, balanced light, polished but realistic finish.",
          originalState: "Headshot utilisable mais avec une lumière trop plate et un rendu de peau un peu fatigué.",
          turnaround: "Généralement une seule passe.",
          resultUse: "Photos de profil, bios de créateurs, pages d’introduction et présentations publiques.",
        },
        {
          src: "/landing/gallery-enhance.png",
          alt: "Exemple avant après portrait",
          label: "Avant / après",
          title: "Une source faible redevient exploitable",
          summary: "Un portrait mou ou fatigué devient plus clair et plus publiable.",
          prompt: "Restore portrait clarity, cleaner skin tone, balanced contrast, keep the face natural.",
          originalState: "Ancien upload avec peu de contraste et un visage moins lisible que souhaité.",
          turnaround: "En général une à deux reprises.",
          resultUse: "Anciens uploads, brouillons rapides et situations où refaire la photo n’est pas réaliste.",
        },
        {
          src: "/prompt-examples/beauty-portrait.png",
          alt: "Exemple portrait beauté",
          label: "Portrait beauté",
          title: "Visuel centré fort pour profil ou miniature",
          summary: "Une direction éditoriale propre avec un sujet crédible et bien posé.",
          prompt: "Clean beauty portrait of a young East Asian woman, natural glowing skin, centered composition, soft daylight, realistic facial detail.",
          originalState: "Portrait centré avec un visage lisible et une lumière déjà stable.",
          turnaround: "Généralement une seule passe.",
          resultUse: "Miniatures, profils sociaux, créateurs beauté et premières sections de portfolio.",
        },
        {
          src: "/prompt-examples/cinematic-street.png",
          alt: "Exemple portrait cinématique",
          label: "Miniature sociale",
          title: "Portrait avec ambiance éditoriale",
          summary: "Utile quand il faut plus qu’un simple nettoyage et qu’une vraie atmosphère est nécessaire.",
          prompt: "Cinematic street portrait, soft bokeh lights, warm glow, fashion editorial mood, realistic photography.",
          originalState: "Le visage est net mais l’ambiance d’origine reste trop faible pour un usage promo.",
          turnaround: "Une passe, puis ajustement d’ambiance si besoin.",
          resultUse: "Headers X, promos Instagram, posts de lancement et visuels de campagne.",
        },
        {
          src: "/prompt-examples/pop-art-grid.png",
          alt: "Exemple variation pop art",
          label: "Variation de style",
          title: "Expérience créative après validation du portrait",
          summary: "Une extension utile seulement une fois que le portrait principal fonctionne déjà.",
          prompt: "A four-panel pop art portrait series, neon cyan and magenta palette, bold graphic shapes, gallery poster composition.",
          originalState: "Le portrait principal est déjà validé et l’étape suivante consiste à tester une direction plus forte.",
          turnaround: "Deux à trois essais quand le style compte.",
          resultUse: "Tests créatifs, campagnes de lancement et assets sociaux à fort contraste.",
        },
        {
          src: "/prompt-examples/fairytale-cafe.png",
          alt: "Exemple visuel de support généré",
          label: "Visuel de support",
          title: "Un flux secondaire pour compléter l’offre portrait",
          summary: "La génération reste disponible mais ne brouille plus le message principal du site.",
          prompt: "A fairytale princess with very long golden hair sitting at a cozy cafe table, warm indoor lighting, whimsical cinematic detail.",
          originalState: "Le besoin portrait est déjà couvert et il faut un visuel secondaire pour la même campagne.",
          turnaround: "Davantage d’ajustements de prompt que de retouche portrait.",
          resultUse: "Moodboards, visuels complémentaires et variations conceptuelles autour d’une offre plus claire.",
        },
      ],
    },
    footer: {
      description: "Workflow IA orienté portrait avec génération d’appoint",
      contactLabel: "Contact",
      contactPage: "Contact",
      refundPolicy: "Politique de remboursement",
      pricing: "Tarifs",
      privacy: "Politique de confidentialité",
      terms: "Conditions d’utilisation",
      aiImageGenerator: "Générateur d’images IA",
      aiPhotoEnhancer: "Amélioration photo IA",
      aiPortraitEnhancer: "Retouche portrait IA",
    },
  },
};
