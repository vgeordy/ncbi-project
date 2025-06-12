import "./modal.styles.css";
import Modal from "react-modal";

// ArticleDetailsModal component
// this component is used to display the details of an article in a modal.
export default function ArticleDetailsModal({ article, onClose, loading }) {
  if (!article) return null;

  return (
    <Modal
      isOpen={!!article}
      onRequestClose={onClose}
      ariaHideApp={false}
      contentLabel="Article Details"
      className="modal-content"
      overlayClassName="modal-overlay"
      closeTimeoutMS={150}
    >
      <button onClick={onClose} className="modal-close">
        &times;
      </button>
      {loading ? (
        <div className="modal-loading">Loading...</div>
      ) : (
        <div className="details">
          <div className="modal-header">
            <div className="modal-title-row">
              <h2 className="modal-title">
                {article.title}
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  🔗
                </a>
              </h2>
            </div>

          </div>

          <p>
            <strong>PMID:</strong> {article.pmid}
          </p>
          <p>
            <strong>Publication Year:</strong> {article.publication_year}
          </p>
          <p>
            <strong>Journal:</strong> {article.journal}
          </p>
          <p>
            <strong>Authors:</strong> {article.authors.join(", ")}
          </p>
          <p>
            <strong>Abstract:</strong> {article.abstract}
          </p>
          <p>
            <strong>MeSH Terms:</strong> {article.mesh_terms.join(", ")}
          </p>
        </div>
      )}
    </Modal>
  );
}
