import "./articlelist.styles.css";

// ArticleList component
// This component is used to display the articles in a list format.
const ArticleList = ({ articles, onSelect, pageInfo, onPageChange }) => {
  const { currentPage, totalPages } = pageInfo;

  return (
    <div className="article-list-container">
      {articles.length === 0 ? (
        <p className="no-results"></p>
      ) : (
        <>
          <ul className="article-list">
            {articles.map((article) => (
              <li key={article.id} className="article-item">
                <div className="article-content">
                  <div className="article-title-row">
                    <h3 className="article-title">
                      {article.title} ({article.year})
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="external-link"
                      >
                        🔗
                      </a>
                    </h3>
                  </div>
                  <p className="article-year">{article.authors}</p>
                  <p className="article-year">PMID: {article.id}</p>
                  <button
                    className="view-details-button"
                    onClick={() => onSelect(article.id)}
                  >
                    View Details
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="pagination-controls">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ArticleList;
