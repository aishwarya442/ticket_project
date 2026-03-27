from django.contrib import admin
from .models import Event, Booking

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'time', 'venue', 'ticketPrice', 'total_capacity')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'event', 'ticketsCount', 'amount', 'status', 'utr')
    list_filter = ('event', 'status')
    search_fields = ('name', 'phone', 'utr')