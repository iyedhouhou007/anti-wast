import { useState, useEffect, useCallback } from "react";

export default function useInfiniteScroll(fetchFunction, options = {}) {
  const {
    initialData = [],
    pageSize = 10,
    threshold = 200,
    dependencyArray = [],
  } = options;

  const [items, setItems] = useState(initialData);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetchFunction({
        page,
        limit: pageSize,
      });

      const newItems = response.data || [];

      setItems((prev) => [...prev, ...newItems]);
      setHasMore(newItems.length === pageSize);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(err.message || "Failed to load more items");
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, loading, hasMore, page, pageSize]);

  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollHeight - scrollTop <= clientHeight + threshold) {
      loadMore();
    }
  }, [loading, hasMore, threshold, loadMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Reset when dependencies change
  useEffect(() => {
    setItems(initialData);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [...dependencyArray]);

  const refresh = useCallback(() => {
    setItems(initialData);
    setPage(1);
    setHasMore(true);
    setError(null);
    loadMore();
  }, [initialData, loadMore]);

  return {
    items,
    loading,
    error,
    hasMore,
    refresh,
  };
}
