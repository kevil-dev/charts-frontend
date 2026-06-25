"use client";

import { useState, useEffect } from "react";
import ChartHero from "./ChartHero";
import ChartTable from "./ChartTable";
import { useCharts } from "@/hooks/useCharts";

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

export default function ChartSection({ platform, country, category }) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [platform, country, category]);

  const { data, isLoading, isError, error, isFetching, refetch } = useCharts({
    platform, country, category, page,
  });

  const runDate = formatRunDate(data?.run_date);

  return (
    <>
      <ChartHero
        platform={platform}
        country={country}
        category={category}
        runDate={runDate}
        refetch={refetch}
        isFetching={isFetching}
      />
      <div className="mt-8 border-t border-border pt-6">
        <ChartTable
          key={`${platform}-${country}-${category}`}
          page={page}
          setPage={setPage}
          data={data}
          isLoading={isLoading}
          isError={isError}
          error={error}
          isFetching={isFetching}
          refetch={refetch}
        />
      </div>
    </>
  );
}
