"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { broadcastCreditBalance } from "@/lib/credits";
import { useAppLanguage } from "@/lib/use-app-language";
import { createClient } from "@/lib/supabase/client";
import type { HeaderLanguage } from "@/lib/landing-language";

type JobStatus = "pending" | "processing" | "done" | "failed";
type JobMode = "enhance" | "generate";

interface Job {
  id: string;
  filename: string;
  type: "image";
  mode?: JobMode;
  prompt?: string;
  original_prompt?: string;
  enhanced_prompt?: string;
  status: JobStatus;
  created_at: string;
  output_key?: string;
  output_url?: string;
  remaining_credits?: number;
  credit_cost?: number;
}

interface CreditSummary {
  balance: number;
  cost_per_image: number;
}

const MAX_UPLOAD_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);
const ALLOWED_UPLOAD_ACCEPT = Array.from(ALLOWED_UPLOAD_TYPES).join(",");
const DASHBOARD_DRAFT_STORAGE_KEY = "editluma:dashboard-draft";

type DashboardDraft = {
  prompt: string;
  hadAttachment: boolean;
};

type ProfilePreset = {
  id: "linkedin" | "business" | "casual";
  label: {
    en: string;
    ko: string;
  };
  summary: {
    en: string;
    ko: string;
  };
  prompt: {
    en: string;
    ko: string;
  };
};

const PROFILE_PRESETS: ProfilePreset[] = [
  {
    id: "linkedin",
    label: {
      en: "LinkedIn",
      ko: "LinkedIn",
    },
    summary: {
      en: "Balanced light, cleaner skin detail, and a profile-ready crop.",
      ko: "균형 잡힌 조명, 정리된 피부결, 프로필에 바로 쓰기 좋은 인상.",
    },
    prompt: {
      en: "LinkedIn-ready profile photo, balanced light, natural skin detail, clean background, polished but realistic finish",
      ko: "LinkedIn용 프로필 사진, 균형 잡힌 조명, 자연스러운 피부결, 깔끔한 배경, 현실적으로 정돈된 마무리",
    },
  },
  {
    id: "business",
    label: {
      en: "Business",
      ko: "Business",
    },
    summary: {
      en: "Sharper headshot presentation for team pages, resumes, and founder bios.",
      ko: "팀 페이지, 이력서, 대표 소개용으로 더 단정한 헤드샷 인상.",
    },
    prompt: {
      en: "Business-ready headshot, cleaner skin tone, stronger facial clarity, neat framing, realistic professional finish",
      ko: "비즈니스용 헤드샷, 더 정돈된 피부 톤, 또렷한 얼굴 인상, 단정한 구도, 현실적인 프로페셔널 마무리",
    },
  },
  {
    id: "casual",
    label: {
      en: "Casual",
      ko: "Casual",
    },
    summary: {
      en: "Keep the face believable while softening rough light and everyday selfie noise.",
      ko: "일상 셀피 느낌은 유지하면서 거친 조명과 잡티만 부드럽게 정리.",
    },
    prompt: {
      en: "Casual profile portrait, softer light, natural skin cleanup, believable facial detail, relaxed but polished result",
      ko: "캐주얼 프로필 포트레이트, 부드러운 조명, 자연스러운 피부 정리, 현실적인 얼굴 디테일, 편안하지만 정돈된 결과",
    },
  },
];

