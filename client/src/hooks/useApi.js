import { useState, useCallback } from "react";
import { Toast } from "../components/common/Toast";

export default function useApi(apiFunc, options = {}) {
  const {
    onSuccess,
    onError,
    showSuccessToast,
    showErrorToast = true,
    successMessage,
    transformData,
  } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);

        let response = await apiFunc(...args);

        // Handle axios response wrapper
        if (response?.data) {
          response = response.data;
        }

        // Transform data if needed
        const transformedData = transformData
          ? transformData(response)
          : response;

        setData(transformedData);

        if (showSuccessToast && successMessage) {
          Toast.success(successMessage);
        }

        if (onSuccess) {
          onSuccess(transformedData);
        }

        return transformedData;
      } catch (err) {
        const errorMessage = err.message || "An error occurred";
        setError(errorMessage);

        if (showErrorToast) {
          Toast.error(errorMessage);
        }

        if (onError) {
          onError(err);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      apiFunc,
      onSuccess,
      onError,
      showSuccessToast,
      showErrorToast,
      successMessage,
      transformData,
    ]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    error,
    loading,
    execute,
    reset,
  };
}
