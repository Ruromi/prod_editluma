export type KeywordLandingHighlight = {
  label: string;
  value: string;
  detail: string;
};

export type KeywordLandingBenefit = {
  title: string;
  description: string;
};

export type KeywordLandingStep = {
  title: string;
  description: string;
};

export type KeywordLandingUseCase = {
  title: string;
  description: string;
  bullets: string[];
};

export type KeywordLandingFaq = {
  question: string;
  answer: string;
};

export type KeywordLandingRelatedPage = {
  href: string;
  title: string;
  description: string;
};

export type KeywordLandingCtaVariant = {
  label: string;
  supportingText: string;
};

export type KeywordLandingContent = {
  path: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryKeyword: string;
  secondaryKeyword: string;
  heroVisual: {
    src: string;
    alt: string;
    badge: string;
    caption: string;
  };
  highlights: KeywordLandingHighlight[];
  benefitsIntro: string;
  benefits: KeywordLandingBenefit[];
  workflowIntro: string;
  steps: KeywordLandingStep[];
  useCasesIntro: string;
  useCases: KeywordLandingUseCase[];
  faqIntro: string;
  faq: KeywordLandingFaq[];
  relatedIntro: string;
  relatedPages: KeywordLandingRelatedPage[];
  cta: {
    eyebrow: string;
    heading: string;
    body: string;
    primaryHref: string;
    secondaryHref: string;
    secondaryLabel: string;
    variants: KeywordLandingCtaVariant[];
    activeVariantIndex: number;
  };
};

export type KeywordLandingRoute = {
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  page: KeywordLandingContent;
};

const signupGenerateHref = `/auth/signup?next=${encodeURIComponent("/dashboard?tab=generate")}`;

