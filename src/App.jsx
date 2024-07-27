import './App.css';
import { useCallback, useMemo, useState, useRef } from 'react';

const debounce = (callback, wait) => {
  let first = true;
  let timer = null;

  return (...args) => {
    if (first) {
      callback(...args)
      first = false
      return
    }

    if (timer) {
      clearTimeout(timer)
    }
   timer = setTimeout(()=>{
      callback(...args)
    },wait)
  }
};

function App() {
  const [searchValue, setSearchValue] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(null);

  const renderSearchResults = useMemo(() => {
    if (searchValue.trim().length === 0) {
      return null;
    }

    if (loading) {
      return <li>Loading.......</li>;
    }

    if (products.length === 0) {
      return <li>No products found</li>;
    }

    return products.map((product) => <li key={product.id}>{product.title}</li>);
  }, [searchValue, products]);

  const getResultsFromApi = useCallback(async (query) => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setLoading(true);
      const response = await fetch(
        `https://dummyjson.com/products/search?q=${query}`,
        {
          signal: abortController.signal,
        }
      );
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedGetResultsFromApi = useMemo(
    () => debounce(getResultsFromApi, 500),
    [getResultsFromApi]
  );

  const handleSearch = useCallback(
    (event) => {
      const query = event.target.value;
      setSearchValue(query);
      debouncedGetResultsFromApi(query);
    },
    [debouncedGetResultsFromApi]
  );

  return (
    <div className="App">
      <label htmlFor="searchProduct">Search Product: </label>
      <input
        type="text"
        id="searchProduct"
        className="search"
        value={searchValue}
        onChange={handleSearch}
      />
      <ul>{renderSearchResults}</ul>
    </div>
  );
}

export default App;
