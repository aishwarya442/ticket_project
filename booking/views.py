from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Event, Booking
from .serializers import EventSerializer, BookingSerializer, RegisterSerializer
from django.db.models import Sum

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User created successfully."}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_events(request):
    events = Event.objects.all()
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_event(request, pk):
    try:
        event = Event.objects.get(pk=pk)
    except Event.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    serializer = EventSerializer(event, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_bookings(request):
    # Admin gets all bookings
    bookings = Booking.objects.all().order_by('-created_at')
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])  # Allowing guest checkout as requested
def create_booking(request):
    serializer = BookingSerializer(data=request.data)
    if serializer.is_valid():
        event = serializer.validated_data['event']
        requested_tickets = serializer.validated_data['ticketsCount']
        
        # Capacity check
        booked = event.bookings.aggregate(total_booked=Sum('ticketsCount'))['total_booked'] or 0
        available_tickets = event.total_capacity - booked
        
        if requested_tickets > available_tickets:
            return Response(
                {"error": f"Not enough capacity. Only {available_tickets} tickets left."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)