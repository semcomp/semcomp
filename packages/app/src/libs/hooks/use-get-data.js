import React from "react";

function useGetData(fetchFunction) {
  const [data, setData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

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

  React.useEffect(() => {
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
