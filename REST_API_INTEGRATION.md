# REST API Integration Guide - FERO App

## Overview

The FERO app has been fully migrated from the legacy SP (Stored Procedure) based API to modern REST endpoints. All screens now use dedicated REST helpers for cleaner, more maintainable code.

---

## API Endpoints Reference

### Main Topics

**GET /main-topic**
- Description: Fetch all main topics
- Response:
  ```json
  {
    "success": true,
    "data": [
      { "id": 1, "name": "Doors" },
      { "id": 2, "name": "Windows" }
    ]
  }
  ```

**POST /main-topic**
- Description: Create a new main topic
- Request:
  ```json
  { "name": "Doors" }
  ```
- Response:
  ```json
  {
    "success": true,
    "data": { "id": 1, "name": "Doors" }
  }
  ```

**PUT /main-topic/{id}**
- Description: Update a main topic
- Request:
  ```json
  { "name": "New Name" }
  ```
- Response:
  ```json
  {
    "success": true,
    "data": { "id": 1, "name": "New Name" }
  }
  ```

**DELETE /main-topic/{id}**
- Description: Delete a main topic
- Response:
  ```json
  { "success": true }
  ```

---

### Sub Topics

**GET /by-subtopic/{mainTopicId}**
- Description: Fetch all sub-topics for a main topic
- Response:
  ```json
  {
    "success": true,
    "data": [
      { "id": 1, "title": "Door Frames" },
      { "id": 2, "title": "Door Handles" }
    ]
  }
  ```

**POST /sub-topic** (when available)
- Description: Create a new sub-topic
- Request:
  ```json
  { "title": "Door Frames", "mainTopicId": 1 }
  ```

**PUT /sub-topic/{id}** (when available)
- Description: Update a sub-topic
- Request:
  ```json
  { "title": "New Title" }
  ```

**DELETE /sub-topic/{id}** (when available)
- Description: Delete a sub-topic

---

### Sub Titles

**GET /sub-title**
- Description: Fetch all sub-titles
- Response:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "title": "Standard Frame",
        "subTopicId": 1,
        "images": [
          "https://s3.amazonaws.com/bucket/image1.jpg",
          "https://s3.amazonaws.com/bucket/image2.jpg"
        ]
      }
    ]
  }
  ```

**GET /by-subtitle/{subTopicId}**
- Description: Fetch sub-titles for a specific sub-topic
- Response: Same structure as GET /sub-title

**POST /sub-title**
- Description: Create a new sub-title
- Request:
  ```json
  { "title": "Standard Frame", "subTopicId": 1 }
  ```
- Response:
  ```json
  {
    "success": true,
    "data": { "id": 1, "title": "Standard Frame", "subTopicId": 1 }
  }
  ```

**PUT /sub-title/{id}**
- Description: Update a sub-title
- Request:
  ```json
  { "title": "Updated Title", "subTopicId": 1 }
  ```

**DELETE /sub-title/{id}**
- Description: Delete a sub-title
- Response:
  ```json
  { "success": true }
  ```

---

### Images

**POST /get-upload-url**
- Description: Get a signed S3 upload URL
- Request:
  ```json
  { "fileName": "image.jpg" }
  ```
- Response:
  ```json
  {
    "success": true,
    "data": {
      "uploadUrl": "https://s3.amazonaws.com/bucket?signed-url...",
      "imageUrl": "/images/image-uuid.jpg"
    }
  }
  ```

**POST /save-image**
- Description: Save image metadata after upload
- Request:
  ```json
  {
    "subTitleId": 1,
    "imageUrl": "/images/image-uuid.jpg",
    "sortOrder": 1
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "imageUrl": "https://s3.amazonaws.com/bucket/image-uuid.jpg"
    }
  }
  ```

---

## Implementation Details

### Helper Functions in `lib/api.ts`

All REST endpoints have corresponding helper functions:

```typescript
// Main Topics
export async function getMainTopics(): Promise<MainTopicItem[]>
export async function createMainTopic(payload: { name: string }): Promise<MainTopicItem>
export async function updateMainTopic(payload: { name: string; id: string | number }): Promise<MainTopicItem>
export async function deleteMainTopic(id: string | number): Promise<boolean>

// Sub Topics
export async function getSubTopicsByMainTopic(mainTopicId: string | number): Promise<SubTopicItem[]>

