"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { broadcastCreditBalance } from "@/lib/credits";
import { createClient } from "@/lib/supabase/client";

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
  initial_credits: number;
}

async function readApiError(response: Response, fallback: string) {
  try {
    const payload = await response.json();
    if (payload && typeof payload.detail === "string") {
      return payload.detail;
    }
  } catch {
    // fall back to the provided message
  }
  return fallback;
}

const STATUS_LABEL: Record<JobStatus, string> = {
  pending: "대기 중",
  processing: "처리 중",
  done: "완료",
  failed: "실패",
};

const STATUS_COLOR: Record<JobStatus, string> = {
  pending: "text-yellow-700 bg-yellow-400/10",
  processing: "text-blue-600 bg-blue-400/10",
  done: "text-green-600 bg-green-400/10",
  failed: "text-red-600 bg-red-400/10",
};

const MODE_LABEL: Record<JobMode, string> = {
  enhance: "AI 보정",
  generate: "AI 생성",
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

function PixelAgent({ status }: { status: "pending" | "processing" }) {
  const isProcessing = status === "processing";
  const dur = "3.5s";

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
          {isProcessing ? "AI가 이미지를 조합하고 있어요…" : "대기 중…"}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gallery card: skeleton shimmer for pending / processing
// ---------------------------------------------------------------------------
function SkeletonCard({ job }: { job: Job }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
      {/* Pixel agent area */}
      <div className="aspect-square relative overflow-hidden bg-white/80">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <PixelAgent status={job.status as "pending" | "processing"} />
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
function ImageDetailModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const originalPrompt = job.original_prompt || job.prompt;
  const enhancedPrompt = job.enhanced_prompt;

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
              {new Date(job.created_at).toLocaleString("ko-KR")}
            </span>
            <div className="flex items-center gap-3">
              {job.output_url && (
                <a
                  href={job.output_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:text-indigo-500 hover:underline transition-colors"
                >
                  다운로드
                </a>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-400 transition-colors"
                aria-label="닫기"
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
              입력 프롬프트
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {originalPrompt || "—"}
            </p>
          </div>

          {/* AI 보정 프롬프트 */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
              AI 보정 프롬프트
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
function GalleryCard({ job, onClick }: { job: Job; onClick: () => void }) {
  const isDone = job.status === "done";
  const [imgError, setImgError] = useState(false);

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
              <span className="text-xs text-indigo-400">이미지 없음</span>
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
          {isDone ? "완료" : "실패"}
        </span>
      </div>
      {/* Meta */}
      <div className="p-3 space-y-2">
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed min-h-[2.25rem]">
          {job.original_prompt || job.prompt || "—"}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(job.created_at).toLocaleString("ko-KR")}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gallery section
// ---------------------------------------------------------------------------
function GallerySection({ jobs }: { jobs: Job[] }) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

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
          생성 갤러리
        </h2>
        {activeJobs.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-blue-600">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            {activeJobs.length}개 생성 중
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
          <p className="text-gray-500 text-sm">아직 생성된 이미지가 없습니다</p>
          <p className="text-gray-800 text-xs">
            프롬프트를 입력하여 첫 번째 이미지를 만들어 보세요
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Active jobs (skeleton) shown first */}
          {activeJobs.map((job) => (
            <SkeletonCard key={job.id} job={job} />
          ))}
          {/* Finished jobs */}
          {finishedJobs.map((job) => (
            <GalleryCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />
          ))}
        </div>
      )}

      {selectedJob && (
        <ImageDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard page
// ---------------------------------------------------------------------------
function DashboardPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = (searchParams.get("tab") ?? "generate") as "generate" | "gallery" | "history";

  const [supabase] = useState(createClient);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [creditCost, setCreditCost] = useState(10);

  const [prompt, setPrompt] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 로컬 개발: NEXT_PUBLIC_API_URL을 비워두면 상대 경로(/api/*)를 사용하며
  // Next.js 리라이트가 FastAPI로 프록시 → CORS 불필요.
  // 원격 API 사용 시에만 절대 URL을 설정하세요.
  const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

  // 연결 실패 시 보여줄 힌트 메시지를 API_URL 설정에 맞게 생성합니다.
  const apiConnErrMsg = API_URL
    ? `API 서버(${API_URL})에 연결할 수 없습니다. 서버 URL과 네트워크 상태를 확인하세요.`
    : "API 서버에 연결할 수 없습니다. Next.js 개발 서버와 FastAPI 서버가 실행 중인지 확인하세요.";

  const getAccessToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, [supabase]);

  const apiFetch = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("세션이 만료되었습니다. 다시 로그인하세요.");
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

  const redirectToPricing = useCallback(() => {
    router.push("/pricing?source=insufficient-credits");
  }, [router]);

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

  // activeJob 완료 시 2초 후 갤러리로 이동
  useEffect(() => {
    if (!activeJobId) return;
    const activeJob = jobs.find((j) => j.id === activeJobId);
    if (activeJob?.status !== "done") return;
    const timer = setTimeout(() => {
      router.replace("/dashboard?tab=gallery");
      setActiveJobId(null);
    }, 2000);
    return () => clearTimeout(timer);
  }, [jobs, activeJobId, router]);

  // -------------------------------------------------------------------------
  // AI 요청 (이미지 첨부 시 보정, 없으면 프롬프트 기반 생성)
  // -------------------------------------------------------------------------
  async function handleGenerate() {
    if (!prompt.trim()) {
      setError("프롬프트를 입력하세요.");
      return;
    }

    if (!userId) {
      setError("사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도하세요.");
      return;
    }

    if (attachedFile && !attachedFile.type.startsWith("image/")) {
      setError("이미지 파일만 첨부할 수 있습니다.");
      return;
    }

    if (creditBalance !== null && creditBalance < creditCost) {
      setError(null);
      redirectToPricing();
      return;
    }

    setError(null);
    setSubmitting(true);

    // 파일 첨부된 경우: 업로드 후 이미지 보정 요청
    if (attachedFile) {
      setUploading(true);
      try {
        let presignRes: Response;
        try {
          presignRes = await apiFetch("/api/upload/presign", {
            method: "POST",
            body: JSON.stringify({ filename: attachedFile.name, content_type: attachedFile.type }),
          });
        } catch (err) {
          throw new Error(err instanceof Error ? err.message : apiConnErrMsg);
        }
        if (!presignRes.ok) {
          throw new Error(await readApiError(presignRes, `업로드 준비 실패 (${presignRes.status})`));
        }
        const { upload_url, object_key } = await presignRes.json();

        let putRes: Response;
        try {
          putRes = await fetch(upload_url, {
            method: "PUT",
            body: attachedFile,
          });
        } catch {
          throw new Error("파일 업로드에 실패했습니다. 네트워크 상태를 확인하세요.");
        }
        if (!putRes.ok) {
          const uploadErrorText = (await putRes.text()).trim().slice(0, 240);
          throw new Error(
            uploadErrorText
              ? `파일 업로드 실패 (HTTP ${putRes.status}): ${uploadErrorText}`
              : `파일 업로드 실패 (HTTP ${putRes.status})`
          );
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
          redirectToPricing();
          return;
        }
        if (!res.ok) {
          throw new Error(await readApiError(res, `요청 실패 (HTTP ${res.status})`));
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
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
        redirectToPricing();
        return;
      }
      if (!res.ok) {
        throw new Error(
          await readApiError(res, `AI 생성 요청 실패 (HTTP ${res.status}). 잠시 후 다시 시도하세요.`)
        );
      }
      const newJob: Job = await res.json();
      setJobs((prev) => [newJob, ...prev]);
      if (typeof newJob.remaining_credits === "number") {
        updateCreditBalance(newJob.remaining_credits);
      }
      setActiveJobId(newJob.id);
      setPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
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

        return (
          <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center gap-5 max-w-2xl mx-auto w-full">
            {/* 프리뷰 카드 */}
            {(previewJob || showLocalPreview) && (
              <div className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-2xl">
                {showLocalPreview ? (
                  <div className="aspect-square w-full bg-white/80 flex flex-col items-center justify-center">
                    <PixelAgent status={localPreviewStatus} />
                  </div>
                ) : previewJob && isActive ? (
                  <div className="aspect-square w-full bg-white/80 flex flex-col items-center justify-center">
                    <PixelAgent status={previewJob.status as "pending" | "processing"} />
                  </div>
                ) : previewJob && isDone && previewJob.output_url ? (
                  <div className="aspect-square w-full relative animate-fade-in">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewJob.output_url}
                      alt={previewJob.prompt ?? ""}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 line-clamp-2">{previewJob.original_prompt || previewJob.prompt}</p>
                        <p className="text-xs text-indigo-600">갤러리로 이동 중…</p>
                      </div>
                    </div>
                  </div>
                ) : previewJob && previewStatus === "failed" ? (
                  <div className="aspect-square w-full flex flex-col items-center justify-center gap-2 bg-red-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <p className="text-xs text-red-500">생성 실패</p>
                  </div>
                ) : null}
              </div>
            )}

            {/* 입력 패널 — textarea + 하단 툴바 */}
            <div className={`w-full bg-gray-50 border rounded-2xl overflow-hidden transition-colors ${
              error ? "border-red-900/60" : "border-gray-200 hover:border-gray-300 focus-within:border-indigo-500/60"
            }`}>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
                }}
                disabled={submitting}
                rows={4}
                placeholder="예: 사이버펑크 도시 야경, 따뜻한 햇살이 비치는 카페 창가…"
                className="w-full bg-transparent px-5 pt-5 pb-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none resize-none disabled:opacity-50"
              />

              {/* 하단 툴바 */}
              <div className="flex items-center justify-between px-4 pb-4 pt-1">
                {/* 좌: 첨부 */}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setAttachedFile(e.target.files?.[0] ?? null)}
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
                        aria-label="첨부 취소"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={submitting}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-400 bg-gray-100 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      title="이미지 첨부 (AI 보정 모드)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      이미지 첨부
                    </button>
                  )}
                </div>

                {/* 우: 생성 버튼 */}
                <button
                  onClick={handleGenerate}
                  disabled={submitting || !prompt.trim()}
                  title={
                    !prompt.trim()
                      ? "프롬프트를 입력하세요"
                      : !hasEnoughCredits
                      ? `크레딧이 부족합니다. 클릭하면 요금제 페이지로 이동합니다`
                      : undefined
                  }
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all px-5 py-2 rounded-xl font-semibold text-gray-900 text-sm shadow-lg shadow-indigo-900/40 active:scale-95"
                >
                  {uploading ? "업로드 중…" : submitting ? "생성 중…" : "생성하기"}
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
          </div>
        );
      })()}

      {/* ------------------------------------------------------------------ */}
      {/* 갤러리 탭                                                             */}
      {/* ------------------------------------------------------------------ */}
      {tab === "gallery" && <GallerySection jobs={generateJobs} />}

    </div>
  );
}

function DashboardPageFallback() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="border border-gray-200 rounded-2xl bg-gray-50 p-8 text-sm text-gray-500">
        대시보드를 불러오는 중입니다…
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
