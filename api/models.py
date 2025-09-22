import uuid
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    """User profile model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.name} ({self.user.username})"

class AppUser(models.Model):
    """Extended user model for domain-specific information"""
    ROLE_CHOICES = [
        ('farmer', 'Farmer'),
        ('buyer', 'Buyer'),
    ]
    
    REGION_CHOICES = [
        ('Mogadishu', 'Mogadishu'),
        ('Bay', 'Bay'),
        ('Hargeisa', 'Hargeisa'),
        ('Gedo', 'Gedo'),
    ]
    
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('so', 'Somali'),
        ('ar', 'Arabic'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=15, unique=True)  # Phone number as unique identifier
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    region = models.CharField(max_length=50, choices=REGION_CHOICES, default='Mogadishu')
    email_notifications = models.BooleanField(default=True)
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default='en')

    def __str__(self):
        return f"{self.name} ({self.role})"

class Produce(models.Model):
    """Produce listing model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='produce_listings')
    name = models.CharField(max_length=255)
    image_url = models.URLField(blank=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    price_per_kg = models.DecimalField(max_digits=12, decimal_places=2)
    min_price = models.DecimalField(max_digits=12, decimal_places=2)
    location = models.CharField(max_length=255)
    harvest_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.farmer.username}"

class Bid(models.Model):
    """Bid model for produce listings"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    produce = models.ForeignKey(Produce, on_delete=models.CASCADE, related_name='bids')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bids')
    bid_price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bid on {self.produce.name} by {self.buyer.username}"

class Order(models.Model):
    """Order model created when bid is accepted"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    buyer = models.ForeignKey(User, related_name='orders', on_delete=models.CASCADE)
    produce = models.ForeignKey(Produce, related_name='orders', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    delivery_route = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id} - {self.produce.name}"

class Payout(models.Model):
    """Payout model for farmer payments"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(User, related_name='payouts', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payout {self.id} - {self.farmer.username}"

class Warehouse(models.Model):
    """Warehouse model for storage locations"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    location = models.CharField(max_length=255)
    capacity_kg = models.DecimalField(max_digits=12, decimal_places=2)
    current_load_kg = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"Warehouse at {self.location}"

class Todo(models.Model):
    """Todo model for user tasks"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.TextField()
    user = models.ForeignKey(User, related_name='todos', on_delete=models.CASCADE)
    inserted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Todo for {self.user.username}: {self.task[:50]}"

# Signals to auto-create Profile when User is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance, name=instance.username)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()
