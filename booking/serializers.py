from rest_framework import serializers
from .models import Event, Booking
from django.contrib.auth.models import User

class EventSerializer(serializers.ModelSerializer):
    booked_seats = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = '__all__'
        
    def get_booked_seats(self, obj):
        seats = []
        for booking in obj.bookings.all():
            if isinstance(booking.seats, list):
                seats.extend(booking.seats)
        return seats

class BookingSerializer(serializers.ModelSerializer):
    event_details = EventSerializer(source='event', read_only=True)
    
    class Meta:
        model = Booking
        fields = '__all__'

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user