const DASHBOARD_COPY = {
  en: {
    pending: "Pending",
    processing: "Processing",
    done: "Done",
    failed: "Failed",
    enhance: "AI Enhance",
    generate: "AI Generate",
    pixelProcessing: "AI is assembling your image...",
    pixelPending: "Waiting...",
    noImage: "No image",
    download: "Download",
    close: "Close",
    inputPrompt: "Input Prompt",
    aiPrompt: "AI Refined Prompt",
    generatedGallery: "Generated Gallery",
    generatingCount: (count: number) => `${count} generating`,
    noImagesYet: "No generated images yet",
    createFirstImage: "Attach one portrait or enter one portrait prompt to get your first usable result.",
    sessionExpired: "Your session has expired. Please sign in again.",
    apiConnErrWithUrl: (apiUrl: string) =>
      `Cannot connect to the API server (${apiUrl}). Check the server URL and network status.`,
    apiConnErrRelative:
      "Cannot connect to the API server. Make sure the Next.js and FastAPI servers are running.",
    promptRequired: "Enter a prompt.",
    loadingUser: "Loading your account. Please try again in a moment.",
    invalidFileType: "Use JPG, PNG, WEBP, GIF, or HEIC for portrait uploads.",
    maxFileSize: "Use an image smaller than 15MB.",
    uploading: "Uploading...",
    generating: "Generating...",
    generateAction: "Generate portrait",
    enhanceAction: "Enhance photo",
    generationFailed: "Generation failed",
    generationFailedHint: "Retry with a clearer portrait prompt or a stronger source image.",
    uploadPrepFailed: () => "We couldn't prepare the upload. Try again in a moment.",
    uploadNetworkFailed: "The upload stopped before your photo reached us. Check the connection and retry.",
    uploadFailed: (status: number, detail?: string) =>
      detail ? `The upload did not finish: ${detail}` : `The upload did not finish. Retry with the same photo or a smaller file.`,
    requestFailed: () => "We couldn't start the enhancement job. Try a clearer portrait or retry in a minute.",
    aiRequestFailed: () =>
      "We couldn't start the generation job. Try a shorter portrait prompt or retry in a minute.",
    redirectingToGallery: "Redirecting to gallery...",
    promptPlaceholder: "Add one short direction or tap a preset below.",
    attachImage: "Attach portrait",
    cancelAttachment: "Remove attachment",
    attachTitle: "Attach a profile photo, selfie, or headshot to keep the result closer to the source.",
    enterPromptTitle: "Enter a prompt",
    insufficientCreditsTitle: "You need more credits. We'll open pricing and keep this prompt ready.",
    unknownError: "Unknown error",
    promptExamples: "Portrait Prompt Starters",
    promptExamplesHint:
      "Use a preset first, then borrow one of these longer prompt examples only if the first preview still needs more direction.",
    hidePrompt: "Hide prompt",
    clickImage: "Click image",
    appliedToInput: "Applied to the input box",
    expandPrompt: "View full image + show prompt",
    promptLabel: "Prompt",
    loadingDashboard: "Loading dashboard...",
    firstRunEyebrow: "First result",
    firstRunTitle: "See one usable profile-photo result before you do anything else",
    firstRunBody:
      "Start with one source photo or one short preset-led prompt. The goal is to preview a believable profile-photo result fast, then decide whether to refine it further.",
    firstRunCreditSummary: (balance: number | null, cost: number) => {
      if (typeof balance === "number") {
        return `You have ${balance} credits available now. One profile result currently uses ${cost} credits.`;
      }

      return `One profile result currently uses ${cost} credits.`;
    },
    firstRunStepUploadTitle: "Use one source photo when you want cleanup",
    firstRunStepUploadBody: "Profile photos, selfies, and speaker headshots under 15MB work best for the first enhancement.",
    firstRunStepPromptTitle: "Start with LinkedIn, Business, or Casual",
    firstRunStepPromptBody: "Use one preset first, then add one short direction only if the preview still needs more control.",
    firstRunStepReviewTitle: "Review the preview before spending more",
    firstRunStepReviewBody: "Check the first result quickly. If the face feels off, switch preset or replace the source instead of forcing the same draft.",
    composerHintWithAttachment:
      "Source image attached. We'll keep the face closer to the original and clean up the portrait.",
    composerHintWithoutAttachment:
      "No image attached. Use this to generate a new portrait or a profile-photo variation from the prompt alone.",
    submitShortcutHint: "Press Cmd/Ctrl + Enter to submit.",
    signupSuccessMessage:
      "Account ready. Upload one portrait or use one preset to see your first profile-photo result.",
    resumeDraftMessage: "Your last prompt is back. You can continue from here.",
    resumeEnhanceDraftMessage:
      "Your last prompt is back. Reattach the source photo before running the enhancement again.",
    paymentReadyMessage: "Credits are ready. Your previous prompt has been restored.",
    paymentReadyGeneric: "Credits are ready. Continue from the dashboard when you're ready.",
  },
  ko: {
    pending: "대기 중",
    processing: "처리 중",
    done: "완료",
    failed: "실패",
    enhance: "AI 보정",
    generate: "AI 생성",
    pixelProcessing: "AI가 이미지를 조합하고 있어요…",
    pixelPending: "대기 중…",
    noImage: "이미지 없음",
    download: "다운로드",
    close: "닫기",
    inputPrompt: "입력 프롬프트",
    aiPrompt: "AI 보정 프롬프트",
    generatedGallery: "생성 갤러리",
    generatingCount: (count: number) => `${count}개 생성 중`,
    noImagesYet: "아직 생성된 이미지가 없습니다",
    createFirstImage: "프로필 사진을 첨부하거나 인물 프롬프트를 입력해 첫 결과를 만들어 보세요.",
    sessionExpired: "세션이 만료되었습니다. 다시 로그인하세요.",
    apiConnErrWithUrl: (apiUrl: string) =>
      `API 서버(${apiUrl})에 연결할 수 없습니다. 서버 URL과 네트워크 상태를 확인하세요.`,
    apiConnErrRelative:
      "API 서버에 연결할 수 없습니다. Next.js 개발 서버와 FastAPI 서버가 실행 중인지 확인하세요.",
    promptRequired: "프롬프트를 입력하세요.",
    loadingUser: "사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도하세요.",
    invalidFileType: "프로필 사진 업로드는 JPG, PNG, WEBP, GIF, HEIC 파일만 지원합니다.",
    maxFileSize: "15MB 이하 이미지를 사용해 주세요.",
    uploading: "업로드 중…",
    generating: "생성 중…",
    generateAction: "인물 이미지 생성",
    enhanceAction: "사진 보정하기",
    generationFailed: "생성 실패",
    generationFailedHint: "더 선명한 인물 프롬프트나 원본 사진으로 다시 시도해 보세요.",
    uploadPrepFailed: () => "업로드를 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    uploadNetworkFailed: "사진 업로드가 중간에 멈췄습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.",
    uploadFailed: (status: number, detail?: string) =>
      detail ? `파일 업로드를 완료하지 못했습니다: ${detail}` : "파일 업로드를 완료하지 못했습니다. 같은 사진으로 다시 시도하거나 용량을 줄여 주세요.",
    requestFailed: () => "보정 작업을 시작하지 못했습니다. 더 선명한 인물 사진으로 다시 시도하거나 잠시 후 다시 실행해 주세요.",
    aiRequestFailed: () =>
      "생성 작업을 시작하지 못했습니다. 인물 중심의 짧은 프롬프트로 다시 시도하거나 잠시 후 다시 실행해 주세요.",
    redirectingToGallery: "갤러리로 이동 중…",
    promptPlaceholder: "짧은 방향 1줄만 적거나 아래 프리셋을 먼저 눌러 보세요.",
    attachImage: "원본 사진 첨부",
    cancelAttachment: "첨부 취소",
    attachTitle: "프로필 사진, 셀피, 헤드샷을 첨부하면 원본 얼굴과 더 가깝게 보정할 수 있습니다.",
    enterPromptTitle: "프롬프트를 입력하세요",
    insufficientCreditsTitle: "크레딧이 부족합니다. 요금제 페이지로 이동하고 현재 프롬프트는 보관해 둘게요.",
    unknownError: "알 수 없는 오류",
    promptExamples: "인물 프롬프트 시작 예시",
    promptExamplesHint:
      "먼저 프리셋으로 시작하고, 첫 프리뷰가 더 다듬어져야 할 때만 긴 예시 프롬프트를 가져다 쓰세요.",
    hidePrompt: "프롬프트 숨기기",
    clickImage: "이미지 클릭",
    appliedToInput: "입력창에 적용되었습니다",
    expandPrompt: "전체 이미지 보기 + 프롬프트 펼치기",
    promptLabel: "Prompt",
    loadingDashboard: "대시보드를 불러오는 중입니다…",
    firstRunEyebrow: "첫 결과 만들기",
    firstRunTitle: "다른 것보다 먼저, 프로필용 첫 결과 1장을 확인하세요",
    firstRunBody:
      "원본 사진 1장이나 프리셋 중심의 짧은 프롬프트 1개로 시작하세요. 목표는 빨리 믿을 만한 첫 결과를 보고, 더 다듬을지 판단하는 것입니다.",
    firstRunCreditSummary: (balance: number | null, cost: number) => {
      if (typeof balance === "number") {
        return `현재 사용 가능한 크레딧은 ${balance}입니다. 프로필 결과 1건당 현재 ${cost}크레딧이 사용됩니다.`;
      }

      return `프로필 결과 1건당 현재 ${cost}크레딧이 사용됩니다.`;
    },
    firstRunStepUploadTitle: "보정이 목적이면 원본 사진 1장을 먼저 붙이기",
    firstRunStepUploadBody: "프로필 사진, 셀피, 발표자 헤드샷처럼 얼굴이 또렷한 15MB 이하 사진이 첫 보정에 가장 잘 맞습니다.",
    firstRunStepPromptTitle: "LinkedIn, Business, Casual 중 하나로 시작하기",
    firstRunStepPromptBody: "먼저 프리셋 하나를 고르고, 첫 프리뷰에 부족한 부분이 있을 때만 짧은 문장을 추가하세요.",
    firstRunStepReviewTitle: "첫 프리뷰를 보고 바로 판단하기",
    firstRunStepReviewBody: "얼굴이 어색하면 같은 초안을 밀기보다 프리셋을 바꾸거나 더 나은 원본으로 다시 시도하는 편이 낫습니다.",
    composerHintWithAttachment:
      "원본 사진이 첨부되었습니다. 얼굴은 원본에 가깝게 유지하고 인물 사진을 정리하는 흐름으로 처리됩니다.",
    composerHintWithoutAttachment:
      "원본 사진이 없으면 프롬프트만으로 새 인물 이미지나 프로필 사진 변형을 생성합니다.",
    submitShortcutHint: "Cmd/Ctrl + Enter로 바로 실행할 수 있습니다.",
    signupSuccessMessage:
      "계정이 준비되었습니다. 인물 사진 1장을 올리거나 프리셋 하나를 골라 첫 결과를 확인해 보세요.",
    resumeDraftMessage: "이전 프롬프트를 다시 불러왔습니다. 이어서 진행하면 됩니다.",
    resumeEnhanceDraftMessage:
      "이전 프롬프트를 다시 불러왔습니다. 보정 작업을 다시 실행하려면 원본 사진을 다시 첨부해 주세요.",
    paymentReadyMessage: "크레딧이 준비되었습니다. 이전 프롬프트도 다시 채워 두었습니다.",
    paymentReadyGeneric: "크레딧이 반영되었습니다. 준비되면 대시보드에서 바로 이어서 진행하세요.",
  },
} as const;