export const aiImageGeneratorLanding: KeywordLandingRoute = {
  metadata: {
    title: "AI Profile Photo Generator for First-Draft Headshots",
    description:
      "Generate first-draft profile photos and AI headshots, then refine the strongest result for LinkedIn, resumes, and founder bios.",
    keywords: [
      "AI profile photo generator",
      "AI headshot generator",
      "AI LinkedIn photo generator",
      "professional profile picture generator",
    ],
  },
  page: {
    path: "/ai-image-generator",
    eyebrow: "AI Profile Photo Generator",
    title: "Generate first-draft profile photos before you polish the final headshot",
    description:
      "EditLuma helps you turn a short direction into a usable profile-photo draft, then keep the best version for cleanup, retouching, and final export.",
    primaryKeyword: "AI profile photo generator",
    secondaryKeyword: "AI headshot generator",
    heroVisual: {
      src: "/landing/ai-landing.png",
      alt: "Sample AI-generated profile photo draft preview",
      badge: "Draft then refine",
      caption: "Best when you need a fast starting point for LinkedIn, CV, founder, or creator profile photos.",
    },
    highlights: [
      {
        label: "Best for",
        value: "New profile photo drafts",
        detail: "Useful when you need a fresh profile-photo starting point instead of fixing an existing image.",
      },
      {
        label: "Output style",
        value: "Believable headshot directions",
        detail: "Generate a few credible profile-photo candidates, then keep the one worth polishing.",
      },
      {
        label: "Workflow fit",
        value: "Generate -> choose -> polish",
        detail: "Keep the winning draft inside EditLuma for enhancement, retouching, and final export.",
      },
    ],
    benefitsIntro:
      "This page is strongest when the visitor needs a new profile photo direction fast. The goal is not endless concept art, but a believable draft that can become a real public-facing headshot.",
    benefits: [
      {
        title: "Start from a fresh profile-photo concept",
        description:
          "Generate a new profile-photo direction when the current selfie or headshot is too weak to save.",
      },
      {
        title: "Compare believable options quickly",
        description:
          "Try different first-impression directions before choosing the one that feels right for public use.",
      },
      {
        title: "Polish the strongest draft inside the same product",
        description:
          "Move the winning candidate into portrait cleanup or photo enhancement without restarting somewhere else.",
      },
      {
        title: "Match role-specific profile needs",
        description:
          "Generate a first draft for job seeking, founder bios, creator pages, or team profiles, then refine around that use case.",
      },
    ],
    workflowIntro:
      "A short prompt with role, first impression, and photo style is usually enough. Start simple, review a few believable candidates, and polish the best one.",
    steps: [
      {
        title: "Describe the role and first impression",
        description:
          "Start with the use case, such as LinkedIn, CV, founder bio, or creator profile, then add lighting and presentation notes.",
      },
      {
        title: "Pick the most believable draft",
        description:
          "Review a few generated candidates and keep the one that looks the most credible and closest to public use.",
      },
      {
        title: "Refine for final profile use",
        description:
          "Use portrait cleanup or photo enhancement if the selected draft needs better skin detail, sharper clarity, or more polish.",
      },
    ],
    useCasesIntro:
      "These are the situations where visitors need a new profile-photo direction, not just a generic AI image.",
    useCases: [
      {
        title: "Job seekers who need a new headshot fast",
        description:
          "Generate a cleaner first draft for LinkedIn, resumes, CVs, and job application profiles.",
        bullets: [
          "LinkedIn profile image drafts",
          "Resume and CV photo directions",
          "Job application headshot candidates",
        ],
      },
      {
        title: "Founders and operators updating public bios",
        description:
          "Create a more intentional first draft for founder pages, personal sites, newsletters, and investor-facing intros.",
        bullets: [
          "Founder bio photo drafts",
          "Personal website headshots",
          "Team page candidate images",
        ],
      },
      {
        title: "Creators and freelancers refreshing their profile image",
        description:
          "Explore profile-photo directions that still feel personal but read as more polished and intentional.",
        bullets: [
          "Creator bio photos",
          "Freelance profile images",
          "Community avatar refreshes",
        ],
      },
      {
        title: "Teams testing a new public-photo style",
        description:
          "Use first-draft directions to explore a cleaner profile-photo standard before batch cleanup work starts.",
        bullets: [
          "Headshot style exploration",
          "Directory photo direction tests",
          "Speaker bio draft concepts",
        ],
      },
    ],
    faqIntro:
      "Search visitors mostly want to know whether this is a realistic starting point for a public-facing profile photo. Keep expectations simple and judge the best draft, not the first weak one.",
    faq: [
      {
        question: "What should I include in the prompt?",
        answer:
          "Keep it short. Include the role, the kind of profile you need, and the first impression you want. For example: LinkedIn headshot, cleaner light, natural skin detail, business-ready finish.",
      },
      {
        question: "Is this better than fixing my current photo?",
        answer:
          "Use this page when the current photo is too weak or too casual to save. If you already have a usable source image, the profile-photo or portrait enhancement pages are usually the better fit.",
      },
      {
        question: "What if the draft looks close but not final?",
        answer:
          "Keep the strongest candidate and move it into portrait cleanup or photo enhancement. That is usually faster than regenerating everything from zero.",
      },
      {
        question: "Is this for LinkedIn only?",
        answer:
          "No. It also works for CVs, founder pages, speaker bios, creator profiles, and team directories. LinkedIn is simply the clearest example of the use case.",
      },
    ],
    relatedIntro:
      "This page captures visitors who want a new profile-photo starting point. Once the visitor has a draft, the next useful page is usually cleanup or pricing.",
    relatedPages: [
      {
        href: "/ai-portrait-enhancer",
        title: "LinkedIn Headshot AI",
        description: "Move here when the visitor wants the strongest profile-photo positioning and portrait-specific cleanup.",
      },
      {
        href: "/ai-photo-enhancer",
        title: "AI Profile Photo Enhancer",
        description: "Use this when the visitor already has a photo and mainly needs clarity, light, or detail repair.",
      },
      {
        href: "/pricing",
        title: "Credit Pricing",
        description: "Review credit packages before generating multiple drafts or polishing several headshot candidates.",
      },
    ],
    cta: {
      eyebrow: "Profile photo workflow",
      heading: "Start with a draft you can actually review",
      body:
        "If you need a new profile photo direction, begin with a short prompt, review a few believable candidates, and keep the one worth polishing.",
      primaryHref: signupGenerateHref,
      secondaryHref: "/pricing",
      secondaryLabel: "See pricing",
      variants: [
        {
          label: "Generate my profile photo",
          supportingText: "Best when you need a fresh starting point, not just a cleanup pass.",
        },
        {
          label: "Create a first-draft headshot",
          supportingText: "Alternate CTA copy for visitors who search with headshot-first intent.",
        },
      ],
      activeVariantIndex: 0,
    },
  },
};

