export type LandingLanguage = "en" | "ko" | "fr";

type LandingFeature = {
  img: string;
  title: string;
  desc: string;
};

type LandingProblemItem = {
  title: string;
  desc: string;
};

type LandingUseCaseItem = {
  title: string;
  desc: string;
  bullets: string[];
};

type LandingTrustItem = {
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
    imageBeforeLabel: string;
    imageAfterLabel: string;
    imageCaption: string;
  };
  features: {
    eyebrow: string;
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
  problem: {
    eyebrow: string;
    heading: string;
    subheading: string;
    items: LandingProblemItem[];
  };
  useCases: {
    eyebrow: string;
    heading: string;
    subheading: string;
    items: LandingUseCaseItem[];
  };
  trust: {
    eyebrow: string;
    heading: string;
    subheading: string;
    note: string;
    items: LandingTrustItem[];
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
      eyebrow: "Professional profile photo AI",
      titleLine1: "Get a professional profile photo in",
      titleHighlight: "30 seconds",
      subtitleLine1:
        "Turn your casual photo into a LinkedIn-ready, business-grade profile image with AI.",
      subtitleLine2:
        "Built for job seekers, founders, creators, and anyone who needs a stronger first impression fast.",
      primaryCtaSignedOut: "Upgrade my profile photo",
      primaryCtaSignedIn: "Open dashboard",
      secondaryCta: "See before / after",
      proofPoints: ["LinkedIn-ready", "Business-ready", "CV-ready"],
      imageBeforeLabel: "Before",
      imageAfterLabel: "After",
      imageCaption:
        "A weak casual portrait becomes a cleaner, more credible profile photo for LinkedIn, resumes, and founder bios.",
    },
    features: {
      eyebrow: "Result focus",
      heading: "Built For Profile Photo Results",
      subheading:
        "Start with one casual photo, pick the direction you want, and decide quickly whether the result is ready for LinkedIn, your CV, or your team page.",
      koreanPromptInputLabel: "Target result",
      koreanPromptInputText:
        "Professional profile photo, cleaner light, natural skin, stronger first impression",
      koreanPromptOutputLabel: "Model-ready direction",
      koreanPromptOutputText:
        "Professional profile photo, LinkedIn-ready headshot, balanced light, natural skin detail, polished but realistic finish",
      koreanPromptResultLabel: "Processing target",
      koreanPromptResultMeta: "Korean / English / French supported",
      items: [
        {
          img: "/landing/feature-enhance-portrait.png",
          title: "Before / after profile upgrades",
          desc: "Show a weak casual photo next to the upgraded result so visitors judge the outcome, not the feature list.",
        },
        {
          img: "/landing/features/selfie-retouch.png",
          title: "Natural skin and lighting cleanup",
          desc: "Improve skin tone, light balance, and facial clarity without pushing the face into an artificial look.",
        },
        {
          img: "/landing/features/upscale-4k.png",
          title: "Low-res headshot rescue",
          desc: "Useful when an older selfie or cropped photo is almost usable but still too soft for a public-facing profile.",
        },
        {
          img: "/landing/features/easy-upload.png",
          title: "Fast upload and review",
          desc: "Drop in one photo, review the result quickly, and decide whether it is ready before you spend more time.",
        },
        {
          img: "/landing/features/fast-process.png",
          title: "LinkedIn, CV, and team page fit",
          desc: "The product is centered on profile-photo use cases that need a cleaner first impression across public pages.",
        },
        {
          img: "/landing/ai-landing_2.png",
          title: "Multiple candidate directions",
          desc: "Try a few believable directions first, then keep the strongest option for your final profile photo.",
        },
      ],
    },
    gallery: {
      heading: "Results First",
      subheading:
        "Each example shows the source condition, how fast the cleanup happened, and where the upgraded profile photo can be used.",
      promptLabel: "Result direction",
      originalStateLabel: "Original state",
      turnaroundLabel: "Typical turnaround",
      resultUseLabel: "Best use",
      items: [
        {
          src: "/landing/feature-enhance-portrait.png",
          alt: "Before and after professional profile photo example",
          label: "LinkedIn-ready",
          title: "A casual portrait cleaned up for a stronger first impression",
          summary:
            "The face stays believable while the light, texture, and overall polish move closer to a public-facing headshot.",
          prompt:
            "Professional profile photo, LinkedIn-ready headshot, balanced light, natural skin detail, polished but realistic finish.",
          originalState: "Casual portrait with usable framing but flat light and a tired overall finish.",
          turnaround: "Usually one pass.",
          resultUse: "LinkedIn, resume, CV, founder bios, and speaker pages.",
        },
        {
          src: "/landing/gallery-enhance.png",
          alt: "Blurry profile photo enhancement example",
          label: "Before / after",
          title: "A weak source photo made usable again",
          summary:
            "Soft detail and low-confidence lighting are cleaned up enough to make the image feel more credible and publishable.",
          prompt:
            "Fix blurry profile photo, improve facial clarity, cleaner skin tone, balanced contrast, keep the face natural.",
          originalState: "Older upload with weak contrast, softer detail, and a less confident read than needed.",
          turnaround: "Usually one to two retries.",
          resultUse: "Profile refreshes when a full reshoot is not realistic.",
        },
        {
          src: "/prompt-examples/beauty-portrait.png",
          alt: "Founder profile photo example",
          label: "Founder bio",
          title: "Sharper profile image for a founder or operator page",
          summary:
            "A centered portrait becomes cleaner and more trustworthy for company pages, newsletters, and investor-facing bios.",
          prompt:
            "Business-ready founder headshot, natural skin detail, brighter light, centered composition, credible and polished finish.",
          originalState: "Clear face with decent framing, but not polished enough for repeated public-facing use.",
          turnaround: "Usually one pass.",
          resultUse: "Founder pages, team directories, personal websites, and bios.",
        },
        {
          src: "/prompt-examples/cinematic-street.png",
          alt: "Creator profile photo example",
          label: "Creator profile",
          title: "A stronger profile photo for creators and freelancers",
          summary:
            "The result keeps personality while tightening the first impression for platforms where the profile photo appears repeatedly.",
          prompt:
            "Professional creator profile photo, clean facial detail, balanced light, polished but natural finish.",
          originalState: "A readable portrait that still feels too casual for brand deals, introductions, or outreach.",
          turnaround: "One pass, then minor direction tuning if needed.",
          resultUse: "Creator bios, freelance profiles, community pages, and social avatars.",
        },
      ],
    },
    problem: {
      eyebrow: "First impression risk",
      heading: "Your current profile photo might be weakening the first impression",
      subheading:
        "Most profile-photo problems are simple: the photo feels too casual, the light is weak, or the image quality is not strong enough for public-facing use.",
      items: [
        {
          title: "Too casual for professional use",
          desc: "A usable selfie can still send the wrong signal on LinkedIn, resumes, founder pages, and speaker bios.",
        },
        {
          title: "Weak light and soft detail",
          desc: "Dim light, low resolution, and flat skin detail make the image feel lower quality than the person it represents.",
        },
        {
          title: "Inconsistent public profile",
          desc: "When the same weak image appears across multiple public pages, the first impression problem compounds everywhere.",
        },
      ],
    },
    useCases: {
      eyebrow: "Use cases",
      heading: "Built for the people who get judged by their profile photo",
      subheading:
        "The clearest use cases all share one thing: the image stands in for a real person in a public context where trust matters fast.",
      items: [
        {
          title: "Job seekers",
          desc: "Upgrade the photo attached to job applications, resumes, CVs, and LinkedIn.",
          bullets: ["LinkedIn profile refresh", "Resume and CV headshot", "Application-ready photo"],
        },
        {
          title: "Founders and operators",
          desc: "Clean up the profile image used across team pages, bios, newsletters, and investor-facing intros.",
          bullets: ["Founder bio headshot", "Team directory photo", "Speaker page image"],
        },
        {
          title: "Creators and freelancers",
          desc: "Keep the profile photo believable while making it strong enough for outreach, bios, and public-facing profiles.",
          bullets: ["Creator profile image", "Freelancer bio photo", "Community avatar upgrade"],
        },
      ],
    },
    trust: {
      eyebrow: "Trust",
      heading: "Trust has to come from the result, not inflated claims",
      subheading:
        "This landing should feel credible before it feels impressive. That means clear outcomes, believable examples, and no fake proof.",
      note:
        "Do not publish unverified social proof, inflated usage numbers, or testimonials without explicit permission.",
      items: [
        {
          title: "Believable profile-photo outcomes",
          desc: "Position the result as stronger, cleaner, and more credible rather than unrealistically perfect.",
        },
        {
          title: "Consistent message across pages",
          desc: "Keep home, SEO pages, pricing, and auth flows centered on the same profile-photo promise.",
        },
        {
          title: "Real proof over filler",
          desc: "Use before / after, realistic examples, and actual user evidence when available instead of generic AI-tool claims.",
        },
      ],
    },
    footer: {
      description:
        "Professional profile photo AI for LinkedIn headshots, resume photos, and polished public-facing profiles.",
      contactLabel: "Contact",
      contactPage: "Contact",
      refundPolicy: "Refund Policy",
      pricing: "Pricing",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      aiImageGenerator: "AI Profile Photo Generator",
      aiPhotoEnhancer: "AI Profile Photo Enhancer",
      aiPortraitEnhancer: "LinkedIn Headshot AI",
    },
  },
  ko: {
    languageLabel: "언어",
    hero: {
      eyebrow: "Professional profile photo AI",
      titleLine1: "평범한 사진을",
      titleHighlight: "프로필용 결과로",
      subtitleLine1:
        "캐주얼한 사진을 링크드인, 이력서, 팀 소개에 바로 쓸 수 있는 프로필 사진으로 정리합니다.",
      subtitleLine2:
        "구직자, 창업자, 크리에이터처럼 첫인상이 중요한 사용자에게 맞춰진 흐름입니다.",
      primaryCtaSignedOut: "내 프로필 사진 업그레이드",
      primaryCtaSignedIn: "대시보드 열기",
      secondaryCta: "비포 애프터 보기",
      proofPoints: ["LinkedIn-ready", "Business-ready", "CV-ready"],
      imageBeforeLabel: "Before",
      imageAfterLabel: "After",
      imageCaption:
        "캐주얼한 인물 사진을 링크드인, 이력서, 창업자 소개에 맞는 더 믿을 만한 프로필 사진으로 정리합니다.",
    },
    features: {
      eyebrow: "결과 중심",
      heading: "프로필 사진 결과에 맞춘 흐름",
      subheading:
        "사진 한 장으로 시작해 원하는 결과 방향을 잡고, 링크드인이나 CV에 바로 쓸 만한지 빠르게 판단할 수 있게 설계했습니다.",
      koreanPromptInputLabel: "원하는 결과",
      koreanPromptInputText:
        "전문적인 프로필 사진, 더 정돈된 빛, 자연스러운 피부 표현, 더 좋은 첫인상",
      koreanPromptOutputLabel: "모델용 방향 정리",
      koreanPromptOutputText:
        "Professional profile photo, LinkedIn-ready headshot, balanced light, natural skin detail, polished but realistic finish",
      koreanPromptResultLabel: "처리 목표",
      koreanPromptResultMeta: "한국어 / 영어 / 프랑스어 지원",
      items: [
        {
          img: "/landing/feature-enhance-portrait.png",
          title: "비포 애프터 중심 결과 확인",
          desc: "기능 설명보다 결과 차이가 먼저 보이도록 프로필 사진 전후를 바로 보여줍니다.",
        },
        {
          img: "/landing/features/selfie-retouch.png",
          title: "자연스러운 피부와 조명 정리",
          desc: "피부를 과하게 밀지 않고 빛과 얼굴 인상을 더 믿을 만하게 정리합니다.",
        },
        {
          img: "/landing/features/upscale-4k.png",
          title: "흐리거나 작은 사진 복구",
          desc: "예전 셀피나 크롭된 사진이 거의 쓸 만한데 조금 부족할 때 특히 유용합니다.",
        },
        {
          img: "/landing/features/easy-upload.png",
          title: "빠른 업로드와 판단",
          desc: "사진 한 장으로 시작해 결과가 쓸 만한지 짧은 시간 안에 판단할 수 있습니다.",
        },
        {
          img: "/landing/features/fast-process.png",
          title: "링크드인, CV, 팀 소개용",
          desc: "공개 프로필에서 첫인상을 더 좋게 보여야 하는 장면을 우선으로 둡니다.",
        },
        {
          img: "/landing/ai-landing_2.png",
          title: "후보 결과 여러 방향",
          desc: "한 번에 너무 과하게 바꾸기보다 믿을 만한 후보 몇 개를 비교해 최종 사진을 고를 수 있습니다.",
        },
      ],
    },
    gallery: {
      heading: "결과로 먼저 판단하세요",
      subheading:
        "각 예시는 원본 상태, 처리 감각, 실제 사용처를 함께 보여줘 결제 전에 결과 중심으로 판단할 수 있게 합니다.",
      promptLabel: "결과 방향",
      originalStateLabel: "원본 상태",
      turnaroundLabel: "처리 감각",
      resultUseLabel: "추천 용도",
      items: [
        {
          src: "/landing/feature-enhance-portrait.png",
          alt: "전문 프로필 사진 전후 예시",
          label: "LinkedIn-ready",
          title: "평범한 인물 사진을 더 믿을 만한 프로필 사진으로 정리",
          summary:
            "얼굴은 본인답게 유지하면서 빛, 피부 표현, 전체 인상을 공개용 프로필 수준으로 끌어올립니다.",
          prompt:
            "Professional profile photo, LinkedIn-ready headshot, balanced light, natural skin detail, polished but realistic finish.",
          originalState: "구도는 괜찮지만 빛이 평평하고 전체 인상이 다소 지쳐 보이는 캐주얼 사진입니다.",
          turnaround: "대체로 1회 시도.",
          resultUse: "링크드인, 이력서, CV, 창업자 소개, 발표자 소개.",
        },
        {
          src: "/landing/gallery-enhance.png",
          alt: "흐린 프로필 사진 복구 예시",
          label: "비포 / 애프터",
          title: "아쉬운 원본을 다시 쓸 수 있게 복구",
          summary:
            "디테일이 약하고 빛이 부족한 사진을 더 또렷하고 게시 가능한 결과로 정리합니다.",
          prompt:
            "Fix blurry profile photo, improve facial clarity, cleaner skin tone, balanced contrast, keep the face natural.",
          originalState: "대비가 약하고 얼굴이 덜 선명하게 읽히는 오래된 업로드입니다.",
          turnaround: "대체로 1~2회 재시도.",
          resultUse: "재촬영이 어렵거나 지금 가진 사진을 먼저 살려봐야 할 때.",
        },
        {
          src: "/prompt-examples/beauty-portrait.png",
          alt: "창업자 프로필 사진 예시",
          label: "Founder bio",
          title: "창업자나 운영자 소개에 맞는 더 정돈된 헤드샷",
          summary:
            "회사 소개, 뉴스레터, 투자자용 소개에서 반복 노출돼도 어색하지 않은 인상으로 정리합니다.",
          prompt:
            "Business-ready founder headshot, natural skin detail, brighter light, centered composition, credible and polished finish.",
          originalState: "얼굴은 잘 보이지만 공개 소개 페이지에 쓰기에는 마감감이 약한 상태입니다.",
          turnaround: "대체로 1회 시도.",
          resultUse: "창업자 페이지, 팀 소개, 개인 사이트, 소개문.",
        },
        {
          src: "/prompt-examples/cinematic-street.png",
          alt: "크리에이터 프로필 사진 예시",
          label: "Creator profile",
          title: "크리에이터와 프리랜서를 위한 더 강한 프로필 사진",
          summary:
            "개성을 유지하면서도 협업, 소개, 커뮤니티에서 더 좋은 첫인상을 주는 쪽으로 다듬습니다.",
          prompt:
            "Professional creator profile photo, clean facial detail, balanced light, polished but natural finish.",
          originalState: "읽히는 얼굴은 있지만 너무 캐주얼해서 브랜드 협업이나 소개용으로는 약한 사진입니다.",
          turnaround: "1회 시도 후 필요하면 방향만 미세 조정.",
          resultUse: "크리에이터 소개, 프리랜서 프로필, 커뮤니티 바이오, 소셜 아바타.",
        },
      ],
    },
    problem: {
      eyebrow: "첫인상 리스크",
      heading: "지금 프로필 사진이 첫인상을 깎고 있을 수 있습니다",
      subheading:
        "대부분의 문제는 복잡하지 않습니다. 사진이 너무 캐주얼하거나, 빛이 약하거나, 디테일이 부족해서 공개용 프로필로는 약하게 보이는 경우가 많습니다.",
      items: [
        {
          title: "프로필용으로는 너무 캐주얼함",
          desc: "셀피 자체는 괜찮아도 링크드인, 이력서, 창업자 소개 페이지에서는 신뢰감이 약할 수 있습니다.",
        },
        {
          title: "빛과 디테일이 부족함",
          desc: "어두운 조명, 낮은 해상도, 흐린 디테일은 사람보다 사진 품질이 먼저 보이게 만듭니다.",
        },
        {
          title: "공개 프로필 인상이 제각각임",
          desc: "같은 약한 사진이 여러 공개 페이지에 반복되면 첫인상 문제도 같이 커집니다.",
        },
      ],
    },
    useCases: {
      eyebrow: "사용 장면",
      heading: "프로필 사진으로 평가받는 사용자에게 맞춘 흐름",
      subheading:
        "가장 명확한 사용 장면은 모두 같습니다. 공적인 맥락에서 실제 사람을 대신 보여주는 사진이고, 여기서는 신뢰가 빠르게 읽혀야 합니다.",
      items: [
        {
          title: "구직자",
          desc: "지원서, 이력서, CV, 링크드인에 들어가는 사진을 더 믿을 만하게 정리합니다.",
          bullets: ["링크드인 프로필 정리", "이력서와 CV 헤드샷", "지원용 프로필 사진"],
        },
        {
          title: "창업자와 운영자",
          desc: "팀 소개, 바이오, 뉴스레터, 투자자용 소개에 반복되는 프로필 사진을 정리합니다.",
          bullets: ["창업자 소개 헤드샷", "팀 디렉터리 사진", "발표자 페이지 이미지"],
        },
        {
          title: "크리에이터와 프리랜서",
          desc: "개성을 유지하면서도 소개, 협업, 커뮤니티에서 더 좋은 첫인상을 주는 쪽으로 정리합니다.",
          bullets: ["크리에이터 프로필", "프리랜서 소개 사진", "커뮤니티 아바타 업그레이드"],
        },
      ],
    },
    trust: {
      eyebrow: "신뢰",
      heading: "신뢰는 과장된 주장보다 결과에서 나와야 합니다",
      subheading:
        "이 랜딩은 먼저 믿을 만해야 합니다. 분명한 결과, 현실적인 예시, 검증되지 않은 사회적 증거 배제가 기본입니다.",
      note:
        "검증되지 않은 수치, 가짜 후기, 명시적 동의 없는 사용자 증언은 공개하지 않습니다.",
      items: [
        {
          title: "현실적인 결과 표현",
          desc: "비현실적으로 완벽한 사진이 아니라 더 정돈되고 더 믿을 만한 프로필 사진이라는 점을 강조합니다.",
        },
        {
          title: "페이지 전반의 메시지 일관성",
          desc: "홈, SEO 페이지, 가격, 로그인 흐름까지 모두 같은 프로필 사진 약속을 유지해야 합니다.",
        },
        {
          title: "채우기용 문구보다 실제 증거",
          desc: "가능하면 비포 애프터와 실제 예시를 우선하고, 일반적인 AI 툴 수사는 줄입니다.",
        },
      ],
    },
    footer: {
      description:
        "링크드인 헤드샷, 이력서 사진, 공개 프로필용 이미지를 위한 프로필 사진 AI.",
      contactLabel: "문의",
      contactPage: "문의",
      refundPolicy: "환불 정책",
      pricing: "요금제",
      privacy: "개인정보처리방침",
      terms: "이용약관",
      aiImageGenerator: "AI 프로필 사진 생성기",
      aiPhotoEnhancer: "AI 프로필 사진 보정",
      aiPortraitEnhancer: "LinkedIn 헤드샷 AI",
    },
  },
  fr: {
    languageLabel: "Langue",
    hero: {
      eyebrow: "IA photo de profil professionnelle",
      titleLine1: "Transformez une photo ordinaire en",
      titleHighlight: "photo de profil pro",
      subtitleLine1:
        "EditLuma transforme une photo casual en image de profil credible pour LinkedIn, CV, et pages equipe.",
      subtitleLine2:
        "Le flux est pense pour les chercheurs d'emploi, fondateurs, createurs, et tous ceux qui ont besoin d'une meilleure premiere impression.",
      primaryCtaSignedOut: "Ameliorer ma photo de profil",
      primaryCtaSignedIn: "Ouvrir le tableau de bord",
      secondaryCta: "Voir avant / apres",
      proofPoints: ["LinkedIn-ready", "Business-ready", "CV-ready"],
      imageBeforeLabel: "Before",
      imageAfterLabel: "After",
      imageCaption:
        "Une photo casual devient une image de profil plus credible pour LinkedIn, CV, et bios publiques.",
    },
    features: {
      eyebrow: "Resultat",
      heading: "Pense pour le resultat photo de profil",
      subheading:
        "Partez d'une photo simple, choisissez la direction souhaitee, puis jugez vite si le resultat est assez fort pour LinkedIn, un CV, ou une page equipe.",
      koreanPromptInputLabel: "Resultat vise",
      koreanPromptInputText:
        "Photo de profil professionnelle, lumiere plus propre, peau naturelle, meilleure premiere impression",
      koreanPromptOutputLabel: "Direction prete pour le modele",
      koreanPromptOutputText:
        "Professional profile photo, LinkedIn-ready headshot, balanced light, natural skin detail, polished but realistic finish",
      koreanPromptResultLabel: "Cible de traitement",
      koreanPromptResultMeta: "Coreen / anglais / francais",
      items: [
        {
          img: "/landing/feature-enhance-portrait.png",
          title: "Resultats avant / apres",
          desc: "Montrez la difference entre la photo source et le rendu final pour vendre le resultat, pas la liste des fonctions.",
        },
        {
          img: "/landing/features/selfie-retouch.png",
          title: "Peau et lumiere naturelles",
          desc: "Nettoyez le visage et l'eclairage sans perdre la credibilite du sujet.",
        },
        {
          img: "/landing/features/upscale-4k.png",
          title: "Sauvetage des photos trop faibles",
          desc: "Utile quand un selfie ancien ou un recadrage est presque exploitable mais encore trop faible.",
        },
        {
          img: "/landing/features/easy-upload.png",
          title: "Upload et revue rapides",
          desc: "Ajoutez une photo, regardez vite le resultat, puis decidez si l'image est prete a etre publiee.",
        },
        {
          img: "/landing/features/fast-process.png",
          title: "Pour LinkedIn, CV, et bios",
          desc: "Le produit est centre sur les cas ou une meilleure premiere impression compte immediatement.",
        },
        {
          img: "/landing/ai-landing_2.png",
          title: "Plusieurs directions credibles",
          desc: "Testez quelques variantes plausibles avant de garder la meilleure photo de profil.",
        },
      ],
    },
    gallery: {
      heading: "Le resultat d'abord",
      subheading:
        "Chaque exemple montre l'etat de depart, le rythme de traitement, et l'usage public du resultat final.",
      promptLabel: "Direction du resultat",
      originalStateLabel: "Etat initial",
      turnaroundLabel: "Rythme typique",
      resultUseLabel: "Meilleur usage",
      items: [
        {
          src: "/landing/feature-enhance-portrait.png",
          alt: "Exemple de photo de profil professionnelle",
          label: "LinkedIn-ready",
          title: "Une photo casual rendue plus credible pour le profil public",
          summary:
            "Le visage reste believable pendant que la lumiere, la texture, et la finition deviennent plus professionnelles.",
          prompt:
            "Professional profile photo, LinkedIn-ready headshot, balanced light, natural skin detail, polished but realistic finish.",
          originalState: "Portrait casual avec cadrage correct mais lumiere plate et finition fatiguee.",
          turnaround: "En general une passe.",
          resultUse: "LinkedIn, CV, pages fondateur, et bios publiques.",
        },
        {
          src: "/landing/gallery-enhance.png",
          alt: "Exemple de reparation photo de profil floue",
          label: "Avant / apres",
          title: "Une source faible devient de nouveau exploitable",
          summary:
            "Le manque de detail et la lumiere faible sont corriges assez pour rendre l'image plus credible et publiable.",
          prompt:
            "Fix blurry profile photo, improve facial clarity, cleaner skin tone, balanced contrast, keep the face natural.",
          originalState: "Ancien upload avec contraste faible et visage moins lisible que voulu.",
          turnaround: "En general une a deux reprises.",
          resultUse: "Rafraichir un profil quand refaire toute la photo n'est pas realiste.",
        },
        {
          src: "/prompt-examples/beauty-portrait.png",
          alt: "Exemple de photo fondateur",
          label: "Founder bio",
          title: "Une image plus nette pour page fondateur ou operateur",
          summary:
            "Le portrait devient plus propre et plus fiable pour pages equipe, newsletters, et presentations publiques.",
          prompt:
            "Business-ready founder headshot, natural skin detail, brighter light, centered composition, credible and polished finish.",
          originalState: "Visage lisible mais encore trop faible pour un usage public repete.",
          turnaround: "En general une passe.",
          resultUse: "Pages fondateur, annuaires equipe, sites personnels, et bios.",
        },
        {
          src: "/prompt-examples/cinematic-street.png",
          alt: "Exemple de photo createur",
          label: "Creator profile",
          title: "Une photo de profil plus forte pour createurs et freelances",
          summary:
            "Le rendu garde de la personnalite tout en renforcant la premiere impression sur les plateformes publiques.",
          prompt:
            "Professional creator profile photo, clean facial detail, balanced light, polished but natural finish.",
          originalState: "Portrait lisible mais encore trop casual pour du business, des bios, ou de l'outreach.",
          turnaround: "Une passe puis leger ajustement si besoin.",
          resultUse: "Bios createur, profils freelance, pages communaute, et avatars.",
        },
      ],
    },
    problem: {
      eyebrow: "Risque de premiere impression",
      heading: "Votre photo de profil actuelle peut affaiblir la premiere impression",
      subheading:
        "Le probleme est souvent simple: la photo est trop casual, la lumiere est faible, ou la qualite n'est pas assez forte pour un usage public.",
      items: [
        {
          title: "Trop casual pour un usage professionnel",
          desc: "Un selfie acceptable peut encore envoyer un mauvais signal sur LinkedIn, un CV, ou une bio fondateur.",
        },
        {
          title: "Lumiere faible et details mous",
          desc: "Une photo sombre ou trop douce donne une impression plus faible que la personne qu'elle represente.",
        },
        {
          title: "Presence publique incoherente",
          desc: "Quand la meme image faible apparait partout, le probleme de premiere impression grandit sur chaque surface publique.",
        },
      ],
    },
    useCases: {
      eyebrow: "Cas d'usage",
      heading: "Pense pour les personnes jugees par leur photo de profil",
      subheading:
        "Les meilleurs cas d'usage ont un point commun: la photo represente une vraie personne dans un contexte public ou la confiance compte vite.",
      items: [
        {
          title: "Chercheurs d'emploi",
          desc: "Renforcez la photo utilisee sur LinkedIn, CV, et candidatures.",
          bullets: ["Rafraichir LinkedIn", "Headshot CV", "Photo de candidature"],
        },
        {
          title: "Fondateurs et operateurs",
          desc: "Nettoyez l'image repetee sur bios, pages equipe, newsletters, et presentatons publiques.",
          bullets: ["Headshot fondateur", "Photo annuaire equipe", "Image page speaker"],
        },
        {
          title: "Createurs et freelances",
          desc: "Gardez de la personnalite tout en renforcant la credibilite sur les profils publics.",
          bullets: ["Photo bio createur", "Profil freelance", "Upgrade avatar communaute"],
        },
      ],
    },
    trust: {
      eyebrow: "Confiance",
      heading: "La confiance doit venir du resultat, pas de promesses gonflees",
      subheading:
        "Cette page doit paraitre credible avant de paraitre impressionnante. Resultats clairs, exemples realistes, et aucune preuve sociale douteuse.",
      note:
        "Ne publiez pas de chiffres non verifies ni de temoignages sans permission explicite.",
      items: [
        {
          title: "Resultats credibles",
          desc: "Positionnez le rendu comme plus propre et plus professionnel, pas comme une perfection irreelle.",
        },
        {
          title: "Message coherent",
          desc: "Gardez la meme promesse photo de profil sur la home, les pages SEO, les tarifs, et les flux auth.",
        },
        {
          title: "Vraies preuves",
          desc: "Preferez avant / apres et exemples realistes a des affirmations generiques sur l'IA.",
        },
      ],
    },
    footer: {
      description:
        "IA photo de profil pour headshots LinkedIn, photos de CV, et profils publics plus credibles.",
      contactLabel: "Contact",
      contactPage: "Contact",
      refundPolicy: "Politique de remboursement",
      pricing: "Tarifs",
      privacy: "Politique de confidentialite",
      terms: "Conditions d'utilisation",
      aiImageGenerator: "Generateur de photo de profil IA",
      aiPhotoEnhancer: "Amelioration photo de profil IA",
      aiPortraitEnhancer: "LinkedIn Headshot AI",
    },
  },
};
