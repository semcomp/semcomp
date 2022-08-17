import { useState, useEffect } from "react";

function useGetData(fetchFunction) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchData() {
    setIsLoading(true);
    try {
      const response = await fetchFunction();
      setData(response.data);
      setError(null);
    } catch (e) {
      setData(null);
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    isLoading,
    error,
    fetchData,
  };
}

export default useGetData;
