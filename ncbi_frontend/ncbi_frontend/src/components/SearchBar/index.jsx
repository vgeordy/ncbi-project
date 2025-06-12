import { useState, useEffect } from "react";
import "./searchbar.styles.css";

// SearchBar component
// This component is used to search for articles in the NCBI database.
export default function SearchBar({ onSearch, value }) {
  const [input, setInput] = useState(value || "");

  useEffect(() => {
    setInput(value || "");
  }, [value]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        placeholder="Search PubMed"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
}
