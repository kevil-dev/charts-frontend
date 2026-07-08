"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeftIcon, ExternalLinkIcon, StarIcon, BarChart3Icon, GlobeIcon, Loader2Icon } from "lucide-react";
import { useGetPodcastMetaQuery } from "@/services/podcastApiSlice";
import { RankMoveBadge } from "@/components/charts/ChartRow";
import { motion } from "motion/react";
import { getFlagEmoji } from "@/utils/normalise";

// A massive, premium area chart for rank trends
function PremiumSparkline({ data }) {
  if (!data?.length || data.length < 2) return null;

  const ranks = data.map((d) => d.rank);
  const weeks = data.map((d) => d.week);
  const minRank = Math.min(...ranks);
  const maxRank = Math.max(...ranks);
  const range = maxRank - minRank || 1;

  const W = 800;
  const H = 200;
  const pad = 10;

  // Invert Y so rank 1 is at the top
  const points = ranks.map((r, i) => {
    const x = pad + (i / (ranks.length - 1)) * (W - pad * 2);
    const y = pad + ((r - minRank) / range) * (H - pad * 2);
    return { x, y, r, week: weeks[i] };
  });

  const pathData = points
    .map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`))
    .join(" ");

  const areaData = `${pathData} L ${points[points.length - 1].x},${H} L ${points[0].x},${H} Z`;

  const currentRank = ranks[ranks.length - 1];
  const previousRank = ranks.length > 1 ? ranks[ranks.length - 2] : currentRank;
  
  let rankMove = "SAME";
  let shift = 0;
  
  if (currentRank < previousRank) {
    rankMove = "UP";
    shift = previousRank - currentRank;
  } else if (currentRank > previousRank) {
    rankMove = "DOWN";
    shift = currentRank - previousRank;
  }

  return (
    <div className="relative mt-4 overflow-hidden rounded-2xl border border-border/50 bg-muted/20 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-semibold tracking-wide uppercase text-foreground/80 flex items-center gap-2">
            <BarChart3Icon className="size-4 text-[var(--brand-violet)]" />
            Rank Trend
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Performance over the last {data.length} weeks
          </p>
        </div>
        <div className="flex items-center gap-4 text-right">
          <RankMoveBadge rankMove={rankMove} />
          <div>
            <p className="text-2xl font-bold font-mono tracking-tighter">#{currentRank}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Current</p>
          </div>
        </div>
      </div>
      
      <div className="relative w-full h-[200px]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="rankGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand-violet)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--brand-violet)" stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <motion.path
            d={areaData}
            fill="url(#rankGradient)"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <motion.path
            d={pathData}
            fill="none"
            stroke="var(--brand-violet)"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          {points.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              className="fill-background stroke-[var(--brand-violet)] stroke-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 + i * 0.05, duration: 0.3 }}
            />
          ))}
        </svg>
      </div>
      <div className="flex justify-between mt-4">
        <span className="font-mono text-xs text-muted-foreground">{weeks[0]}</span>
        <span className="font-mono text-xs text-muted-foreground">{weeks[weeks.length - 1]}</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, highlight }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className={`flex flex-col gap-1.5 rounded-2xl p-5 border ${highlight ? 'bg-primary/5 border-primary/20' : 'bg-card border-border/50'}`}>
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {Icon && <Icon className="size-4" />}
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <span className={`text-xl sm:text-2xl font-bold tracking-tight ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  );
}

