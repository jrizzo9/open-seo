import { createServerFn } from "@tanstack/react-start";
import {
  researchKeywordsSchema,
  saveKeywordsSchema,
  getSavedKeywordsSchema,
  removeSavedKeywordsSchema,
  getKeywordSearchHistorySchema,
  addKeywordSearchHistorySchema,
  removeKeywordSearchHistorySchema,
  serpAnalysisSchema,
} from "@/types/schemas/keywords";
import { KeywordResearchService } from "@/server/features/keywords/services/KeywordResearchService";
import { KeywordSearchHistoryRepository } from "@/server/features/keywords/repositories/KeywordSearchHistoryRepository";
import { requireProjectContext } from "@/serverFunctions/middleware";

export const researchKeywords = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .inputValidator((data: unknown) => researchKeywordsSchema.parse(data))
  .handler(async ({ data, context }) => {
    return KeywordResearchService.research(
      {
        ...data,
        projectId: context.projectId,
      },
      context,
    );
  });

export const saveKeywords = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .inputValidator((data: unknown) => saveKeywordsSchema.parse(data))
  .handler(async ({ data, context }) => {
    return KeywordResearchService.saveKeywords({
      ...data,
      projectId: context.projectId,
    });
  });

export const getSavedKeywords = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .inputValidator((data: unknown) => getSavedKeywordsSchema.parse(data))
  .handler(async ({ data, context }) => {
    return KeywordResearchService.getSavedKeywords({
      ...data,
      projectId: context.projectId,
    });
  });

export const removeSavedKeywords = createServerFn({
  method: "POST",
})
  .middleware(requireProjectContext)
  .inputValidator((data: unknown) => removeSavedKeywordsSchema.parse(data))
  .handler(async ({ data, context }) => {
    return KeywordResearchService.removeSavedKeywords(context.projectId, data);
  });

export const getSerpAnalysis = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .inputValidator((data: unknown) => serpAnalysisSchema.parse(data))
  .handler(async ({ data, context }) =>
    KeywordResearchService.getSerpAnalysis(
      {
        ...data,
        projectId: context.projectId,
      },
      context,
    ),
  );

export const getKeywordSearchHistory = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .inputValidator((data: unknown) => getKeywordSearchHistorySchema.parse(data))
  .handler(async ({ context }) => {
    return KeywordSearchHistoryRepository.listByProjectAndUser({
      projectId: context.projectId,
      userId: context.userId,
    });
  });

export const addKeywordSearchHistory = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .inputValidator((data: unknown) => addKeywordSearchHistorySchema.parse(data))
  .handler(async ({ data, context }) => {
    await KeywordSearchHistoryRepository.upsertSearch({
      projectId: context.projectId,
      userId: context.userId,
      keyword: data.keyword,
      locationCode: data.locationCode,
      locationName: data.locationName,
    });
    return { ok: true } as const;
  });

export const removeKeywordSearchHistory = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .inputValidator((data: unknown) =>
    removeKeywordSearchHistorySchema.parse(data),
  )
  .handler(async ({ data, context }) => {
    await KeywordSearchHistoryRepository.removeById({
      projectId: context.projectId,
      userId: context.userId,
      id: data.id,
    });
    return { ok: true } as const;
  });