export const aiPhotoEnhancerLanding: KeywordLandingRoute = {
  metadata: {
    title: "AI Profile Photo Enhancer for Blurry or Low-Light Shots",
    description:
      "Fix blurry, dim, or low-resolution profile photos with EditLuma's AI profile photo enhancer for cleaner LinkedIn, resume, and team-page images.",
    keywords: [
      "AI profile photo enhancer",
      "fix blurry profile photo",
      "LinkedIn photo AI",
      "professional headshot enhancer",
    ],
  },
  page: {
    path: "/ai-photo-enhancer",
    eyebrow: "AI Profile Photo Enhancer",
    title: "Fix blurry or low-light profile photos before you replace them",
    description:
      "EditLuma helps you recover weak profile photos so they look cleaner, sharper, and more credible on LinkedIn, CVs, team pages, and founder bios.",
    primaryKeyword: "AI profile photo enhancer",
    secondaryKeyword: "fix blurry profile photo",
    heroVisual: {
      src: "/landing/gallery-enhance.png",
      alt: "Enhanced profile photo preview showing cleaner detail",
      badge: "Repair weak profile photos",
      caption: "Built for profile shots that are almost usable but still too soft, dim, or rough for a strong first impression.",
    },
    highlights: [
      {
        label: "Best for",
        value: "Blurry or dim profile shots",
        detail: "Useful when the visitor already has a profile photo but it looks too soft, underlit, or low-resolution.",
      },
      {
        label: "Result style",
        value: "Sharper, cleaner first impression",
        detail: "Improve clarity and presentation while keeping the face believable and easy to publish.",
      },
      {
        label: "Workflow fit",
        value: "Upload -> enhance",
        detail: "A fast repair path for LinkedIn photos, CV headshots, founder bios, and team pages.",
      },
    ],
    benefitsIntro:
      "This workflow is for rescuing an existing profile photo, not replacing it with a totally new concept. Use it when the current image is close, but still too weak for public-facing use.",
    benefits: [
      {
        title: "Rescue an existing profile photo first",
        description:
          "Upgrade the photo you already have before spending time on a reshoot or a fully new generated concept.",
      },
      {
        title: "Repair clarity, light, and texture",
        description:
          "Fix softness, weak lighting, and low-resolution issues that make a public profile photo feel less credible.",
      },
      {
        title: "Keep the face believable",
        description:
          "The goal is a cleaner profile photo, not an overprocessed face that looks obviously filtered.",
      },
      {
        title: "Ship faster across public pages",
        description:
          "Use the improved photo across LinkedIn, resumes, team pages, speaker bios, and founder intros once it is ready.",
      },
    ],
    workflowIntro:
      "A practical repair loop is simple: upload the weak source image, run one cleanup pass, and decide whether the result is now strong enough for the profile use case you care about.",
    steps: [
      {
        title: "Upload the current profile photo",
        description:
          "Bring in the image you actually use today, even if it is cropped, softly focused, compressed, or a little dark.",
      },
      {
        title: "Run a profile-photo enhancement pass",
        description:
          "Repair light balance, facial clarity, and rough detail so the image reads more cleanly in public-facing contexts.",
      },
      {
        title: "Check if it is ready to publish",
        description:
          "Compare the result against the original and decide whether the upgraded version is strong enough for LinkedIn, a CV, or a team page.",
      },
    ],
    useCasesIntro:
      "The strongest use cases are profile photos that are almost strong enough to keep, but not yet strong enough to ship.",
    useCases: [
      {
        title: "Old LinkedIn or profile photos",
        description:
          "Rescue an older headshot or selfie that still represents you correctly but no longer looks polished enough.",
        bullets: [
          "LinkedIn profile cleanup",
          "Personal website profile refreshes",
          "Archived selfie recovery",
        ],
      },
      {
        title: "Resume and CV headshots",
        description:
          "Make a current profile shot look more professional before it goes on a resume, CV, or application packet.",
        bullets: [
          "Resume photo cleanup",
          "CV headshot upgrades",
          "Application profile refreshes",
        ],
      },
      {
        title: "Founder and team pages",
        description:
          "Improve existing team or founder photos when they look slightly too soft or too casual for company-facing use.",
        bullets: [
          "Founder bio repair",
          "Directory headshot cleanup",
          "Speaker page image fixes",
        ],
      },
      {
        title: "Creator and freelance profiles",
        description:
          "Strengthen the current avatar or profile image without losing the subject's recognizability and personality.",
        bullets: [
          "Creator bio image repair",
          "Freelancer profile cleanup",
          "Community avatar refreshes",
        ],
      },
    ],
    faqIntro:
      "Visitors usually want to know whether their current photo can be saved or whether they should start over. These are the key decision points.",
    faq: [
      {
        question: "What kinds of profile photos improve the most?",
        answer:
          "Profile photos that are slightly blurry, dim, compressed, or low-resolution usually improve the most. If the source image is already strong, the lift will be more subtle.",
      },
      {
        question: "Will the result look fake or oversharpened?",
        answer:
          "The goal is a cleaner, more readable profile photo, not a filtered look. You should still review the export and keep the version that feels believable.",
      },
      {
        question: "Can I use a cropped selfie?",
        answer:
          "Yes. A cropped selfie can work if the framing is usable and the face is still readable. If the source is too weak or too casual, the generator page may be the better fit.",
      },
      {
        question: "When should I use the portrait enhancer instead?",
        answer:
          "Use the portrait enhancer when the image is primarily about a face or headshot and the visitor wants the strongest profile-photo-specific positioning and cleanup.",
      },
    ],
    relatedIntro:
      "This page is the repair route for weak existing profile photos. When the visitor needs stronger portrait positioning or a new starting point, send them to the next best workflow below.",
    relatedPages: [
      {
        href: "/ai-portrait-enhancer",
        title: "LinkedIn Headshot AI",
        description: "Use the portrait-focused page when the visitor is clearly looking for the main profile-photo offer.",
      },
      {
        href: "/ai-image-generator",
        title: "AI Profile Photo Generator",
        description: "Start here when the visitor needs a brand-new profile-photo direction instead of repairing an old image.",
      },
      {
        href: "/pricing",
        title: "Credit Pricing",
        description: "Review package sizing before cleaning up several profile photos or running repeated revisions.",
      },
    ],
    cta: {
      eyebrow: "Profile photo repair",
      heading: "See if your current profile photo can be rescued first",
      body:
        "If your current photo is almost usable but still too soft, dim, or rough for public-facing use, start with one cleanup pass before you replace it entirely.",
      primaryHref: signupGenerateHref,
      secondaryHref: "/pricing",
      secondaryLabel: "View pricing",
      variants: [
        {
          label: "Enhance my profile photo",
          supportingText: "Best when the visitor already has a photo and wants to rescue it before doing anything heavier.",
        },
        {
          label: "Fix a blurry headshot",
          supportingText: "Alternate CTA copy for visitors who search with repair-first intent.",
        },
      ],
      activeVariantIndex: 0,
    },
  },
};

