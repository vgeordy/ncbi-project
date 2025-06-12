import requests
import xmltodict;
from urllib.parse import urlencode
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from django.http import JsonResponse, HttpResponse
from django.conf import settings


NCBI_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"


# esearch + esummary pipeline api with usehistory=y flag enabled, so it caches the result on its history server, which allows for efficient pagination, reduces repeated search, reduces client side state, etc.
# This api queries the database using the search term provided and returns back id and other basic information.
class ESearchSummaryWithHistoryView(APIView):
    def get(self, request):
        # required params
        db = request.GET.get("db", "pubmed")
        term = request.GET.get("term")

        # optional params
        # allows us to cache the result on their history server, which allows use to paginate over thousands of records without manually passing long ID list
        webenv = request.GET.get("webenv") # kind of like a session id
        query_key = request.GET.get("query_key") # specifies in the query in the web env

        try:
            # default values
            limit = int(request.GET.get("limit", 5)) 
            offset = int(request.GET.get("offset", 0))
        except ValueError:
            return Response({"error": "Invalid 'limit' or 'offset'"}, status=400)

        # no webenv or query_key: first time search
        if not webenv or not query_key:
            if not term:
                return Response({"error": "Missing 'term' parameter"}, status=400)

            esearch_params = {
                "db": db,
                "term": term,
                "retmax": 0,
                "retmode": "json",
                "usehistory": "y"
            }

            # Step 1: get esearch info
            esearch_resp = requests.get(f"{NCBI_BASE}/esearch.fcgi", params=esearch_params)
            if esearch_resp.status_code != 200:
                return Response({"error": "ESearch failed"}, status=esearch_resp.status_code)

            esearch_data = esearch_resp.json().get("esearchresult", {})
            total = int(esearch_data.get("count", 0))
            webenv = esearch_data.get("webenv")
            query_key = esearch_data.get("querykey")

        else:
            esearch_params = {
                "db": db,
                "WebEnv": webenv,
                "query_key": query_key,
                "retmode": "json",
                "retmax": 0,
            }

            # fetch metadata (count) to paginate properly.
            # could use persistent storage as an alt solution
            esearch_resp = requests.get(f"{NCBI_BASE}/esearch.fcgi", params=esearch_params)
            if esearch_resp.status_code != 200:
                return Response({"error": "ESearch (count only) failed"}, status=esearch_resp.status_code)

            esearch_data = esearch_resp.json().get("esearchresult", {})
            total = int(esearch_data.get("count", 0))

        # Step 2: get esummary
        esummary_params = {
            "db": db,
            "WebEnv": webenv,
            "query_key": query_key,
            "retstart": offset,
            "retmax": limit,
            "retmode": "json"
        }

        esummary_resp = requests.get(f"{NCBI_BASE}/esummary.fcgi", params=esummary_params)
        if esummary_resp.status_code != 200:
            return Response({"error": "ESummary failed"}, status=esummary_resp.status_code)

        summary_data = esummary_resp.json().get("result", {})
        uids = summary_data.get("uids", [])

        # parse the result
        results = []
        for uid in uids:
            doc = summary_data.get(uid, {})

            external_url = f"https://pubmed.ncbi.nlm.nih.gov/{uid}/"

            author_list = doc.get("authors", [])
            authors = ", ".join(a.get("name", "") for a in author_list if a.get("name")) or "Author information not available"

            results.append({
                "id": uid,
                "title": doc.get("title", "") or "No title available",
                "year": doc.get("pubdate", "").split(" ")[0] if doc.get("pubdate") else "Unknown",
                "authors": authors,
                "url": external_url
            })

        # util function to generate next and previous pagination urls for frontend subsequent calls
        def build_url(new_offset):
            base = request.build_absolute_uri(request.path)
            query = {
                "limit": limit,
                "offset": new_offset,
                "webenv": webenv,
                "query_key": query_key,
                "total": total  
            }
            if term:
                query["term"] = term
            return f"{base}?{urlencode(query)}"

        next_url = build_url(offset + limit) if (offset + limit < total) else None
        prev_url = build_url(offset - limit) if offset > 0 else None

        return Response({
            "results": results,
            "count": total,
            "webenv": webenv,
            "query_key": query_key,
            "next": next_url,
            "previous": prev_url
        })


