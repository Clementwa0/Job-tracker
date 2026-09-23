"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  AdminAnalytics,
  AdminAnalyticsCharts,
  AdminAnalyticsOverview,
  AdminAnalyticsPeriod,
} from "@/types/admin";
import { adminService } from "@/features/admin/services/admin.client";

export interface AdminDashboardState {
  overview: AdminAnalyticsOverview | null;
  analytics: AdminAnalytics | null;
  summaryLoading: boolean;
  summaryError: string | null;
  charts: AdminAnalyticsCharts | null;
  chartsLoading: boolean;
  chartsError: string | null;
  period: AdminAnalyticsPeriod;
  setPeriod: (period: AdminAnalyticsPeriod) => void;
  reloadSummary: () => void;
  reloadCharts: () => void;
  refreshAll: () => void;
}

export function useAdminDashboard(): AdminDashboardState {
  const [period, setPeriod] = useState<AdminAnalyticsPeriod>("30d");
  const [overview, setOverview] = useState<AdminAnalyticsOverview | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [charts, setCharts] = useState<AdminAnalyticsCharts | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [chartsError, setChartsError] = useState<string | null>(null);
  const [summaryAttempt, setSummaryAttempt] = useState(0);
  const [chartsAttempt, setChartsAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([adminService.getAnalyticsOverview(), adminService.getAnalytics()])
      .then(([nextOverview, nextAnalytics]) => {
        if (cancelled) return;
        setOverview(nextOverview);
        setAnalytics(nextAnalytics);
        setSummaryError(null);
        setSummaryLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setSummaryError("We couldn't load platform statistics just now.");
        setSummaryLoading(false);
      });
    return () => { cancelled = true; };
  }, [summaryAttempt]);

  useEffect(() => {
    let cancelled = false;
    adminService.getAnalyticsCharts(period)
      .then((nextCharts) => {
        if (cancelled) return;
        setCharts(nextCharts);
        setChartsError(null);
        setChartsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setChartsError("We couldn't load activity charts just now.");
        setChartsLoading(false);
      });
    return () => { cancelled = true; };
  }, [chartsAttempt, period]);

  const reloadSummary = useCallback(() => {
    setSummaryLoading(true);
    setSummaryError(null);
    setSummaryAttempt((n) => n + 1);
  }, []);

  const reloadCharts = useCallback(() => {
    setChartsLoading(true);
    setChartsError(null);
    setChartsAttempt((n) => n + 1);
  }, []);

  const changePeriod = useCallback((nextPeriod: AdminAnalyticsPeriod) => {
    setChartsLoading(true);
    setChartsError(null);
    setPeriod(nextPeriod);
  }, []);

  const refreshAll = useCallback(() => {
    reloadSummary();
    reloadCharts();
  }, [reloadSummary, reloadCharts]);

  return {
    overview,
    analytics,
    summaryLoading,
    summaryError,
    charts,
    chartsLoading,
    chartsError,
    period,
    setPeriod: changePeriod,
    reloadSummary,
    reloadCharts,
    refreshAll,
  };
}

export default useAdminDashboard;
