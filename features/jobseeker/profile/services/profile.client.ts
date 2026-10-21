import axiosInstance from "@/lib/axiosInstance";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  JobseekerProfile,
  ProfileResponse,
  RecommendationsResponse,
} from "@/types/profile";

/** Fields the settings form can change (all optional: send only what changed). */
export type ProfileUpdate = Partial<JobseekerProfile> & { name?: string };

export const profileService = {
  async get(): Promise<ProfileResponse> {
    const { data } =
      await axiosInstance.get<ApiSuccessResponse<ProfileResponse>>(
        "/profile",
      );

    return data.data;
  },

  async update(patch: ProfileUpdate): Promise<ProfileResponse> {
    const { data } =
      await axiosInstance.put<ApiSuccessResponse<ProfileResponse>>(
        "/profile",
        patch,
      );

    return data.data;
  },
};

/** Fetch personalised job recommendations with match scores. */
export const recommendationService = {
  async list(limit = 20): Promise<RecommendationsResponse> {
    const normalizedLimit = Math.max(
      1,
      Math.min(100, Math.floor(limit)),
    );

    const { data } =
      await axiosInstance.get<ApiSuccessResponse<RecommendationsResponse>>(
        "/recommendations",
        {
          params: {
            limit: normalizedLimit,
          },
        },
      );

    return data.data;
  },
};