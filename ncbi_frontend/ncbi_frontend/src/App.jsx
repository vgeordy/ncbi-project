import "./App.css";
import { useEffect, useState } from "react";
import SearchBar from "./components/SearchBar";
import ArticleList from "./components/ArticleList";
import Spinner from "./components/Spinner";
import { SkeletonRow } from "./components/Skeleton";
import ArticleDetailsModal from "./components/ArticleDetailsModal";
import { searchArticles, fetchArticleDetails } from "./services/api.services";

function App() {
  // state variables
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [term, setTerm] = useState("");
  const [articles, setArticles] = useState([]);
  const [webenv, setWebenv] = useState(null);
  const [queryKey, setQueryKey] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

 // restore last search data from sessionStorage if available.
  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem("lastSearchData"));
    if (saved) {
      setArticles(saved.articles);
      setTerm(saved.term);
      setCurrentPage(saved.page);
      setWebenv(saved.webenv);
      setQueryKey(saved.queryKey);
      setTotalCount(saved.count || 0);
    }
  }, []);

  // runs a search query using the NCBI API and updates state.
  const runSearch = async (
    searchTerm,
    page = 1,
    overrideWebenv = null,
    overrideQueryKey = null
  ) => {
    const isNewQuery = searchTerm !== term || page === 1;
    const offset = (page - 1) * pageSize;

    setLoading(true);
    setTerm(searchTerm);

    const res = await searchArticles({
      term: searchTerm,
      offset,
      limit: pageSize,
      webenv: isNewQuery ? overrideWebenv : webenv,
      query_key: isNewQuery ? overrideQueryKey : queryKey,
    });

    setArticles(res.results);
    setCurrentPage(page);
    setLoading(false);

    if (res.webenv && res.query_key) {
      setWebenv(res.webenv);
      setQueryKey(res.query_key);
    }

    setTotalCount(Number(res.count) || 0);

    try {
      sessionStorage.setItem(
        "lastSearchData",
        JSON.stringify({
          articles: res.results,
          count: res.count,
          term: searchTerm,
          page: page,
          webenv: res.webenv,
          queryKey: res.query_key,
        })
      );
    } catch (err) {
      console.error("Failed to save to localStorage", err);
    }
  };

 // fetches details for a specific article and opens the modal.
  const fetchDetails = async (id) => {
    setDetailsLoading(true);
    const res = await fetchArticleDetails([id]);
    setArticle(res[0]);
    setDetailsLoading(false);
  };

  // closes the article details modal.
  const closeModal = () => {
    setArticle(null);
  };

  // navigates to the first page of the last search using sessionStorage data.
  const GoToFirstPage = () => {
    const saved = sessionStorage.getItem("lastSearchData");
    if (saved) {
      try {
        const { term, webenv, queryKey } = JSON.parse(saved);
        if (term) {
          runSearch(term, 1, webenv, queryKey);
        }
      } catch (err) {
        console.error("Failed to parse lastSearchData:", err);
      }
    }
  };


  return (
    <div className="app-container">
      <header className="header">
        <h1
          className="title-link"
          onClick={() => {
            GoToFirstPage();
          }}
        >
          NCBI Search Viewer
        </h1>

        <SearchBar onSearch={runSearch} />
      </header>

      <main className="content">
        {loading ? (
          <>
            <Spinner />
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </>
        ) : (
          <div className="article-list-container">
            <ArticleList
              articles={articles}
              onSelect={fetchDetails}
              pageInfo={{
                currentPage,
                totalPages: Math.ceil((totalCount || 0) / pageSize),
              }}
              onPageChange={(newPage) => runSearch(term, newPage)}
            />
          </div>
        )}
      </main>

      <ArticleDetailsModal
        article={article}
        loading={detailsLoading}
        onClose={closeModal}
      />
    </div>
  );
}

export default App;