# This api endpoint gets detailed information for the provided PMID
# Detailed information: PMID, Title, Abstract, Author List, Journal, Publication Year, MeSH Terms
# Handles missing data appropriately
# api for "View Details" button
class EFetchParsedView(APIView):
    def get(self, request):
        # required param
        db = request.GET.get("db", "pubmed")
        ids = request.GET.getlist("ids") # ids but only one id is passed at at time.

        if not ids:
            return Response({"error": "Missing 'ids' query parameter"}, status=400)

        params = {
            "db": db,
            "id": ",".join(ids),
            "retmode": "xml" # efetch doesn't support json
        }

        try:
            response = requests.get(f"{NCBI_BASE}/efetch.fcgi", params=params)
            response.raise_for_status()
            # using external lib to parse xml
            parsed = xmltodict.parse(response.content)
        except Exception as e:
            return Response({"error": f"Failed to fetch or parse data: {str(e)}"}, status=500)

        # go through the xml dom to parse details mentioned in the spec
        # use default values if a value is not present (e.g. No abstract available)
        articles = parsed.get("PubmedArticleSet", {}).get("PubmedArticle", [])
        if isinstance(articles, dict):
            articles = [articles]

        results = []

        for article in articles:
            try:
                medline = article.get("MedlineCitation", {})
                article_data = medline.get("Article", {})

                # PMID
                pmid = medline.get("PMID", "")
                if isinstance(pmid, dict):
                    pmid = pmid.get("#text", "Not available")

                # Title
                title = article_data.get("ArticleTitle", "Not available")

                # Abstract
                abstract = ""
                abstract_data = article_data.get("Abstract", {}).get("AbstractText", "")
                if isinstance(abstract_data, list):
                    abstract = " ".join(
                        a.get("#text", "") if isinstance(a, dict) else str(a)
                        for a in abstract_data
                    )
                elif isinstance(abstract_data, str):
                    abstract = abstract_data
                elif isinstance(abstract_data, dict):
                    abstract = abstract_data.get("#text", "")
                if not abstract.strip():
                    abstract = "No abstract available"

                # Authors
                authors = []
                author_list = article_data.get("AuthorList", {}).get("Author", [])
                if isinstance(author_list, dict): 
                    author_list = [author_list]
                for author in author_list:
                    last = author.get("LastName", "")
                    first = author.get("ForeName", "")
                    full_name = f"{first} {last}".strip()
                    if full_name:
                        authors.append(full_name)
                if not authors:
                    authors = ["Not available"]

                # Journal
                journal = article_data.get("Journal", {}).get("Title", "Not available")
                pubdate = article_data.get("Journal", {}).get("JournalIssue", {}).get("PubDate", {})
                # Publication year
                pub_year = pubdate.get("Year", "") or pubdate.get("MedlineDate", "Not available")

                # MeSH Terms
                mesh_raw = medline.get("MeshHeadingList", {}).get("MeshHeading", [])
                if isinstance(mesh_raw, dict):
                    mesh_raw = [mesh_raw]
                mesh_terms = []
                for mesh in mesh_raw:
                    descriptor = mesh.get("DescriptorName")
                    if isinstance(descriptor, dict):
                        descriptor = descriptor.get("#text", "")
                    if descriptor:
                        mesh_terms.append(descriptor)
                if not mesh_terms:
                    mesh_terms = ["Not available"]
                
                results.append({
                    "pmid": pmid,
                    "title": title,
                    "abstract": abstract,
                    "authors": authors,
                    "journal": journal,
                    "publication_year": pub_year,
                    "mesh_terms": mesh_terms
                })

            except Exception as e:
                results.append({"error": f"Failed to process article: {str(e)}"})

        return Response(results)