import axiosInstance from "@/lib/axiosInstance";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  JobseekerProfile,
  ProfileResponse,
  RecommendationsResponse,
} from "@/types/profile";

/**
 * Fields the settings form can change.
 *
 * Every field is optional: the settings form only sends what actually
 * changed, and the server merges with the existing profile.
 */
export type ProfileUpdate = Partial<JobseekerProfile> & { name?: string };

/* -------------------------------------------------------------------------- */
/* Profile                                                                    */
/* -------------------------------------------------------------------------- */

export const profileService = {
  async get(): Promise<ProfileResponse> {
    const { data } = await axiosInstance.get<
      ApiSuccessResponse<ProfileResponse>
    >("/profile");
    return data.data;
  },

  async update(patch: ProfileUpdate): Promise<ProfileResponse> {
    const { data } = await axiosInstance.put<
      ApiSuccessResponse<ProfileResponse>
    >("/profile", patch);
    return data.data;
  },
};

/* -------------------------------------------------------------------------- */
/* Recommendations                                                            */
/* -------------------------------------------------------------------------- */

export const recommendationService = {
  async list(limit = 4): Promise<RecommendationsResponse> {
    const { data } = await axiosInstance.get<
      ApiSuccessResponse<RecommendationsResponse>
    >(`/recommendations?limit=${limit}`);
    return data.data;
  },
};