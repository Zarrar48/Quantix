import { useState, useEffect } from 'react';

export const useSymbols = () => {
  const [symbols, setSymbols] = useState<string[]>(['ALL']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const res = await fetch('/api/symbols');
        if (res.ok) {
          const data = await res.json();
          setSymbols(data);
        }
      } catch (error) {
        console.error("Failed to load symbols", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSymbols();
  }, []);

  return { symbols, loading };
};