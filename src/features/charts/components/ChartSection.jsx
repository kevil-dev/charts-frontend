"use client";

import { useState } from "react";
import { useCharts } from "@/features/charts/hooks/useCharts";
import ChartHero from "./ChartHero";
import ChartTable from "./ChartTable";
import PodcastDrawer from "./PodcastDrawer";

function formatRunDate(runDate) {
  if (!runDate) return null;
  try {
    return new Date(runDate + "T00:00:00").toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return runDate;
  }
}

export default function ChartSection({
  platform,
  country,
  category,
  platformLabel,
  countryName,
  countryFlag,
  chartLabel,
  currentPage,
}) {
  const [selectedPodcast, setSelectedPodcast] = useState(null);

  const { data, isLoading, isError, error, isFetching, refetch } = useCharts({
    platform,
    country,
    category,
    page: currentPage,
  });

  const runDate = formatRunDate(data?.run_date);

  return (
    <>
      <ChartHero
        platform={platform}
        country={country}
        category={category}
        platformLabel={platformLabel}
        countryName={countryName}
        countryFlag={countryFlag}
        chartLabel={chartLabel}
        runDate={runDate}
        refetch={refetch}
        isFetching={isFetching}
      />
      <div className="mt-8 border-t border-border pt-6">
        <ChartTable
          key={`${platform}-${country}-${category}`}
          page={currentPage}
          data={data}
          isLoading={isLoading}
          isError={isError}
          error={error}
          isFetching={isFetching}
          refetch={refetch}
          onRowClick={setSelectedPodcast}
        />
      </div>
      <PodcastDrawer
        podcast={selectedPodcast}
        onClose={() => setSelectedPodcast(null)}
      />
    </>
  );
}