// Sub Titles
export async function getSubTitles(): Promise<SubTitleItem[]>
export async function getSubTitlesBySubTopic(subTopicId: string | number): Promise<SubTitleItem[]>
export async function createSubTitle(payload: { title: string; subTopicId: string | number }): Promise<SubTitleItem>
export async function updateSubTitle(id: string | number, payload: { title: string; subTopicId?: string | number }): Promise<SubTitleItem>
export async function deleteSubTitle(id: string | number): Promise<boolean>

// Images
export async function getUploadUrl(fileName: string): Promise<{ uploadUrl: string; imageUrl: string }>
export async function saveImage(payload: { subTitleId: string | number; imageUrl: string; sortOrder?: number }): Promise<{ id: string | number; imageUrl: string }>
```

---

## Screen Updates

### Main Topic Screen
- **File**: `app/(app)/sub-topic-master/main-topic.tsx`
- **Changes**: Uses `getMainTopics()`, `createMainTopic()`, `updateMainTopic()`, `deleteMainTopic()`
- **Status**: ✅ Complete

### Sub Topic Screen
- **File**: `app/(app)/sub-topic-master/sub-topic.tsx`
- **Changes**: Uses `getMainTopics()` and `getSubTopicsByMainTopic()`
- **Status**: ✅ Refactored (create/update pending backend endpoints)

### Sub Title Screen
- **File**: `app/(app)/sub-topic-master/sub-title.tsx`
- **Changes**: Uses `getSubTitles()`, `createSubTitle()`, `updateSubTitle()`, `deleteSubTitle()`, `saveImage()`
- **Status**: ✅ Refactored (full S3 flow pending)

---

## Logging & Debugging

All API calls log to console with the `[API]` prefix:

```
[API] GET https://api.example.com/main-topic
[API] POST https://api.example.com/main-topic
[API] DELETE https://api.example.com/main-topic/1
```

Filter console output by searching for `[API]` to monitor all REST requests.

---

## Error Handling

Each helper function:
1. Logs the request with `console.log('[API]'...)`
2. Checks response status
3. Throws descriptive errors on failure
4. Returns parsed JSON data

Example error flow:
```typescript
try {
  const topics = await getMainTopics();
} catch (error) {
  console.error('[API] Failed to fetch main topics:', error);
  // Fallback logic or user alert
}
```

---

## Migration Checklist

- [x] Add REST helpers for all endpoints
- [x] Update main-topic screen
- [x] Update sub-topic screen
- [x] Update sub-title screen
- [x] Add AWS logging/utilities
- [ ] Test all CRUD operations
- [ ] Implement S3 image upload flow
- [ ] Add request retries for failed calls
- [ ] Add offline caching

---

## Next Steps

1. **Test the API endpoints** - Verify all endpoints are responding correctly
2. **Implement S3 upload** - Use `getUploadUrl()` before uploading to S3, then `saveImage()`
3. **Add retry logic** - Use `retryAWSCall()` from `lib/awsUtils.ts` for resilience
4. **Implement offline mode** - Cache responses and queue mutations
5. **Add request timeout** - Set max timeout for fetch requests

---

## Environment Variables

Ensure your `lib/config.ts` has the correct AWS API Gateway endpoint:

```typescript
export const API_PREFIX = `https://brt30fpab4.execute-api.ap-south-1.amazonaws.com`;
```

Update this to match your actual API endpoint.

---

## References

- API Gateway: https://brt30fpab4.execute-api.ap-south-1.amazonaws.com
- AWS Region: ap-south-1
- Stage: production (update as needed)

---

## Troubleshooting

### CORS Errors
If you see CORS errors, ensure your API Gateway has CORS enabled for the domain.

### 404 Errors
Check that the endpoint path matches exactly (e.g., `/main-topic` not `/main-topics`).

### 500 Errors
Check the API Gateway logs and Lambda function logs for detailed errors.

### Timeout Errors
Increase the fetch timeout in helper functions or implement retry logic.

---

## Support

For issues or questions about the REST API integration:
1. Check the console logs with `[API]` filter
2. Verify the endpoint URLs in `lib/api.ts`
3. Test endpoints manually using Postman or curl
4. Check AWS CloudWatch logs for Lambda errors