const PROMPT_EXAMPLES = [
  {
    id: "creator-profile",
    label: {
      en: "Creator Profile Cleanup",
      ko: "크리에이터 프로필 정리",
    },
    image: "/landing/feature-enhance-portrait.png",
    prompt: {
      en: "Clean creator portrait, natural skin detail, balanced light, polished but realistic finish, profile photo framing",
      ko: "클린한 크리에이터 프로필 포트레이트, 자연스러운 피부결, 균형 잡힌 조명, 과하지 않게 정돈된 현실적인 마무리, 프로필 사진 구도",
    },
  },
  {
    id: "selfie-retouch",
    label: {
      en: "Natural Selfie Retouch",
      ko: "자연스러운 셀피 보정",
    },
    image: "/prompt-examples/beauty-portrait.png",
    prompt: {
      en: "Natural selfie retouch, cleaner skin tone, softer under-eye area, brighter light, keep the face believable and realistic",
      ko: "자연스러운 셀피 보정, 더 정돈된 피부 톤, 은은한 눈가 정리, 조금 더 밝은 조명, 얼굴은 현실적으로 유지",
    },
  },
  {
    id: "portrait-recovery",
    label: {
      en: "Low-Light Portrait Recovery",
      ko: "저조도 인물 사진 복원",
    },
    image: "/landing/gallery-enhance.png",
    prompt: {
      en: "Recover a dim portrait, cleaner face detail, balanced contrast, remove muddy shadows, keep the result natural and publishable",
      ko: "어두운 인물 사진 복원, 얼굴 디테일 정리, 대비 균형 조정, 탁한 그림자 제거, 결과는 자연스럽고 바로 쓸 수 있게",
    },
  },
  {
    id: "social-thumbnail",
    label: {
      en: "Social Thumbnail Portrait",
      ko: "소셜 썸네일용 인물",
    },
    image: "/prompt-examples/cinematic-street.png",
    prompt: {
      en: "Portrait for a social thumbnail, strong eye contact, warm editorial light, soft background separation, realistic skin detail",
      ko: "소셜 썸네일용 인물 포트레이트, 또렷한 시선 처리, 따뜻한 에디토리얼 조명, 배경 분리감, 사실적인 피부 디테일",
    },
  },
];

function saveDashboardDraft(prompt: string, hadAttachment: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) {
    window.sessionStorage.removeItem(DASHBOARD_DRAFT_STORAGE_KEY);
    return;
  }

  const payload: DashboardDraft = {
    prompt: trimmedPrompt,
    hadAttachment,
  };
  window.sessionStorage.setItem(DASHBOARD_DRAFT_STORAGE_KEY, JSON.stringify(payload));
}

function readDashboardDraft() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(DASHBOARD_DRAFT_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as DashboardDraft;
    if (typeof parsed.prompt !== "string" || !parsed.prompt.trim()) {
      return null;
    }

    return {
      prompt: parsed.prompt.trim(),
      hadAttachment: Boolean(parsed.hadAttachment),
    };
  } catch {
    return null;
  }
}

function clearDashboardDraft() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(DASHBOARD_DRAFT_STORAGE_KEY);
}

