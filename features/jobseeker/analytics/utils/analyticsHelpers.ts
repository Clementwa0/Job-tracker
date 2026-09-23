import type { Job } from "@/types/job";

export const getMetrics = (jobs: Job[]) => {
  const totalJobs = jobs.length;

  const statusCounts = jobs.reduce(
    (acc, job) => {
      acc[job.applicationStatus] =
        (acc[job.applicationStatus] || 0) + 1;

      return acc;
    },
    {} as Record<string, number>
  );

  const interviewRate =
    totalJobs > 0
      ? (
          ((statusCounts["interviewing"] || 0) /
            totalJobs) *
          100
        ).toFixed(1)
      : "0";

  const offerRate =
    totalJobs > 0
      ? (
          ((statusCounts["offer"] || 0) /
            totalJobs) *
          100
        ).toFixed(1)
      : "0";

  return {
    totalJobs,
    statusCounts,
    interviewRate,
    offerRate,
    activeApplications:
      statusCounts["applied"] || 0,
  };
};

export const getStatusData = (jobs: Job[]) => {
  const counts = jobs.reduce(
    (acc, job) => {
      acc[job.applicationStatus] =
        (acc[job.applicationStatus] || 0) + 1;

      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(counts).map(
    ([status, count]) => ({
      key: status,
      status:
        status.charAt(0).toUpperCase() +
        status.slice(1),
      count,
    })
  );
};

export const getTopCompanies = (jobs: Job[]) => {
  const data = jobs.reduce(
    (acc, job) => {
      acc[job.companyName] =
        (acc[job.companyName] || 0) + 1;

      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(data)
    .sort(
      ([, a]: [string, number], [, b]: [string, number]) =>
        b - a
    )
    .slice(0, 10)
    .map(([company, count]) => ({
      company,
      count,
    }));
};

export const getJobTypeData = (jobs: Job[]) => {
  const data = jobs.reduce(
    (acc, job) => {
      acc[job.jobType] =
        (acc[job.jobType] || 0) + 1;

      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(data).map(
    ([type, count]) => ({
      type: type || "Unknown",
      count,
    })
  );
};

export const getTopLocations = (jobs: Job[]) => {
  const data = jobs.reduce(
    (acc, job) => {
      acc[job.location] =
        (acc[job.location] || 0) + 1;

      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(data)
    .sort(
      ([, a]: [string, number], [, b]: [string, number]) =>
        b - a
    )
    .slice(0, 8)
    .map(([location, count]) => ({
      location: location || "Unknown",
      count,
    }));
};