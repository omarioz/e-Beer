from django.contrib import admin
from .models import Profile, AppUser, Produce, Bid, Order, Payout, Warehouse, Todo

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['name', 'user']
    search_fields = ['name', 'user__username']

@admin.register(AppUser)
class AppUserAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone_number', 'role', 'user']
    list_filter = ['role']
    search_fields = ['name', 'phone_number', 'user__username']

@admin.register(Produce)
class ProduceAdmin(admin.ModelAdmin):
    list_display = ['name', 'farmer', 'quantity', 'price_per_kg', 'location', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at', 'harvest_date']
    search_fields = ['name', 'farmer__username', 'location']
    readonly_fields = ['created_at']

@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ['produce', 'buyer', 'bid_price', 'status', 'timestamp']
    list_filter = ['status', 'timestamp']
    search_fields = ['produce__name', 'buyer__username']
    readonly_fields = ['timestamp']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'buyer', 'produce', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['buyer__username', 'produce__name']
    readonly_fields = ['created_at']

@admin.register(Payout)
class PayoutAdmin(admin.ModelAdmin):
    list_display = ['farmer', 'amount', 'status', 'requested_at']
    list_filter = ['status', 'requested_at']
    search_fields = ['farmer__username']
    readonly_fields = ['requested_at']

@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ['location', 'capacity_kg', 'current_load_kg']
    search_fields = ['location']

@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    list_display = ['task', 'user', 'inserted_at']
    list_filter = ['inserted_at']
    search_fields = ['task', 'user__username']
    readonly_fields = ['inserted_at']