function localizeApiDetail(detail: string, fallback: string, language: HeaderLanguage) {
  const normalized = detail.trim();
  if (!normalized) {
    return fallback;
  }

  const promptLengthMatch = normalized.match(/^프롬프트는 최대 (\d+)자까지 입력할 수 있습니다\.$/);
  if (promptLengthMatch) {
    return language === "ko"
      ? normalized
      : `Prompts can be up to ${promptLengthMatch[1]} characters.`;
  }

  const uploadSizeMatch = normalized.match(/^업로드 가능한 최대 파일 크기는 (\d+)MB입니다\.$/);
  if (uploadSizeMatch) {
    return language === "ko"
      ? normalized
      : `Use an image smaller than ${uploadSizeMatch[1]}MB.`;
  }

  const detailMap: Record<string, { en: string; ko: string }> = {
    "프롬프트를 입력해주세요.": {
      en: "Enter a prompt.",
      ko: "프롬프트를 입력해 주세요.",
    },
    "이미지 파일만 업로드할 수 있습니다.": {
      en: "Upload an image file only.",
      ko: "이미지 파일만 업로드할 수 있습니다.",
    },
    "이미지 파일만 보정할 수 있습니다.": {
      en: "Only image files can be enhanced.",
      ko: "이미지 파일만 보정할 수 있습니다.",
    },
    "지원하지 않는 이미지 형식입니다.": {
      en: "This image format is not supported.",
      ko: "지원하지 않는 이미지 형식입니다.",
    },
    "업로드한 이미지를 찾지 못했습니다.": {
      en: "We couldn't find that upload. Attach the image again and retry.",
      ko: "업로드한 이미지를 찾지 못했습니다. 원본 사진을 다시 첨부한 뒤 재시도해 주세요.",
    },
    "본인이 업로드한 이미지만 사용할 수 있습니다.": {
      en: "You can only enhance images uploaded from this account.",
      ko: "본인이 업로드한 이미지만 사용할 수 있습니다.",
    },
    "AI 작업을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.": {
      en: "The AI could not finish this request. Try again in a moment.",
      ko: "AI 작업을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    },
  };

  const mapped = detailMap[normalized];
  if (mapped) {
    return mapped[language];
  }

  if (language === "en" && /[가-힣]/.test(normalized)) {
    return fallback;
  }

  return normalized;
}

async function readApiError(response: Response, fallback: string, language: HeaderLanguage) {
  try {
    const payload = await response.json();
    if (payload && typeof payload.detail === "string") {
      return localizeApiDetail(payload.detail, fallback, language);
    }
  } catch {
    // fall back to the provided message
  }
  return fallback;
}

const STATUS_COLOR: Record<JobStatus, string> = {
  pending: "text-yellow-700 bg-yellow-400/10",
  processing: "text-blue-600 bg-blue-400/10",
  done: "text-green-600 bg-green-400/10",
  failed: "text-red-600 bg-red-400/10",
};

const POLL_INTERVAL_MS = 3000;

// ---------------------------------------------------------------------------
// Mosaic Assembly – image pieces fly in and assemble into a photo
// ---------------------------------------------------------------------------
const MOSAIC_COLORS = [
  ["#818cf8", "#6366f1", "#4f46e5"],  // row 0: indigo tones
  ["#a78bfa", "#8b5cf6", "#7c3aed"],  // row 1: violet tones
  ["#67e8f9", "#22d3ee", "#06b6d4"],  // row 2: cyan tones
];

function PixelAgent({
  status,
  language,
}: {
  status: "pending" | "processing";
  language: HeaderLanguage;
}) {
  const isProcessing = status === "processing";
  const dur = "3.5s";
  const copy = DASHBOARD_COPY[language];

  return (
    <div className="flex flex-col items-center gap-5 select-none">
      {/* Mosaic frame */}
      <div className="relative" style={{ width: 138, height: 138 }}>
        {/* Outer glow ring when processing */}
        {isProcessing && (
          <div
            className="absolute rounded-2xl"
            style={{
              inset: -6,
              border: "2px solid rgba(129,140,248,0.3)",
              animation: "mosaic-pulse-ring 2s ease-out infinite",
            }}
          />
        )}

        {/* Frame border */}
        <div
          className="absolute inset-0 rounded-xl border-2 border-gray-300/50 overflow-hidden"
          style={{ animation: isProcessing ? `mosaic-glow ${dur} ease-in-out infinite` : "none" }}
        >
          {/* 3×3 mosaic grid */}
          <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-[2px] bg-gray-50 p-[2px]">
            {Array.from({ length: 9 }).map((_, i) => {
              const row = Math.floor(i / 3);
              const col = i % 3;
              return (
                <div
                  key={i}
                  className="rounded-sm relative overflow-hidden"
                  style={{
                    background: isProcessing ? MOSAIC_COLORS[row][col] : "#e5e7eb",
                    animation: isProcessing
                      ? `mosaic-piece-${i} ${dur} cubic-bezier(0.34, 1.56, 0.64, 1) infinite`
                      : "none",
                    opacity: isProcessing ? undefined : 0.3,
                  }}
                >
                  {/* Inner texture – subtle gradient */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)`,
                    }}
                  />
                  {/* Pixel dots for texture */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: 4, height: 4,
                      background: "rgba(255,255,255,0.2)",
                      top: 6 + (i % 3) * 4,
                      left: 8 + (i % 2) * 6,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Center image icon (appears after pieces settle) */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            opacity: isProcessing ? 0 : 0.4,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-400"
            width={32} height={32}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Floating particles when processing */}
        {isProcessing && (
          <>
            {[
              { x: -8, y: 20, size: 5, color: "#c4b5fd", delay: "0s" },
              { x: 140, y: 40, size: 4, color: "#67e8f9", delay: "0.8s" },
              { x: 30, y: -8, size: 3, color: "#a78bfa", delay: "1.6s" },
              { x: 110, y: 142, size: 4, color: "#818cf8", delay: "0.4s" },
              { x: -6, y: 100, size: 3, color: "#22d3ee", delay: "1.2s" },
              { x: 142, y: 110, size: 3, color: "#6366f1", delay: "2.0s" },
            ].map((p, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: p.size, height: p.size,
                  background: p.color,
                  left: p.x, top: p.y,
                  animation: `mosaic-float-dot 2s ease-in-out infinite ${p.delay}`,
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Status text */}
      <div className="flex items-center gap-2">
        {isProcessing && (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                style={{ animation: `mosaic-float-dot 1.2s ease-in-out infinite ${i * 0.3}s` }}
              />
            ))}
          </div>
        )}
        <span className="text-xs text-gray-500 font-mono tracking-tight">
          {isProcessing ? copy.pixelProcessing : copy.pixelPending}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gallery card: skeleton shimmer for pending / processing
// ---------------------------------------------------------------------------
function SkeletonCard({
  job,
  language,
}: {
  job: Job;
  language: HeaderLanguage;
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
      {/* Pixel agent area */}
      <div className="aspect-square relative overflow-hidden bg-white/80">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <PixelAgent language={language} status={job.status as "pending" | "processing"} />
        </div>
      </div>
      {/* Meta */}
      <div className="p-3 space-y-2">
        {job.prompt ? (
          <p className="text-xs text-gray-400 truncate">{job.prompt}</p>
        ) : (
          <div className="h-2.5 bg-gray-100 rounded animate-pulse w-3/4" />
        )}
        <div className="h-2 bg-gray-100 rounded animate-pulse w-2/5" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image detail modal
// ---------------------------------------------------------------------------
function ImageDetailModal({
  job,
  onClose,
  language,
}: {
  job: Job;
  onClose: () => void;
  language: HeaderLanguage;
}) {
  const originalPrompt = job.original_prompt || job.prompt;
  const enhancedPrompt = job.enhanced_prompt;
  const copy = DASHBOARD_COPY[language];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white border border-gray-200 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        {job.output_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={job.output_url}
            alt={originalPrompt ?? job.filename}
            className="w-full rounded-t-2xl object-cover"
          />
        ) : (
          <div className="aspect-square flex items-center justify-center bg-gray-50 rounded-t-2xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Info */}
        <div className="p-5 space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {new Date(job.created_at).toLocaleString(language === "ko" ? "ko-KR" : "en-US")}
            </span>
            <div className="flex items-center gap-3">
              {job.output_url && (
                <a
                  href={job.output_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:text-indigo-500 hover:underline transition-colors"
                >
                  {copy.download}
                </a>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-400 transition-colors"
                aria-label={copy.close}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 입력 프롬프트 */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {copy.inputPrompt}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {originalPrompt || "—"}
            </p>
          </div>

          {/* AI 보정 프롬프트 */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
              {copy.aiPrompt}
            </h3>
            <p className="text-sm text-indigo-600 leading-relaxed">
              {enhancedPrompt || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gallery card: completed / failed job
// ---------------------------------------------------------------------------
function GalleryCard({
  job,
  onClick,
  language,
}: {
  job: Job;
  onClick: () => void;
  language: HeaderLanguage;
}) {
  const isDone = job.status === "done";
  const [imgError, setImgError] = useState(false);
  const copy = DASHBOARD_COPY[language];

  return (
    <div
      className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group cursor-pointer hover:border-gray-300 transition-colors"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div
        className={`aspect-square relative overflow-hidden flex items-center justify-center ${
          isDone && !job.output_url
            ? "bg-gradient-to-br from-indigo-50 to-gray-900"
            : !isDone
            ? "bg-gradient-to-br from-red-50 to-gray-900"
            : imgError
            ? "bg-gradient-to-br from-indigo-50 to-gray-900"
            : ""
        }`}
      >
        {isDone && job.output_url && !imgError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={job.output_url}
            alt=""
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : isDone || imgError ? (
          <div className="flex flex-col items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {imgError && (
              <span className="text-xs text-indigo-400">{copy.noImage}</span>
            )}
          </div>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        )}
        {/* Status badge */}
        <span
          className={`absolute top-2 right-2 px-2 py-0.5 text-xs rounded-full border font-medium ${
            isDone
              ? "bg-green-50 text-green-600 border-green-300"
              : "bg-red-50 text-red-600 border-red-300"
          }`}
        >
          {isDone ? copy.done : copy.failed}
        </span>
      </div>
      {/* Meta */}
      <div className="p-3 space-y-2">
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed min-h-[2.25rem]">
          {job.original_prompt || job.prompt || "—"}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(job.created_at).toLocaleString(language === "ko" ? "ko-KR" : "en-US")}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gallery section
// ---------------------------------------------------------------------------
function GallerySection({
  jobs,
  language,
}: {
  jobs: Job[];
  language: HeaderLanguage;
}) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const copy = DASHBOARD_COPY[language];

  const activeJobs = jobs.filter(
    (j) => j.status === "pending" || j.status === "processing"
  );
  const finishedJobs = jobs.filter(
    (j) => j.status === "done" || j.status === "failed"
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {copy.generatedGallery}
        </h2>
        {activeJobs.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-blue-600">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            {copy.generatingCount(activeJobs.length)}
          </span>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-2xl py-14 flex flex-col items-center gap-2 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-gray-500 mb-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-500 text-sm">{copy.noImagesYet}</p>
          <p className="text-gray-800 text-xs">
            {copy.createFirstImage}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Active jobs (skeleton) shown first */}
          {activeJobs.map((job) => (
            <SkeletonCard key={job.id} job={job} language={language} />
          ))}
          {/* Finished jobs */}
          {finishedJobs.map((job) => (
            <GalleryCard key={job.id} job={job} language={language} onClick={() => setSelectedJob(job)} />
          ))}
        </div>
      )}

      {selectedJob && (
        <ImageDetailModal job={selectedJob} language={language} onClose={() => setSelectedJob(null)} />
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard page
// ---------------------------------------------------------------------------
function DashboardPageContent() {
  const language = useAppLanguage("en");
  const copy = DASHBOARD_COPY[language];
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = (searchParams.get("tab") ?? "generate") as "generate" | "gallery" | "history";

  const [supabase] = useState(createClient);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [creditCost, setCreditCost] = useState(10);
  const [expandedPromptExample, setExpandedPromptExample] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<ProfilePreset["id"]>("linkedin");
  const [isDropActive, setIsDropActive] = useState(false);
  const [previewRevealed, setPreviewRevealed] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const handledResumeRef = useRef<string | null>(null);

  // 로컬 개발: NEXT_PUBLIC_API_URL을 비워두면 상대 경로(/api/*)를 사용하며
  // Next.js 리라이트가 FastAPI로 프록시 → CORS 불필요.
  // 원격 API 사용 시에만 절대 URL을 설정하세요.
  const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

  // 연결 실패 시 보여줄 힌트 메시지를 API_URL 설정에 맞게 생성합니다.
  const apiConnErrMsg = API_URL
    ? copy.apiConnErrWithUrl(API_URL)
    : copy.apiConnErrRelative;

  const getAccessToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, [supabase]);

  const apiFetch = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error(copy.sessionExpired);
      }

      const headers = new Headers(init.headers ?? undefined);
      if (init.body && !headers.has("Content-Type") && typeof init.body === "string") {
        headers.set("Content-Type", "application/json");
      }
      headers.set("Authorization", `Bearer ${accessToken}`);

      return fetch(`${API_URL}${path}`, {
        ...init,
        headers,
      });
    },
    [API_URL, getAccessToken]
  );

  // -------------------------------------------------------------------------
  // Fetch current user on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, [supabase]);

  useEffect(() => {
    const resume = searchParams.get("resume");
    if (!resume || handledResumeRef.current === resume) {
      return;
    }

    handledResumeRef.current = resume;

    const draft = readDashboardDraft();
    if (draft && !prompt.trim()) {
      setPrompt(draft.prompt);
    }

    if (draft?.hadAttachment) {
      setStatusMessage(copy.resumeEnhanceDraftMessage);
    } else if (draft && resume === "payment-success") {
      setStatusMessage(copy.paymentReadyMessage);
    } else if (draft) {
      setStatusMessage(copy.resumeDraftMessage);
    } else if (resume === "payment-success") {
      setStatusMessage(copy.paymentReadyGeneric);
    }

    clearDashboardDraft();

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("resume");
    const nextQuery = nextParams.toString();
    router.replace(`/dashboard${nextQuery ? `?${nextQuery}` : ""}`);
  }, [copy.paymentReadyGeneric, copy.paymentReadyMessage, copy.resumeDraftMessage, copy.resumeEnhanceDraftMessage, prompt, router, searchParams]);

  // -------------------------------------------------------------------------
  // Job fetching & polling
  // -------------------------------------------------------------------------
  const fetchJobs = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await apiFetch("/api/jobs");
      if (!res.ok) return;
      const data: Job[] = await res.json();
      setJobs(data);
    } catch {
      // silently ignore polling errors
    }
  }, [apiFetch, userId]);

  const updateCreditBalance = useCallback((nextBalance: number) => {
    setCreditBalance(nextBalance);
    broadcastCreditBalance(nextBalance);
  }, []);

  const redirectToPricing = useCallback(
    (mode: JobMode) => {
      saveDashboardDraft(prompt, mode === "enhance");

      const params = new URLSearchParams({
        source: "insufficient-credits",
        intent: mode,
        returnTo: "/dashboard?tab=generate&resume=credit-topup",
      });

      router.push(`/pricing?${params.toString()}`);
    },
    [prompt, router]
  );

  const fetchCredits = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await apiFetch("/api/credits/me");
      if (!res.ok) return;
      const data: CreditSummary = await res.json();
      updateCreditBalance(data.balance);
      setCreditCost(data.cost_per_image);
    } catch {
      // silently ignore polling errors
    }
  }, [apiFetch, updateCreditBalance, userId]);

  // Initial load when userId is ready
  useEffect(() => {
    fetchJobs();
    fetchCredits();
  }, [fetchJobs, fetchCredits]);

  useEffect(() => {
    if (tab === "history") {
      router.replace("/mypage");
    }
  }, [router, tab]);

  // Poll every POLL_INTERVAL_MS while any job is pending/processing
  useEffect(() => {
    const hasActive = jobs.some(
      (j) => j.status === "pending" || j.status === "processing"
    );
    if (!hasActive) return;
    const timer = setTimeout(fetchJobs, POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [jobs, fetchJobs]);

  useEffect(() => {
    if (activeJobId) {
      setPreviewRevealed(false);
    }
  }, [activeJobId]);

  const handleFileSelection = useCallback((nextFile: File | null) => {
    if (!nextFile) {
      setAttachedFile(null);
      return;
    }

    if (!ALLOWED_UPLOAD_TYPES.has(nextFile.type)) {
      setError(copy.invalidFileType);
      return;
    }

    if (nextFile.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
      setError(copy.maxFileSize);
      return;
    }

    setAttachedFile(nextFile);
    setError(null);
  }, [copy.invalidFileType, copy.maxFileSize]);

  const applyPreset = useCallback((presetId: ProfilePreset["id"]) => {
    const preset = PROFILE_PRESETS.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }

    setSelectedPresetId(presetId);
    setPrompt(preset.prompt[language]);
    setError(null);
    promptTextareaRef.current?.focus();
  }, [language]);

  // -------------------------------------------------------------------------
  // AI 요청 (이미지 첨부 시 보정, 없으면 프롬프트 기반 생성)
  // -------------------------------------------------------------------------
  async function handleGenerate() {
    if (!prompt.trim()) {
      setError(copy.promptRequired);
      return;
    }

    if (!userId) {
      setError(copy.loadingUser);
      return;
    }

    if (attachedFile && !ALLOWED_UPLOAD_TYPES.has(attachedFile.type)) {
      setError(copy.invalidFileType);
      return;
    }

    if (attachedFile && attachedFile.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
      setError(copy.maxFileSize);
      return;
    }

    if (creditBalance !== null && creditBalance < creditCost) {
      setError(null);
      redirectToPricing(attachedFile ? "enhance" : "generate");
      return;
    }

    setError(null);
    setSubmitting(true);
    setPreviewRevealed(false);

    // 파일 첨부된 경우: 업로드 후 이미지 보정 요청
    if (attachedFile) {
      setUploading(true);
      try {
        let presignRes: Response;
        try {
          presignRes = await apiFetch("/api/upload/presign", {
            method: "POST",
            body: JSON.stringify({
              filename: attachedFile.name,
              content_type: attachedFile.type,
              file_size: attachedFile.size,
            }),
          });
        } catch (err) {
          throw new Error(err instanceof Error ? err.message : apiConnErrMsg);
        }
        if (!presignRes.ok) {
          throw new Error(await readApiError(presignRes, copy.uploadPrepFailed(), language));
        }
        const { upload_url, object_key, upload_fields } = await presignRes.json();

        let putRes: Response;
        try {
          if (upload_fields && typeof upload_fields === "object" && Object.keys(upload_fields).length > 0) {
            const formData = new FormData();
            Object.entries(upload_fields as Record<string, string>).forEach(([key, value]) => {
              formData.append(key, value);
            });
            formData.append("file", attachedFile);
            putRes = await fetch(upload_url, {
              method: "POST",
              body: formData,
            });
          } else {
            putRes = await fetch(upload_url, {
              method: "PUT",
              headers: attachedFile.type ? { "Content-Type": attachedFile.type } : undefined,
              body: attachedFile,
            });
          }
        } catch {
          throw new Error(copy.uploadNetworkFailed);
        }
        if (!putRes.ok) {
          const uploadErrorText = (await putRes.text()).trim().slice(0, 240);
          throw new Error(copy.uploadFailed(putRes.status, uploadErrorText || undefined));
        }

        setUploading(false);

        let res: Response;
        try {
          res = await apiFetch("/api/ai/enhance", {
            method: "POST",
            body: JSON.stringify({ object_key, prompt: prompt.trim() }),
          });
        } catch (err) {
          throw new Error(err instanceof Error ? err.message : apiConnErrMsg);
        }
        if (res.status === 402) {
          setError(null);
          redirectToPricing("enhance");
          return;
        }
        if (!res.ok) {
          throw new Error(await readApiError(res, copy.requestFailed(), language));
        }
        const newJob: Job = await res.json();
        setJobs((prev) => [newJob, ...prev]);
        if (typeof newJob.remaining_credits === "number") {
          updateCreditBalance(newJob.remaining_credits);
        }
        setActiveJobId(newJob.id);
        setAttachedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setPrompt("");
        clearDashboardDraft();
      } catch (err) {
        setError(err instanceof Error ? err.message : copy.unknownError);
      } finally {
        setUploading(false);
        setSubmitting(false);
      }
      return;
    }

    // 파일 없는 경우: 프롬프트 기반 생성
    try {
      let res: Response;
      try {
        res = await apiFetch("/api/ai/generate", {
          method: "POST",
          body: JSON.stringify({ prompt: prompt.trim() }),
        });
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : apiConnErrMsg);
      }
      if (res.status === 402) {
        setError(null);
        redirectToPricing("generate");
        return;
      }
      if (!res.ok) {
        throw new Error(
          await readApiError(res, copy.aiRequestFailed(), language)
        );
      }
      const newJob: Job = await res.json();
      setJobs((prev) => [newJob, ...prev]);
      if (typeof newJob.remaining_credits === "number") {
        updateCreditBalance(newJob.remaining_credits);
      }
      setActiveJobId(newJob.id);
      setPrompt("");
      clearDashboardDraft();
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.unknownError);
    } finally {
      setSubmitting(false);
    }
  }

  const generateJobs = jobs.filter((j) => j.mode === "generate" || j.mode === "enhance");

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

      {/* ------------------------------------------------------------------ */}
      {/* 생성 탭                                                               */}
      {/* ------------------------------------------------------------------ */}
      {tab === "generate" && (() => {
        const previewJob = activeJobId ? jobs.find((j) => j.id === activeJobId) ?? null : null;
        const showLocalPreview = submitting && !previewJob;
        const localPreviewStatus: "pending" | "processing" = uploading ? "pending" : "processing";
        const previewStatus = previewJob?.status ?? null;
        const isActive = previewStatus === "pending" || previewStatus === "processing";
        const isDone = previewStatus === "done";
        const hasEnoughCredits = creditBalance === null || creditBalance >= creditCost;
        const showFirstRunOnboarding = generateJobs.length === 0 && !previewJob && !showLocalPreview;
        const submitButtonLabel = attachedFile ? copy.enhanceAction : copy.generateAction;
        const selectedPreset =
          PROFILE_PRESETS.find((preset) => preset.id === selectedPresetId) ?? PROFILE_PRESETS[0];

        return (
          <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center gap-5 max-w-2xl mx-auto w-full">
            {statusMessage && (
              <div className="w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                {statusMessage}
              </div>
            )}

            {showFirstRunOnboarding && (
              <section className="w-full overflow-hidden rounded-[28px] border border-gray-200 bg-white/90 shadow-sm">
                <div className="border-b border-gray-200 bg-gradient-to-br from-white via-sky-50 to-indigo-50 px-5 py-5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-sky-700">
                    {copy.firstRunEyebrow}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
                    {copy.firstRunTitle}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {copy.firstRunBody}
                  </p>
                  <p className="mt-4 text-sm font-medium text-gray-800">
                    {copy.firstRunCreditSummary(creditBalance, creditCost)}
                  </p>
                </div>

                <div className="grid gap-3 p-5 sm:grid-cols-3">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                      01
                    </p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {copy.firstRunStepUploadTitle}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {copy.firstRunStepUploadBody}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                      02
                    </p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {copy.firstRunStepPromptTitle}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {copy.firstRunStepPromptBody}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                      03
                    </p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {copy.firstRunStepReviewTitle}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {copy.firstRunStepReviewBody}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* 프리뷰 카드 */}
            {(previewJob || showLocalPreview) && (
              <div className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-2xl">
                {showLocalPreview ? (
                  <div className="aspect-square w-full bg-white/80 flex flex-col items-center justify-center">
                    <PixelAgent language={language} status={localPreviewStatus} />
                  </div>
                ) : previewJob && isActive ? (
                  <div className="aspect-square w-full bg-white/80 flex flex-col items-center justify-center">
                    <PixelAgent language={language} status={previewJob.status as "pending" | "processing"} />
                  </div>
                ) : previewJob && isDone && previewJob.output_url ? (
                  <div className="aspect-square w-full relative animate-fade-in">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewJob.output_url}
                      alt={previewJob.prompt ?? ""}
                      className={`w-full h-full object-cover transition-all duration-300 ${
                        previewRevealed ? "" : "scale-[1.01]"
                      }`}
                    />
	                    {!previewRevealed && (
	                      <>
	                        <div className="absolute inset-x-0 top-0 flex items-center px-4 py-4">
	                          <span className="rounded-full border border-white/20 bg-black/45 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white">
	                            {language === "ko" ? "프리뷰" : "Preview"}
	                          </span>
	                        </div>
	                        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-black/28 backdrop-blur-xl" />
	                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <div className="rounded-2xl border border-white/10 bg-black/45 p-4 text-white shadow-2xl backdrop-blur">
                            <p className="text-sm font-semibold">
                              {language === "ko"
                                ? "첫 결과 프리뷰가 준비됐습니다"
                                : "Your first result preview is ready"}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-white/75">
                              {language === "ko"
                                ? "먼저 가볍게 확인하고, 마음에 들면 전체 결과를 보고 다음 단계로 넘어가세요."
                                : "Review the first pass quickly. If it looks promising, reveal the full preview and decide what to do next."}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => setPreviewRevealed(true)}
                                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-indigo-50"
                              >
                                {language === "ko" ? "프리뷰 전체 보기" : "Reveal preview"}
                              </button>
                              <button
                                type="button"
                                onClick={() => router.push("/dashboard?tab=gallery")}
                                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                              >
                                {language === "ko" ? "갤러리 열기" : "Open gallery"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    {previewRevealed && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <div className="flex flex-wrap items-end justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-xs text-gray-300 line-clamp-2">
                              {previewJob.original_prompt || previewJob.prompt}
                            </p>
                            <p className="text-xs text-white/80">
                              {language === "ko"
                                ? "프리뷰를 확인했습니다. 바로 저장하거나 프롬프트를 다시 다듬어 보세요."
                                : "Preview revealed. Save it to the gallery or refine the prompt again."}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPrompt(previewJob.original_prompt || previewJob.prompt || "");
                                setActiveJobId(null);
                                promptTextareaRef.current?.focus();
                              }}
                              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                            >
                              {language === "ko" ? "프롬프트 다시 다듬기" : "Refine prompt"}
                            </button>
                            <button
                              type="button"
                              onClick={() => router.push("/dashboard?tab=gallery")}
                              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-indigo-50"
                            >
                              {language === "ko" ? "갤러리 열기" : "Open gallery"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : previewJob && previewStatus === "failed" ? (
                  <div className="aspect-square w-full flex flex-col items-center justify-center gap-2 bg-red-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <p className="text-xs text-red-500">{copy.generationFailed}</p>
                    <p className="max-w-xs text-center text-xs text-red-500/80">
                      {copy.generationFailedHint}
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {/* 입력 패널 — textarea + 하단 툴바 */}
            <div className={`w-full bg-gray-50 border rounded-2xl overflow-hidden transition-colors ${
              error ? "border-red-900/60" : "border-gray-200 hover:border-gray-300 focus-within:border-indigo-500/60"
            }`}>
              <div className="border-b border-gray-200 bg-white px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  {PROFILE_PRESETS.map((preset) => {
                    const isSelected = preset.id === selectedPreset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPreset(preset.id)}
                        disabled={submitting}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-900"
                        }`}
                      >
                        {preset.label[language]}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs leading-5 text-gray-500">
                  {selectedPreset.summary[language]}
                </p>
              </div>

              <div className="px-5 pt-4">
                <div
                  onDragEnter={(event) => {
                    event.preventDefault();
                    if (submitting) return;
                    setIsDropActive(true);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (submitting) return;
                    setIsDropActive(true);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      return;
                    }
                    setIsDropActive(false);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    setIsDropActive(false);
                    if (submitting) return;
                    handleFileSelection(event.dataTransfer.files?.[0] ?? null);
                  }}
                  className={`rounded-2xl border border-dashed px-4 py-4 transition-colors ${
                    isDropActive
                      ? "border-indigo-500 bg-indigo-50"
                      : attachedFile
                        ? "border-emerald-300 bg-emerald-50/60"
                        : "border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {attachedFile
                          ? language === "ko"
                            ? "원본 사진이 연결되었습니다"
                            : "Source photo attached"
                          : language === "ko"
                            ? "사진을 끌어다 놓거나 직접 첨부하세요"
                            : "Drag in a portrait or attach one"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        {attachedFile
                          ? attachedFile.name
                          : language === "ko"
                            ? "JPG, PNG, WEBP, GIF, HEIC 지원. 모바일에서는 버튼으로 바로 업로드할 수 있습니다."
                            : "Supports JPG, PNG, WEBP, GIF, and HEIC. On mobile, use the button below to upload directly."}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={submitting}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 disabled:opacity-50"
                      >
                        {attachedFile
                          ? language === "ko"
                            ? "사진 바꾸기"
                            : "Replace photo"
                          : language === "ko"
                            ? "사진 첨부"
                            : "Attach photo"}
                      </button>
                      {attachedFile && (
                        <button
                          type="button"
                          onClick={() => {
                            setAttachedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500 transition-colors hover:text-red-600"
                        >
                          {language === "ko" ? "첨부 해제" : "Remove"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <textarea
                ref={promptTextareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
                }}
                disabled={submitting}
                rows={3}
                placeholder={copy.promptPlaceholder}
                className="w-full bg-transparent px-5 pt-5 pb-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none resize-none disabled:opacity-50"
              />

              <div className="px-5 pb-2 text-xs leading-relaxed text-gray-500">
                <span>{attachedFile ? copy.composerHintWithAttachment : copy.composerHintWithoutAttachment}</span>
                <span className="ml-2 text-gray-400">{copy.submitShortcutHint}</span>
              </div>

              {/* 하단 툴바 */}
              <div className="flex items-center justify-between px-4 pb-4 pt-1">
                {/* 좌: 첨부 */}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_UPLOAD_ACCEPT}
                    className="hidden"
                    onChange={(e) => handleFileSelection(e.target.files?.[0] ?? null)}
                  />
                  {attachedFile ? (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="font-mono truncate max-w-[140px]">{attachedFile.name}</span>
                      <button
                        onClick={() => { setAttachedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="text-gray-400 hover:text-red-600 transition-colors ml-0.5"
                        aria-label={copy.cancelAttachment}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">
                      {copy.attachTitle}
                    </span>
                  )}
                </div>

                {/* 우: 생성 버튼 */}
                <button
                  onClick={handleGenerate}
                  disabled={submitting || !prompt.trim()}
                  title={
                    !prompt.trim()
                      ? copy.enterPromptTitle
                      : !hasEnoughCredits
                      ? copy.insufficientCreditsTitle
                      : undefined
                  }
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all px-5 py-2 rounded-xl font-semibold text-gray-900 text-sm shadow-lg shadow-indigo-900/40 active:scale-95"
                >
                  {uploading ? copy.uploading : submitting ? copy.generating : submitButtonLabel}
                </button>
              </div>
            </div>

            {/* 에러 */}
            {error && (
              <div className="w-full flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-900/50 rounded-xl px-4 py-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="w-full rounded-2xl border border-gray-200 bg-white/85 p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-500">
                  {copy.promptExamples}
                </span>
                <span className="text-xs text-gray-500">
                  {copy.promptExamplesHint}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {PROMPT_EXAMPLES.map((example) => {
                  const exampleLabel = example.label[language];
                  const examplePrompt = example.prompt[language];
                  const isExpanded = expandedPromptExample === example.id;

                  return (
                    <div
                      key={example.id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 text-left transition-all hover:border-indigo-500/40 hover:bg-indigo-500/5 hover:shadow-lg hover:shadow-indigo-900/10"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setPrompt(examplePrompt);
                          setError(null);
                          setExpandedPromptExample((current) =>
                            current === example.id ? null : example.id
                          );
                        }}
                        disabled={submitting}
                        aria-expanded={isExpanded}
                        className="group block w-full disabled:opacity-50"
                      >
                        <div className="bg-gradient-to-br from-gray-100 via-white to-gray-100 p-3">
                          <div className="aspect-square w-full overflow-hidden rounded-xl border border-gray-200 bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={example.image}
                              alt={exampleLabel}
                              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                            />
                          </div>
                        </div>
                        <div className="border-t border-gray-200 px-3 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-gray-900">{exampleLabel}</p>
                            <span className="text-[11px] text-indigo-600">
                              {isExpanded ? copy.hidePrompt : copy.clickImage}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {isExpanded ? copy.appliedToInput : copy.expandPrompt}
                          </p>
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-white px-3 py-3">
                          <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
                            {copy.promptLabel}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-gray-700">
                            {examplePrompt}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ------------------------------------------------------------------ */}
      {/* 갤러리 탭                                                             */}
      {/* ------------------------------------------------------------------ */}
      {tab === "gallery" && <GallerySection jobs={generateJobs} language={language} />}

    </div>
  );
}

function DashboardPageFallback() {
  const language = useAppLanguage("en");
  const copy = DASHBOARD_COPY[language];
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="border border-gray-200 rounded-2xl bg-gray-50 p-8 text-sm text-gray-500">
        {copy.loadingDashboard}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <DashboardPageContent />
    </Suspense>
  );
}
