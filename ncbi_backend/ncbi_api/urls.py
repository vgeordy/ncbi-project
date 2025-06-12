from django.urls import path
from .views import EFetchParsedView, ESearchSummaryWithHistoryView

urlpatterns = [
    path("esearch-summary-history/", ESearchSummaryWithHistoryView.as_view(), name="esearch-summary-history"), 
    path('efetch/', EFetchParsedView.as_view(), name='efetch-parsed'),
    
]
