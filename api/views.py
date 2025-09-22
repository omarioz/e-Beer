from django.http import JsonResponse
from rest_framework import viewsets, status, filters
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from .models import Profile, AppUser, Produce, Bid, Order, Payout, Warehouse, Todo
from .serializers import (
    UserSerializer, ProfileSerializer, AppUserSerializer, RegisterSerializer,
    ProduceSerializer, BidSerializer, OrderSerializer, PayoutSerializer,
    WarehouseSerializer, TodoSerializer
)
from .permissions import (
    IsFarmer, IsBuyer, IsOwnerUser, IsProduceOwner, 
    IsBidOwner, IsOrderBuyer, IsOrderFarmer
)

@api_view(['GET'])
@permission_classes([AllowAny])
def test_api(request):
    """Test API endpoint to verify backend is working"""
    return Response({
        'message': 'Django API is working!',
        'status': 'success'
    })

class AuthViewSet(viewsets.ViewSet):
    """Authentication views"""
    permission_classes = [AllowAny]
    @action(detail=False, methods=['post'])
    def register(self, request):
        """Register a new user"""
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User registered successfully',
                'user_id': user.id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileViewSet(viewsets.ModelViewSet):
    """Profile management views"""
    serializer_class = AppUserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return AppUser.objects.filter(user=self.request.user)
    
    def get_object(self):
        return get_object_or_404(AppUser, user=self.request.user)
    
    def update(self, request, *args, **kwargs):
        """Update user profile"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def current_user(self, request):
        """Get current user's AppUser data including role"""
        try:
            app_user = AppUser.objects.get(user=request.user)
            serializer = AppUserSerializer(app_user)
            return Response(serializer.data)
        except AppUser.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)

class ProduceViewSet(viewsets.ModelViewSet):
    """Produce listing views"""
    serializer_class = ProduceSerializer
    permission_classes = []
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['location', 'is_active']
    search_fields = ['name', 'location']
    ordering_fields = ['price_per_kg', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        
        # For create/update/delete operations, only show farmer's own produce
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return Produce.objects.filter(farmer=user)
        
        # For list/retrieve operations, filter based on user role
        try:
            app_user = AppUser.objects.get(user=user)
            if app_user.role == 'farmer':
                # Farmers see only their own produce
                return Produce.objects.filter(farmer=user)
            elif app_user.role == 'buyer':
                # Buyers see all active produce
                return Produce.objects.filter(is_active=True)
        except AppUser.DoesNotExist:
            # If no AppUser found, default to showing all active produce
            pass
        
        # Default: show all active produce (for unauthenticated users or fallback)
        return Produce.objects.filter(is_active=True)
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'bids']:
            return [IsFarmer()]
        return []
    
    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close a produce listing"""
        produce = self.get_object()
        produce.is_active = False
        produce.save()
        return Response({'message': 'Produce listing closed'})
    
    @action(detail=True, methods=['get'])
    def bids(self, request, pk=None):
        """Get bids for a specific produce listing (farmer only)"""
        produce = self.get_object()
        
        # Check if user is the farmer who owns this produce
        if produce.farmer != request.user:
            return Response({'error': 'Only the produce owner can view bids'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        bids = Bid.objects.filter(produce=produce)
        serializer = BidSerializer(bids, many=True)
        return Response(serializer.data)

class BidViewSet(viewsets.ModelViewSet):
    """Bid management views"""
    serializer_class = BidSerializer
    permission_classes = []  # Remove class-level permissions to avoid conflicts
    
    def get_queryset(self):
        return Bid.objects.filter(buyer=self.request.user)
    
    def get_permissions(self):
        if self.action in ['accept', 'reject']:
            return [IsFarmer()]
        return [IsBuyer()]
    
    def perform_create(self, serializer):
        serializer.save(buyer=self.request.user)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept a bid (farmer only)"""
        try:
            bid = Bid.objects.get(pk=pk)
        except Bid.DoesNotExist:
            return Response({'error': f'Bid {pk} not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Bid not found: {e}'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        if bid.produce.farmer != request.user:
            return Response({'error': 'Only the produce owner can accept bids'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        if bid.status != 'pending':
            return Response({'error': f'Bid is not pending (current status: {bid.status})'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Accept the bid
        bid.status = 'accepted'
        bid.save()
        
        # Create order
        Order.objects.create(
            buyer=bid.buyer,
            produce=bid.produce,
            status='accepted'
        )
        
        # Close the produce listing
        bid.produce.is_active = False
        bid.produce.save()
        
        # Reject all other pending bids
        Bid.objects.filter(
            produce=bid.produce,
            status='pending'
        ).exclude(id=bid.id).update(status='rejected')
        
        return Response({'message': 'Bid accepted and order created'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a bid (farmer only)"""
        try:
            bid = Bid.objects.get(pk=pk)
        except Bid.DoesNotExist:
            return Response({'error': f'Bid {pk} not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Bid not found: {e}'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        if bid.produce.farmer != request.user:
            return Response({'error': 'Only the produce owner can reject bids'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        bid.status = 'rejected'
        bid.save()
        return Response({'message': 'Bid rejected'})

class OrderViewSet(viewsets.ModelViewSet):
    """Order management views"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        try:
            if user.appuser.role == 'buyer':
                return Order.objects.filter(buyer=user)
            elif user.appuser.role == 'farmer':
                return Order.objects.filter(produce__farmer=user)
        except AppUser.DoesNotExist:
            pass
        return Order.objects.none()
    
    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        """Update order status (farmer only)"""
        order = self.get_object()
        
        if order.produce.farmer != request.user:
            return Response({'error': 'Only the farmer can update order status'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        new_status = request.data.get('status')
        if new_status not in ['delivered', 'cancelled']:
            return Response({'error': 'Invalid status'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        order.status = new_status
        order.save()
        return Response({'message': f'Order status updated to {new_status}'})

class PayoutViewSet(viewsets.ModelViewSet):
    """Payout management views"""
    serializer_class = PayoutSerializer
    permission_classes = []
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Payout.objects.all()
        return Payout.objects.filter(farmer=user)
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated(), IsFarmer()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)
    
    @action(detail=False, methods=['post'])
    def request(self, request):
        """Request a payout (farmer only)"""
        if not hasattr(request.user, 'appuser') or request.user.appuser.role != 'farmer':
            return Response({'error': 'Only farmers can request payouts'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Calculate payout amount from delivered orders
        delivered_orders = Order.objects.filter(
            produce__farmer=request.user,
            status='delivered'
        )
        
        total_amount = delivered_orders.aggregate(
            total=Sum('produce__price_per_kg')
        )['total'] or 0
        
        if total_amount <= 0:
            return Response({'error': 'No delivered orders to payout'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        payout = Payout.objects.create(
            farmer=request.user,
            amount=total_amount,
            status='pending'
        )
        
        return Response({
            'message': 'Payout request created',
            'amount': total_amount,
            'payout_id': payout.id
        }, status=status.HTTP_201_CREATED)

class WarehouseViewSet(viewsets.ReadOnlyModelViewSet):
    """Warehouse views (read-only)"""
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer

class TodoViewSet(viewsets.ModelViewSet):
    """Todo management views"""
    serializer_class = TodoSerializer
    permission_classes = []
    
    def get_queryset(self):
        return Todo.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
