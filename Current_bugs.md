# Current Bugs - e-Beer API

## ✅ Fixed Bugs (All Tested & Working)

### 1. Missing Farmer Bid Viewing Endpoint ✅ FIXED & TESTED
- **Endpoint**: `GET /api/produce/{id}/bids/` (farmer only)
- **Fix Applied**: Added custom `bids` action to ProduceViewSet
- **Location**: `api/views.py` lines 92-104
- **Status**: ✅ FIXED & TESTED - Farmers can now view bids on their produce
- **Test Result**: ✅ SUCCESS - Farmer can see bid amounts, buyer info, status, timestamp
- **Date Fixed**: 2025-09-13

### 2. Broken Bid Acceptance Permissions ✅ FIXED & TESTED
- **Endpoint**: `POST /api/bids/{id}/accept/`
- **Fix Applied**: Added custom `get_permissions()` method to BidViewSet
- **Location**: `api/views.py` lines 114-117
- **Status**: ✅ FIXED & TESTED - Farmers can now accept bids
- **Test Result**: ✅ SUCCESS - Bid accepted, order created automatically
- **Date Fixed**: 2025-09-13

### 3. Authorization Header Format Issues ✅ FIXED & TESTED
- **Issue**: Inconsistent "Bearer" token prefix requirements
- **Fix Applied**: Documented correct format in test commands
- **Status**: ✅ FIXED & TESTED - All test commands now use correct Bearer format
- **Test Result**: ✅ SUCCESS - No more authorization header errors
- **Date Fixed**: 2025-09-13

## 🧪 Test Commands

### Test 1: Farmer Bid Viewing
```powershell
# Get farmer token
$farmerLogin = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/login/" -Method POST -ContentType "application/json" -Body '{
    "username": "testfarmer",
    "password": "testpass123"
}'
$farmerToken = $farmerLogin.access

# View bids on produce
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/produce/PRODUCE_ID/bids/" -Method GET -Headers @{"Authorization"="Bearer $farmerToken"}
```

### Test 2: Bid Acceptance
```powershell
# Accept a bid (using farmer token from above)
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/bids/BID_ID/accept/" -Method POST -Headers @{"Authorization"="Bearer $farmerToken"}
```

### Test 3: Complete Bidding Workflow
```powershell
# 1. Create produce (farmer)
$produceResponse = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/produce/" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer $farmerToken"} -Body '{
    "name": "Fresh Carrots",
    "quantity": "30.00",
    "price_per_kg": "2.50",
    "min_price": "1.50",
    "location": "Berbera",
    "harvest_date": "2025-09-16"
}'
$produceId = $produceResponse.id

# 2. Place bid (buyer)
$buyerLogin = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/login/" -Method POST -ContentType "application/json" -Body '{
    "username": "testbuyer",
    "password": "testpass123"
}'
$buyerToken = $buyerLogin.access

$bidResponse = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/bids/" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer $buyerToken"} -Body '{
    "produce": "' + $produceId + '",
    "bid_price": "2.25"
}'
$bidId = $bidResponse.id

# 3. View bids (farmer)
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/produce/$produceId/bids/" -Method GET -Headers @{"Authorization"="Bearer $farmerToken"}

# 4. Accept bid (farmer)
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/bids/$bidId/accept/" -Method POST -Headers @{"Authorization"="Bearer $farmerToken"}

# 5. Check orders
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/orders/" -Method GET -Headers @{"Authorization"="Bearer $farmerToken"}
```

## ✅ Recently Fixed Bugs

### 1. Role-Based Navigation After Registration ✅ FIXED
- **Issue**: Users were always redirected to buyer page regardless of selected role (farmer/buyer)
- **Location**: `src/hooks/useAuth.ts` - register function AND `src/components/EBeerApp.tsx` - tab initialization
- **Root Cause**: Two issues:
  1. Register function was using profile API for role instead of registration data
  2. EBeerApp component was initializing activeTab before role was loaded, causing default to 'shop'
- **Fix Applied**: 
  1. Updated register function to use role from registration data
  2. Fixed EBeerApp to use useEffect to update activeTab when role changes
  3. Added debugging logs to track role changes
- **Status**: ✅ FIXED - Users now correctly navigate to farmer/buyer pages based on selected role
- **Date Fixed**: 2025-09-13

## 🐛 Minor Issues (Non-Critical)

### 1. Frontend Error Message Display
- **Issue**: Frontend still shows "Bad Request" instead of specific Django validation errors
- **Location**: Frontend registration form
- **Impact**: Minor UX issue - users don't see specific password requirements
- **Status**: 🔄 Minor - Authentication works, just error display needs improvement
- **Priority**: Low - Core functionality working

### 2. Produce CRUD Operations - Pause/Sold/Delete
- **Issue**: Pause, Mark as Sold, and Delete operations return "detail: no produce match query"
- **Location**: `src/pages/farmer/ListingsPage.tsx` - handleToggleListingStatus and handleDeleteListing
- **Impact**: Users cannot pause, mark as sold, or delete their produce listings
- **Status**: 🔄 Known Issue - Edit functionality works perfectly, but other operations fail
- **Priority**: Medium - Core CRUD functionality partially broken
- **Note**: Edit functionality works fine, suggesting API permissions or endpoint issues

## 📋 Current Status

### ✅ Working Features (Tested & Verified)
- User registration and login
- Profile management (GET/PATCH)
- Produce listing creation and viewing
- Bid placement (buyers can place bids)
- Bid viewing (buyers can see their own bids)
- **✅ FIXED**: Farmer bid viewing - Can see bid amounts, buyer info, status
- **✅ FIXED**: Bid acceptance - Farmers can accept bids successfully
- **✅ WORKING**: Order creation - Orders created automatically when bids accepted
- **✅ WORKING**: Complete bidding workflow - End-to-end functionality verified

### 🔄 Ready for Testing (Next Priority)
- Order management (view orders from both farmer/buyer perspectives)
- Order status updates (mark orders as delivered/cancelled)
- Payout requests (farmer payment requests)
- Warehouse management (view warehouse locations)
- Todo management (personal task management)
- Produce listing updates/deletion (CRUD operations)

### 🎯 Current Testing Status
- **Core Business Logic**: ✅ COMPLETE - Bidding system fully functional
- **Authentication**: ✅ COMPLETE - JWT tokens working correctly
- **User Management**: ✅ COMPLETE - Registration, login, profiles working
- **Produce Management**: ✅ COMPLETE - Create, view listings working
- **Remaining Features**: 🔄 READY FOR TESTING

## 🎯 Next Steps

1. **✅ COMPLETED**: Test the fixed bidding workflow - ALL WORKING
2. **🔄 NEXT**: Test remaining endpoints - Order management, payouts, etc.
3. **🔄 NEXT**: Test React frontend integration
4. **🔄 NEXT**: End-to-end application testing

---
*Last Updated: 2025-09-13*
*Fixed Bugs: 3/3 Critical bugs resolved and tested*
*Core Functionality: ✅ Bidding system fully operational*
