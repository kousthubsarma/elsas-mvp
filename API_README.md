# ELSAS API Documentation

This document describes the available API endpoints for the ELSAS platform.

## Authentication

All API endpoints require authentication via Supabase JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Spaces

#### GET /api/spaces
List all available spaces.

**Query Parameters:**
- `partner_id` (optional): Filter by partner ID
- `is_active` (optional): Filter by active status (true/false)

**Response:**
```json
{
  "spaces": [
    {
      "id": "uuid",
      "name": "Storage Unit A1",
      "description": "Secure storage unit",
      "address": "123 Main St, City, State",
      "is_active": true,
      "open_hours": {
        "mon": {"start": "09:00", "end": "17:00"},
        "tue": {"start": "09:00", "end": "17:00"}
      },
      "max_duration_minutes": 60,
      "partner": {
        "id": "uuid",
        "company_name": "Storage Co",
        "user": {
          "full_name": "John Doe",
          "email": "john@example.com"
        }
      }
    }
  ]
}
```

#### POST /api/spaces
Create a new space (Partner only).

**Request Body:**
```json
{
  "name": "Storage Unit A1",
  "description": "Secure storage unit",
  "address": "123 Main St, City, State",
  "lock_id": "lock-123",
  "camera_url": "https://example.com/camera-feed",
  "open_hours": {
    "mon": {"start": "09:00", "end": "17:00"},
    "tue": {"start": "09:00", "end": "17:00"}
  },
  "max_duration_minutes": 60
}
```

### Access Codes

#### GET /api/access
Get user's access codes.

**Query Parameters:**
- `status` (optional): Filter by status (pending, active, used, expired)
- `space_id` (optional): Filter by space ID

**Response:**
```json
{
  "access_codes": [
    {
      "id": "uuid",
      "code": "qr-code-data",
      "type": "qr",
      "expires_at": "2024-01-01T12:00:00Z",
      "status": "active",
      "space": {
        "id": "uuid",
        "name": "Storage Unit A1",
        "address": "123 Main St",
        "partner": {
          "company_name": "Storage Co"
        }
      }
    }
  ]
}
```

#### POST /api/access
Request access to a space.

**Request Body:**
```json
{
  "space_id": "uuid",
  "type": "qr",
  "duration_minutes": 60
}
```

**Response:**
```json
{
  "access_code": {
    "id": "uuid",
    "code": "qr-code-data",
    "type": "qr",
    "expires_at": "2024-01-01T12:00:00Z",
    "status": "pending",
    "qr_code_url": "data:image/png;base64,..."
  },
  "space": {
    "name": "Storage Unit A1",
    "address": "123 Main St",
    "partner": "Storage Co"
  },
  "expires_at": "2024-01-01T12:00:00Z"
}
```

### Unlock

#### POST /api/unlock
Unlock a space using an access code.

**Request Body:**
```json
{
  "code": "qr-code-data",
  "space_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Space unlocked successfully",
  "space": {
    "name": "Storage Unit A1",
    "address": "123 Main St",
    "partner": "Storage Co"
  },
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "unlock_time": "2024-01-01T12:00:00Z"
}
```

### Access Logs

#### GET /api/logs
Get access logs (Partner only).

**Query Parameters:**
- `space_id` (optional): Filter by space ID
- `user_id` (optional): Filter by user ID
- `event` (optional): Filter by event type
- `start_date` (optional): Filter by start date
- `end_date` (optional): Filter by end date

**Response:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "event": "unlocked",
      "created_at": "2024-01-01T12:00:00Z",
      "user": {
        "full_name": "John Doe",
        "email": "john@example.com"
      },
      "space": {
        "name": "Storage Unit A1"
      },
      "metadata": {
        "type": "qr",
        "unlock_time": "2024-01-01T12:00:00Z"
      }
    }
  ]
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- 100 requests per minute per user
- 1000 requests per hour per user

## WebSocket Events

For real-time updates, the platform supports WebSocket connections:

### Connection
Connect to: `wss://your-domain.com/api/ws`

### Events
- `access_requested`: New access request
- `access_granted`: Access granted
- `access_denied`: Access denied
- `space_unlocked`: Space unlocked
- `space_locked`: Space locked

### Example WebSocket Message
```json
{
  "type": "space_unlocked",
  "data": {
    "space_id": "uuid",
    "user_id": "uuid",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
``` 