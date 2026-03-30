import React from 'react';

/**
 * @param {object} apiFunction
 *
 * @return {object}
 */
function useFecthData(apiFunction) {
  const [isFetching, setIsFetching] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [data, setData] = React.useState(null);

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

  React.useEffect(() => {
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
