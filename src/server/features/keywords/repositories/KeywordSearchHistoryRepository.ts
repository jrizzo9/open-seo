import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { keywordSearchHistory } from "@/db/schema";

const MAX_HISTORY = 20;

export type KeywordSearchHistoryRow = {
  id: number;
  keyword: string;
  locationCode: number;
  locationName: string;
  searchedAt: number;
};

async function listByProjectAndUser(params: {
  projectId: string;
  userId: string;
  limit?: number;
}): Promise<KeywordSearchHistoryRow[]> {
  const limit = params.limit ?? MAX_HISTORY;

  const rows = await db
    .select({
      id: keywordSearchHistory.id,
      keyword: keywordSearchHistory.keyword,
      locationCode: keywordSearchHistory.locationCode,
      locationName: keywordSearchHistory.locationName,
      searchedAt: keywordSearchHistory.searchedAt,
    })
    .from(keywordSearchHistory)
    .where(
      and(
        eq(keywordSearchHistory.projectId, params.projectId),
        eq(keywordSearchHistory.userId, params.userId),
      ),
    )
    .orderBy(desc(keywordSearchHistory.searchedAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    keyword: r.keyword,
    locationCode: r.locationCode,
    locationName: r.locationName,
    searchedAt: r.searchedAt,
  }));
}

async function upsertSearch(params: {
  projectId: string;
  userId: string;
  keyword: string;
  locationCode: number;
  locationName: string;
}): Promise<void> {
  const searchedAt = Date.now();

  await db
    .insert(keywordSearchHistory)
    .values({
      projectId: params.projectId,
      userId: params.userId,
      keyword: params.keyword,
      locationCode: params.locationCode,
      locationName: params.locationName,
      searchedAt,
    })
    .onConflictDoUpdate({
      target: [
        keywordSearchHistory.projectId,
        keywordSearchHistory.userId,
        keywordSearchHistory.keyword,
        keywordSearchHistory.locationCode,
      ],
      set: {
        locationName: params.locationName,
        searchedAt,
      },
    });
}

async function removeById(params: {
  projectId: string;
  userId: string;
  id: number;
}): Promise<void> {
  await db
    .delete(keywordSearchHistory)
    .where(
      and(
        eq(keywordSearchHistory.projectId, params.projectId),
        eq(keywordSearchHistory.userId, params.userId),
        eq(keywordSearchHistory.id, params.id),
      ),
    );
}

export const KeywordSearchHistoryRepository = {
  listByProjectAndUser,
  upsertSearch,
  removeById,
} as const;

