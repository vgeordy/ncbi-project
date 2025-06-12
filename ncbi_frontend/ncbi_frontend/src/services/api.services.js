import axios from "axios";

const API_BASE = "http://localhost:8000/api";


// API call to ESearchSummaryWithHistoryView
export async function searchArticles({ term, webenv, query_key, limit = 10, offset = 0 }) {
  const params = { limit, offset };
  if (webenv && query_key) {
    params.webenv = webenv;
    params.query_key = query_key;
  } else {
    params.term = term;
  }
  
  try {
    const response = await axios.get(`${API_BASE}/esearch-summary-history/`, { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

/**
 * API call to EFetchParsedView
 */
export async function fetchArticleDetails(ids) {
  const response = await axios.get(`${API_BASE}/efetch/`, {
    params: { ids },
    paramsSerializer: (params) =>
      params.ids.map((id) => `ids=${id}`).join("&"),
  });
  return response.data;
}

// this is a temp fix. In an actual application I will route this to a notification component which informs the user.
const handleApiError = (error) => {
  if (error.response) {
    const { status } = error.response;
    if (status === 429) {
      alert("Too many requests. This is happening because it's a free version with limit of 3 requests per second.");
      window.location.reload();
    } else if (status >= 500) {
      alert("Server error. Please try again later.");
      window.location.reload();
    } else {
      alert(`An error occurred (${status}). Please try again.`);
      window.location.reload();
    }
  } else {
    alert("Network error. Please check your connection.");
  }
};