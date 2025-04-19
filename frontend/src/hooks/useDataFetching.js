import { useState, useEffect } from 'react';

export default function useDataFetching() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchData = () => {
    setLoading(true);
    return fetch('http://localhost:8000/all_contents')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
        return data;
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
        throw error;
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, fetchData, setData };
}