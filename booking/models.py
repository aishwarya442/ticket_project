from django.db import models

class Event(models.Model):
    title = models.CharField(max_length=200) # matches frontend 'title'
    date = models.DateField(null=True, blank=True)
    time = models.TimeField(null=True, blank=True)
    venue = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    ticketPrice = models.IntegerField(default=500)
    upiId = models.CharField(max_length=100, blank=True)
    total_capacity = models.IntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Booking(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=15)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='bookings')
    ticketsCount = models.IntegerField()
    seats = models.JSONField(default=list) 
    amount = models.IntegerField(default=0)
    utr = models.CharField(max_length=50)
    status = models.CharField(max_length=20, default='Confirmed')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.event.title} ({self.ticketsCount} tickets)"
