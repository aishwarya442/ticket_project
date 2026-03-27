from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('api/events/', views.get_events, name='get_events'),
    path('api/events/<int:pk>/', views.update_event, name='update_event'),
    path('api/bookings/', views.get_bookings, name='get_bookings'),
    path('api/book/', views.create_booking, name='create_booking'),
    path('api/register/', views.register_user, name='register_user'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]