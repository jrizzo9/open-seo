import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addKeywordSearchHistory,
  getKeywordSearchHistory,
  removeKeywordSearchHistory,
} from "@/serverFunctions/keywords";

interface SearchHistoryItem {
  id: number;
  keyword: string;
  locationCode: number;
  locationName: string;
  timestamp: number;
}

const MAX_HISTORY = 20;

export function useSearchHistory(projectId: string) {
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => ["keyword-search-history", projectId], [projectId]);

  const historyQuery = useQuery({
    queryKey,
    queryFn: async () =>
      getKeywordSearchHistory({
        data: { projectId },
      }),
  });

  const addMutation = useMutation({
    mutationFn: async (input: {
      keyword: string;
      locationCode: number;
      locationName: string;
    }) =>
      addKeywordSearchHistory({
        data: { projectId, ...input },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: number) =>
      removeKeywordSearchHistory({
        data: { projectId, id },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const history: SearchHistoryItem[] =
    (historyQuery.data ?? []).slice(0, MAX_HISTORY).map((item) => ({
      id: item.id,
      keyword: item.keyword,
      locationCode: item.locationCode,
      locationName: item.locationName,
      timestamp: item.searchedAt,
    }));

  const addSearch = useCallback(
    (keyword: string, locationCode: number, locationName: string) => {
      addMutation.mutate({ keyword, locationCode, locationName });
    },
    [addMutation],
  );

  const removeHistoryItem = useCallback(
    (itemKey: number) => {
      const found = history.find((h) => h.timestamp === itemKey);
      if (!found) return;
      removeMutation.mutate(found.id);
    },
    [history, removeMutation],
  );

  return {
    history,
    isLoaded: historyQuery.isSuccess || historyQuery.isError,
    addSearch,
    clearHistory: () => {
      // Not used by UI today; can be added later if needed.
    },
    removeHistoryItem,
  };
}