export const aiPortraitEnhancerLanding: KeywordLandingRoute = {
  metadata: {
    title: "AI Profile Photo Generator | LinkedIn Headshot AI",
    description:
      "Turn a casual portrait into a LinkedIn-ready, business-grade profile photo with EditLuma's AI headshot workflow.",
    keywords: [
      "AI profile photo generator",
      "LinkedIn headshot AI",
      "professional headshot AI",
      "AI LinkedIn photo",
    ],
  },
  page: {
    path: "/ai-portrait-enhancer",
    eyebrow: "Professional Profile Photo AI",
    title: "Upgrade your profile photo before your next application, pitch, or intro",
    description:
      "EditLuma turns casual portraits into cleaner, more credible profile photos for LinkedIn, resumes, founder pages, speaker bios, and creator profiles.",
    primaryKeyword: "LinkedIn headshot AI",
    secondaryKeyword: "professional headshot AI",
    heroVisual: {
      src: "/landing/feature-enhance-portrait.png",
      alt: "Professional profile photo upgrade example",
      badge: "Before / after profile upgrade",
      caption: "Built for casual photos that need a stronger first impression without looking fake.",
    },
    highlights: [
      {
        label: "Best for",
        value: "LinkedIn, CV, and founder photos",
        detail: "Useful for job seekers, founders, creators, freelancers, and anyone who needs a cleaner public-facing profile image.",
      },
      {
        label: "Result style",
        value: "Business-ready, believable polish",
        detail: "The result should look stronger and more intentional while still feeling like the original person.",
      },
      {
        label: "Workflow fit",
        value: "Upload -> preview -> choose final",
        detail: "A focused route for visitors who care about first impression, profile readiness, and public-facing trust.",
      },
    ],
    benefitsIntro:
      "Profile-photo visitors care about one thing above all: whether the result looks professional enough to ship without looking fake. This page is built around that decision.",
    benefits: [
      {
        title: "Look professional without a photoshoot",
        description:
          "Turn a casual photo into something more credible for job applications, founder intros, and public-facing profiles.",
      },
      {
        title: "Keep the face believable",
        description:
          "Improve lighting, texture, and polish without pushing the face into an obviously overedited result.",
      },
      {
        title: "Fit multiple public profile surfaces",
        description:
          "Use the final image across LinkedIn, resumes, founder pages, team directories, speaker bios, and social profiles.",
      },
      {
        title: "Compare a few candidate directions quickly",
        description:
          "Move faster by reviewing a few profile-photo directions and choosing the one that gives the strongest first impression.",
      },
    ],
    workflowIntro:
      "The goal is not to rebuild a face. It is to make a usable casual photo feel cleaner, more balanced, and ready for the public profile contexts where people judge you quickly.",
    steps: [
      {
        title: "Upload a casual portrait or selfie",
        description:
          "Start with the photo you already have, whether that is a selfie, a casual portrait, or a cropped headshot from a larger frame.",
      },
      {
        title: "Apply a profile-photo direction",
        description:
          "Choose a direction that emphasizes cleaner light, believable skin detail, and a more professional first impression.",
      },
      {
        title: "Review the most credible final result",
        description:
          "Judge the image like a LinkedIn headshot or public bio photo. If a version feels overdone, keep the more natural result.",
      },
    ],
    useCasesIntro:
      "These use cases are all about public-facing photos that represent a real person. The standard is trust, clarity, and a stronger first impression.",
    useCases: [
      {
        title: "Job seekers and career transitions",
        description:
          "Upgrade a casual photo before it appears on LinkedIn, resumes, CVs, and application materials.",
        bullets: [
          "LinkedIn-ready profile photos",
          "Resume and CV headshots",
          "Application profile upgrades",
        ],
      },
      {
        title: "Founders, operators, and team leads",
        description:
          "Use a stronger headshot for founder bios, team pages, personal sites, investor intros, and speaker pages.",
        bullets: [
          "Founder bio headshots",
          "Startup team profiles",
          "Speaker and advisor pages",
        ],
      },
      {
        title: "Creators and freelancers",
        description:
          "Polish profile photos that show up across bios, communities, outreach, and brand-facing touchpoints.",
        bullets: [
          "Freelancer profile photos",
          "Creator bio upgrades",
          "Portfolio about-page portraits",
        ],
      },
      {
        title: "Team and speaker directories",
        description:
          "Create a more consistent, professional headshot standard across company and event pages.",
        bullets: [
          "Conference speaker photos",
          "Directory profile images",
          "Company-wide profile refreshes",
        ],
      },
    ],
    faqIntro:
      "Visitors usually care about whether this can replace a weak profile photo without making the face look fake. These are the core questions to answer.",
    faq: [
      {
        question: "Can I start from a casual selfie?",
        answer:
          "Yes. A casual selfie can work as long as the face is readable and the framing is usable. The point of this workflow is to make an ordinary portrait feel more professional.",
      },
      {
        question: "Will the result look overedited?",
        answer:
          "It should not. The target is believable polish, not a plastic skin result. Review the final options and keep the one that still looks like you.",
      },
      {
        question: "Is this only for LinkedIn?",
        answer:
          "No. It also fits resumes, CVs, founder pages, team directories, speaker bios, freelance profiles, and creator about pages. LinkedIn is simply the clearest search intent.",
      },
      {
        question: "When should I use the photo enhancer instead?",
        answer:
          "Use the photo enhancer when the visitor already has the right image and mainly needs clarity or light repair. Use this page when the goal is the strongest profile-photo-specific positioning and polish.",
      },
    ],
    relatedIntro:
      "This is the main profile-photo offer. The related pages below handle photo repair, brand-new draft generation, and the pricing step that usually follows intent.",
    relatedPages: [
      {
        href: "/ai-photo-enhancer",
        title: "AI Profile Photo Enhancer",
        description: "Use this when the visitor already has a photo and mainly needs blur, light, or clarity repair.",
      },
      {
        href: "/ai-image-generator",
        title: "AI Profile Photo Generator",
        description: "Use this when the visitor needs a brand-new draft direction before cleanup and final polish.",
      },
      {
        href: "/pricing",
        title: "Credit Pricing",
        description: "Review package options before running several profile-photo candidates, cleanups, or retries.",
      },
    ],
    cta: {
      eyebrow: "Professional profile photo AI",
      heading: "Upgrade your profile photo now",
      body:
        "Start with one casual photo and see whether it can become the professional image you want people to judge you by.",
      primaryHref: signupGenerateHref,
      secondaryHref: "/pricing",
      secondaryLabel: "See credit packages",
      variants: [
        {
          label: "Upgrade my profile photo",
          supportingText: "Best when the visitor wants the clearest profile-photo-specific promise and result.",
        },
        {
          label: "Create a LinkedIn-ready headshot",
          supportingText: "Alternate CTA copy for visitors who search with LinkedIn-first headshot intent.",
        },
      ],
      activeVariantIndex: 0,
    },
  },
};
