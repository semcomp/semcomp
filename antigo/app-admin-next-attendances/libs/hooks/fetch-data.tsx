import { useEffect, useState } from "react";

/**
 * @param {object} apiFunction
 *
 * @return {object}
 */
function useFecthData(apiFunction) {
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * fetchData
   */
  async function fetchData() {
    setIsFetching(true);
    try {
      const response = await apiFunction();
      setData(response.data);
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setIsFetching(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return {
    fetchData,
    isFetching,
    error,
    data,
    setData,
  };
}

export default useFecthData;