function PodcastProfileContent({ matchKey }) {
  const [artworkError, setArtworkError] = useState(false);
  const searchParams = useSearchParams();
  
  const { data: meta, isLoading, error } = useGetPodcastMetaQuery(matchKey, {
    skip: !matchKey,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const fallbackName = searchParams.get("name") || "Podcast Profile";
  const fallbackArtwork = searchParams.get("artwork") || "";

  const name = meta?.name || fallbackName;
  const publisher = meta?.author || meta?.publisher || "";
  const artwork = meta?.artwork || meta?.artwork_url_600 || fallbackArtwork;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Dynamic Header / Hero */}
      <div className="relative w-full h-[45vh] min-h-[350px] flex items-end">
        {/* Blurred background image effect */}
        {artwork && !artworkError && (
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={artwork}
              alt="Background"
              fill
              className="object-cover opacity-30 saturate-200 blur-3xl scale-110"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>
        )}
        
        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 p-6 z-10 flex items-center justify-between">
          <Link href="/charts/apple/us/top" className="inline-flex items-center justify-center size-10 rounded-full bg-background/50 backdrop-blur-md border border-border/50 text-foreground hover:bg-background transition-colors">
            <ArrowLeftIcon className="size-5" />
          </Link>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-8 md:px-12 flex flex-col md:flex-row items-start md:items-end gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative size-40 md:size-56 shrink-0 overflow-hidden rounded-2xl shadow-2xl border border-white/10"
          >
            {artwork && !artworkError ? (
              <Image
                src={artwork}
                alt={name}
                fill
                sizes="(max-width: 768px) 160px, 224px"
                className="object-cover"
                priority
                onError={() => setArtworkError(true)}
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-muted text-4xl font-bold text-muted-foreground">
                {name[0]?.toUpperCase()}
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="flex-1 pb-2"
          >
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {meta?.genre_label && (
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase">
                  {meta.genre_label}
                </span>
              )}
              {meta?.content_advisory_rating && (
                <span className="px-3 py-1 rounded-full border border-border text-foreground text-xs font-bold tracking-widest uppercase bg-background/50 backdrop-blur-sm">
                  {meta.content_advisory_rating}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground balance-text leading-[1.1]">
              {name}
            </h1>
            {publisher && (
              <p className="text-xl md:text-2xl text-muted-foreground mt-2 font-medium">
                {publisher}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main Content Dashboard */}
      <div className="w-full max-w-6xl mx-auto px-6 md:px-12 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column (Main Analytics) */}
        <div className="lg:col-span-2 flex flex-col gap-12">
          
          {/* Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <StatCard 
              label="Rating" 
              value={meta?.rating_average ? `${meta.rating_average}/5` : null} 
              icon={StarIcon} 
              highlight 
            />
            <StatCard 
              label="Reviews" 
              value={meta?.rating_count?.toLocaleString("en-IN")} 
            />
            <StatCard 
              label="Episodes" 
              value={meta?.episode_count?.toLocaleString("en-IN")} 
            />
            <StatCard 
              label="Avg Length" 
              value={meta?.avg_episode_duration_minutes ? `${meta.avg_episode_duration_minutes}m` : null} 
            />
          </motion.div>

          {/* Elite Area Chart */}
          {meta?.rank_history?.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <PremiumSparkline data={meta.rank_history} />
            </motion.div>
          )}

          {/* Description Section */}
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="text-xl font-bold tracking-tight mb-4 text-foreground">About the Show</h3>
            <p className="text-base text-muted-foreground leading-relaxed md:text-lg md:leading-relaxed whitespace-pre-line">
              {meta?.long_description || meta?.description || "No description available."}
            </p>
          </motion.div>

        </div>

        {/* Right Column (Sidebar details) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col gap-8"
        >
          {/* Metadata Box */}
          <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-foreground/80 mb-6">
              Release Info
            </h3>
            <div className="flex flex-col gap-5">
              {meta?.release_frequency && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Frequency</p>
                  <p className="text-sm font-medium">{meta.release_frequency}</p>
                </div>
              )}
              {meta?.language && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Language</p>
                  <p className="text-sm font-medium">{meta.language}</p>
                </div>
              )}
              {meta?.first_published_date && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">First Published</p>
                  <p className="text-sm font-medium">{meta.first_published_date}</p>
                </div>
              )}
              {meta?.last_published_date && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Latest Episode</p>
                  <p className="text-sm font-medium">{meta.last_published_date}</p>
                </div>
              )}
            </div>
            
            {/* Links */}
            {(meta?.website_url || meta?.feed_url) && (
              <>
                <div className="h-px bg-border/50 my-6" />
                <div className="flex flex-col gap-3">
                  {meta?.website_url && (
                    <a
                      href={meta.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-between w-full rounded-xl bg-muted/50 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      Website <ExternalLinkIcon className="size-4 text-muted-foreground" />
                    </a>
                  )}
                  {meta?.feed_url && (
                    <a
                      href={meta.feed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-between w-full rounded-xl bg-muted/50 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      RSS Feed <ExternalLinkIcon className="size-4 text-muted-foreground" />
                    </a>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Global Footprint */}
          {meta?.global_footprint?.length > 0 && (
            <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-foreground/80 mb-6 flex items-center gap-2">
                <GlobeIcon className="size-4 text-muted-foreground" />
                Global Presence
              </h3>
              <div className="flex flex-wrap gap-2">
                {meta.global_footprint.map((f) => (
                  <span
                    key={f.country}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground"
                  >
                    {getFlagEmoji(f.country) ?? f.country} {f.country}
                  </span>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}

export default function PodcastProfile({ matchKey }) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <PodcastProfileContent matchKey={matchKey} />
      </Suspense>
    </div>
  );
}
