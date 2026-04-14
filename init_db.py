import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ticket_project.settings')
django.setup()

from django.contrib.auth.models import User
from booking.models import Event

if not User.objects.filter(username='admin').exists():
    print("Creating admin user...")
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')

if not Event.objects.exists():
    print("Creating initial event...")
    Event.objects.create(
        title="Natasamrat - The Great Maratha Drama",
        date="2026-04-15",
        time="18:30:00",
        venue="Lokmanya Rangmandir, Belgaum",
        description="Experience the legendary Marathi classic exploring the tragic life of a veteran stage actor. A masterpiece of Indian theatre.",
        ticketPrice=500,
        upiId="dramatickets@ybl",
        total_capacity=100
    )
print("DB initialized successfully")
