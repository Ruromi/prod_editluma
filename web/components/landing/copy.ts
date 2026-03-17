export type LandingLanguage = "en" | "ko" | "fr";

type LandingMetric = {
  label: string;
  value: string;
  detail: string;
};

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
  fit: string;
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
  trust: {
    eyebrow: string;
    heading: string;
    subheading: string;
    metrics: LandingMetric[];
    limitationTitle: string;
    limitationBody: string;
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
    fitLabel: string;
    items: LandingExample[];
  };
  cta: {
    eyebrow: string;
    heading: string;
    body: string;
    primaryCtaSignedOut: string;
    primaryCtaSignedIn: string;
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
    trust: {
      eyebrow: "Trust Before Traffic",
      heading: "Show the workflow people need to trust before they buy",
      subheading:
        "The landing page now leads with a narrower promise, visible examples, and clear tradeoffs instead of trying to sell every image workflow at once.",
      metrics: [
        {
          label: "Positioning",
          value: "Portrait-first",
          detail: "The first screen is now anchored to creator portraits and profile-photo cleanup instead of broad AI utility language.",
        },
        {
          label: "Workflow",
          value: "Prompt + result visible",
          detail: "Sample outputs below expose the kind of prompt direction the product can handle before a user commits.",
        },
        {
          label: "Decision safety",
          value: "7-day refund window",
          detail: "Pricing now surfaces the existing refund window earlier so users can judge the risk before checkout.",
        },
      ],
      limitationTitle: "Where we still say no",
      limitationBody:
        "Heavy motion blur, hidden faces, or badly compressed uploads can still need retries or manual touch-up. Showing that clearly is better than promising magic.",
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
          img: "",
          title: "Multilingual prompt support",
          desc: "Write direction in Korean, English, or French and let the workflow normalize it for the model.",
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
      subheading: "Each sample shows the use case, prompt direction, and where that type of output is most useful.",
      promptLabel: "Prompt direction",
      fitLabel: "Best fit",
      items: [
        {
          src: "/landing/feature-enhance-portrait.png",
          alt: "Creator portrait enhancement sample",
          label: "Portrait cleanup",
          title: "Cleaner headshot for public-facing profiles",
          summary: "A more polished portrait without pushing skin texture into an artificial plastic look.",
          prompt: "Clean creator portrait, natural skin detail, balanced light, polished but realistic finish.",
          fit: "Profile photos, creator pages, speaker bios, and landing-page introductions.",
        },
        {
          src: "/landing/gallery-enhance.png",
          alt: "Before and after portrait cleanup sample",
          label: "Before / after",
          title: "Weak source image made usable again",
          summary: "A softer portrait becomes clearer and more presentable for quick publishing or client review.",
          prompt: "Restore portrait clarity, cleaner skin tone, balanced contrast, keep the face natural.",
          fit: "Older uploads, low-confidence drafts, and fast turnarounds when a full reshoot is not realistic.",
        },
        {
          src: "/prompt-examples/beauty-portrait.png",
          alt: "Beauty portrait example",
          label: "Beauty portrait",
          title: "Sharper thumbnail or profile visual",
          summary: "A clean editorial portrait direction that keeps the subject centered and credible.",
          prompt: "Clean beauty portrait of a young East Asian woman, natural glowing skin, centered composition, soft daylight, realistic facial detail.",
          fit: "Thumbnails, beauty creators, portfolio intros, and polished social profile images.",
        },
        {
          src: "/prompt-examples/cinematic-street.png",
          alt: "Cinematic street portrait example",
          label: "Social thumbnail",
          title: "A stronger social-facing portrait mood",
          summary: "Useful when the goal is not just cleanup, but a more intentional editorial atmosphere.",
          prompt: "Cinematic street portrait, soft bokeh lights, warm glow, fashion editorial mood, realistic photography.",
          fit: "X headers, Instagram promos, creator launch posts, and campaign thumbnails.",
        },
        {
          src: "/prompt-examples/pop-art-grid.png",
          alt: "Pop art style variation example",
          label: "Style variation",
          title: "Intentional visual shift for campaign experiments",
          summary: "A reminder that the product can extend into styled variations after the core portrait is working.",
          prompt: "A four-panel pop art portrait series, neon cyan and magenta palette, bold graphic shapes, gallery poster composition.",
          fit: "Creative tests, launch art, campaign experiments, and high-contrast social assets.",
        },
        {
          src: "/prompt-examples/fairytale-cafe.png",
          alt: "Fairytale prompt example",
          label: "Supporting visual",
          title: "Prompt-based side visual when you need more than retouching",
          summary: "Generation still exists, but it is now positioned as a supporting workflow after the portrait use case.",
          prompt: "A fairytale princess with very long golden hair sitting at a cozy cafe table, warm indoor lighting, whimsical cinematic detail.",
          fit: "Supporting creatives, mood boards, and visual variations that sit next to a stronger portrait-first offer.",
        },
      ],
    },
    cta: {
      eyebrow: "Ready To Test",
      heading: "Try one portrait before you buy more credits",
      body: "The goal of the funnel is simple: get to one usable result quickly, then decide whether quality and pricing justify the next step.",
      primaryCtaSignedOut: "Create a free account",
      primaryCtaSignedIn: "Go to dashboard",
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
    trust: {
      eyebrow: "광고 전에 신뢰부터",
      heading: "사람들이 결제 전에 확인해야 하는 정보를 먼저 보여줍니다",
      subheading:
        "첫 화면에서 기능을 전부 나열하는 대신, 인물 보정 중심 메시지와 실제 예시, 그리고 한계까지 같이 노출하는 구조로 바꿉니다.",
      metrics: [
        {
          label: "포지셔닝",
          value: "인물 보정 중심",
          detail: "랜딩 첫 화면을 범용 AI 이미지 툴이 아니라 크리에이터용 인물 보정 흐름에 맞췄습니다.",
        },
        {
          label: "작업 흐름",
          value: "프롬프트와 결과 공개",
          detail: "아래 예시 카드에서 어떤 방향의 프롬프트와 결과를 기대할 수 있는지 먼저 판단할 수 있습니다.",
        },
        {
          label: "결정 안전장치",
          value: "7일 이내 환불 요청",
          detail: "가격 페이지 상단에서 기존 환불 가능 기간을 더 빨리 보여줘 결제 전 판단 부담을 줄입니다.",
        },
      ],
      limitationTitle: "이럴 때는 재시도나 수작업이 필요합니다",
      limitationBody:
        "얼굴 가림이 심하거나, 움직임 블러가 크거나, 압축 손상이 심한 이미지는 한 번에 깔끔하게 나오지 않을 수 있습니다. 이 한계를 먼저 보여주는 편이 더 신뢰를 만듭니다.",
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
          img: "",
          title: "다국어 프롬프트 지원",
          desc: "한국어, 영어, 프랑스어로 원하는 방향을 적으면 모델이 처리하기 쉬운 형태로 정리합니다.",
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
      subheading: "각 카드에 어떤 용도인지, 어떤 방향의 프롬프트인지, 어디에 잘 맞는지 같이 보여줍니다.",
      promptLabel: "프롬프트 방향",
      fitLabel: "잘 맞는 용도",
      items: [
        {
          src: "/landing/feature-enhance-portrait.png",
          alt: "크리에이터 인물 보정 예시",
          label: "인물 보정",
          title: "공개용 프로필에 바로 쓸 수 있는 인상 정리",
          summary: "피부 질감을 완전히 지우지 않으면서 더 정돈된 인물 사진으로 만드는 방향입니다.",
          prompt: "Clean creator portrait, natural skin detail, balanced light, polished but realistic finish.",
          fit: "프로필 사진, 크리에이터 소개 페이지, 발표자 소개, 랜딩 헤드샷에 잘 맞습니다.",
        },
        {
          src: "/landing/gallery-enhance.png",
          alt: "비포 애프터 인물 보정 예시",
          label: "비포 / 애프터",
          title: "아쉬운 원본을 다시 쓸 수 있게 정리",
          summary: "부드럽고 힘이 빠진 사진을 조금 더 또렷하고 게시 가능한 결과로 끌어올리는 예시입니다.",
          prompt: "Restore portrait clarity, cleaner skin tone, balanced contrast, keep the face natural.",
          fit: "오래된 업로드, 급한 시안, 재촬영이 어려운 상황에서 특히 유용합니다.",
        },
        {
          src: "/prompt-examples/beauty-portrait.png",
          alt: "뷰티 포트레이트 예시",
          label: "뷰티 포트레이트",
          title: "썸네일과 프로필에 강한 중심 인물 컷",
          summary: "주인공이 분명하고 신뢰감 있는 인물 이미지를 만들고 싶을 때 적합한 방향입니다.",
          prompt: "Clean beauty portrait of a young East Asian woman, natural glowing skin, centered composition, soft daylight, realistic facial detail.",
          fit: "뷰티 크리에이터, 포트폴리오 첫 화면, 소셜 프로필, 썸네일 이미지에 잘 맞습니다.",
        },
        {
          src: "/prompt-examples/cinematic-street.png",
          alt: "시네마틱 스트리트 포트레이트 예시",
          label: "소셜 썸네일",
          title: "분위기까지 포함한 인물 중심 비주얼",
          summary: "단순 보정보다 한 단계 더 나아가 에디토리얼 무드가 필요한 경우에 쓸 수 있습니다.",
          prompt: "Cinematic street portrait, soft bokeh lights, warm glow, fashion editorial mood, realistic photography.",
          fit: "X 헤더, 인스타 프로모션, 런칭 포스트, 캠페인용 썸네일에 어울립니다.",
        },
        {
          src: "/prompt-examples/pop-art-grid.png",
          alt: "팝아트 스타일 변형 예시",
          label: "스타일 변형",
          title: "핵심 사진이 잡힌 뒤 시도하는 확장 실험",
          summary: "기본 인물 흐름이 잡힌 다음에 캠페인용 스타일 변형을 시험할 때 적합합니다.",
          prompt: "A four-panel pop art portrait series, neon cyan and magenta palette, bold graphic shapes, gallery poster composition.",
          fit: "크리에이티브 테스트, 런칭 아트, 캠페인 시안, 강한 대비의 소셜 자산에 맞습니다.",
        },
        {
          src: "/prompt-examples/fairytale-cafe.png",
          alt: "동화풍 카페 프롬프트 예시",
          label: "보조 비주얼",
          title: "인물 보정 외에 필요한 보조 이미지",
          summary: "생성 기능은 여전히 있지만, 이제는 보조 흐름으로 뒤에 배치해 제품의 핵심 메시지를 흐리지 않게 합니다.",
          prompt: "A fairytale princess with very long golden hair sitting at a cozy cafe table, warm indoor lighting, whimsical cinematic detail.",
          fit: "보조 크리에이티브, 무드보드, 사이드 비주얼, 콘셉트 보강 이미지에 적합합니다.",
        },
      ],
    },
    cta: {
      eyebrow: "직접 확인해보세요",
      heading: "크레딧을 더 사기 전에 인물 사진 한 장부터 테스트하세요",
      body: "퍼널 목표는 복잡하지 않습니다. 먼저 결과 하나가 쓸 만한지 확인하고, 그 다음에 품질과 가격이 맞는지 판단하게 만드는 것입니다.",
      primaryCtaSignedOut: "무료 계정 만들기",
      primaryCtaSignedIn: "대시보드로 가기",
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
    trust: {
      eyebrow: "La confiance avant le trafic",
      heading: "Montrez d’abord ce qu’un utilisateur doit croire avant d’acheter",
      subheading:
        "La page d’accueil adopte une promesse plus étroite, des exemples visibles et des limites assumées au lieu d’essayer de vendre tous les usages IA en même temps.",
      metrics: [
        {
          label: "Positionnement",
          value: "Axé portrait",
          detail: "Le premier écran parle désormais d’abord de nettoyage portrait et de photo de profil.",
        },
        {
          label: "Workflow",
          value: "Prompt + résultat visibles",
          detail: "Les exemples ci-dessous montrent quel type de direction de prompt et de résultat attendre avant l’inscription.",
        },
        {
          label: "Sécurité de décision",
          value: "Remboursement sous 7 jours",
          detail: "La page tarifaire met en avant plus tôt la fenêtre de remboursement déjà existante.",
        },
      ],
      limitationTitle: "Quand nous préférons être clairs",
      limitationBody:
        "Un flou de mouvement fort, des visages cachés ou une compression trop agressive peuvent encore demander des essais ou une retouche manuelle.",
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
          img: "",
          title: "Support multilingue",
          desc: "Rédigez la direction en coréen, en anglais ou en français et laissez le modèle la normaliser.",
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
      subheading: "Chaque exemple montre l’usage, la direction du prompt et le contexte où ce rendu devient utile.",
      promptLabel: "Direction du prompt",
      fitLabel: "Usage idéal",
      items: [
        {
          src: "/landing/feature-enhance-portrait.png",
          alt: "Exemple de nettoyage portrait créateur",
          label: "Nettoyage portrait",
          title: "Headshot plus propre pour un usage public",
          summary: "Un portrait plus net et mieux présenté sans effet plastique excessif.",
          prompt: "Clean creator portrait, natural skin detail, balanced light, polished but realistic finish.",
          fit: "Photos de profil, bios de créateurs, pages d’introduction et présentations publiques.",
        },
        {
          src: "/landing/gallery-enhance.png",
          alt: "Exemple avant après portrait",
          label: "Avant / après",
          title: "Une source faible redevient exploitable",
          summary: "Un portrait mou ou fatigué devient plus clair et plus publiable.",
          prompt: "Restore portrait clarity, cleaner skin tone, balanced contrast, keep the face natural.",
          fit: "Anciens uploads, brouillons rapides et situations où refaire la photo n’est pas réaliste.",
        },
        {
          src: "/prompt-examples/beauty-portrait.png",
          alt: "Exemple portrait beauté",
          label: "Portrait beauté",
          title: "Visuel centré fort pour profil ou miniature",
          summary: "Une direction éditoriale propre avec un sujet crédible et bien posé.",
          prompt: "Clean beauty portrait of a young East Asian woman, natural glowing skin, centered composition, soft daylight, realistic facial detail.",
          fit: "Miniatures, profils sociaux, créateurs beauté et premières sections de portfolio.",
        },
        {
          src: "/prompt-examples/cinematic-street.png",
          alt: "Exemple portrait cinématique",
          label: "Miniature sociale",
          title: "Portrait avec ambiance éditoriale",
          summary: "Utile quand il faut plus qu’un simple nettoyage et qu’une vraie atmosphère est nécessaire.",
          prompt: "Cinematic street portrait, soft bokeh lights, warm glow, fashion editorial mood, realistic photography.",
          fit: "Headers X, promos Instagram, posts de lancement et visuels de campagne.",
        },
        {
          src: "/prompt-examples/pop-art-grid.png",
          alt: "Exemple variation pop art",
          label: "Variation de style",
          title: "Expérience créative après validation du portrait",
          summary: "Une extension utile seulement une fois que le portrait principal fonctionne déjà.",
          prompt: "A four-panel pop art portrait series, neon cyan and magenta palette, bold graphic shapes, gallery poster composition.",
          fit: "Tests créatifs, campagnes de lancement et assets sociaux à fort contraste.",
        },
        {
          src: "/prompt-examples/fairytale-cafe.png",
          alt: "Exemple visuel de support généré",
          label: "Visuel de support",
          title: "Un flux secondaire pour compléter l’offre portrait",
          summary: "La génération reste disponible mais ne brouille plus le message principal du site.",
          prompt: "A fairytale princess with very long golden hair sitting at a cozy cafe table, warm indoor lighting, whimsical cinematic detail.",
          fit: "Moodboards, visuels complémentaires et variations conceptuelles autour d’une offre plus claire.",
        },
      ],
    },
    cta: {
      eyebrow: "Prêt à tester",
      heading: "Testez un portrait avant d’acheter plus de crédits",
      body: "Le but du funnel est simple: obtenir vite un résultat utilisable, puis décider si qualité et prix justifient l’étape suivante.",
      primaryCtaSignedOut: "Créer un compte gratuit",
      primaryCtaSignedIn: "Aller au tableau de bord",
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
