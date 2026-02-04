# Sortable Topics Implementation

## Overview
Main topics now support ordering with `sortOrder` and `delStatus` fields. Users can drag topics up/down to reorder them, and the changes persist to the API.

## Changes Made

### 1. **lib/api.ts**
- Updated `MainTopicItem` type to include:
  - `sortOrder?: number` - Position in the list (0-indexed)
  - `delStatus?: boolean` - Soft delete flag

- Updated `createMainTopic()` to accept `sortOrder` and `delStatus` in payload
- Updated `updateMainTopic()` to accept and persist `sortOrder` and `delStatus`

### 2. **app/(app)/sub-topic-master/main-topic.tsx**
- Added `sortOrder` and `delStatus` to `TopicItem` type
- Updated data loading to populate `sortOrder` from API response
- Added `handleMoveUp()` - Swaps sortOrder with item above and persists both
- Added `handleMoveDown()` - Swaps sortOrder with item below and persists both
- Updated `renderRow()` to show:
  - Sort order badge: `sort: 0`
  - Up/Down arrow buttons (disabled at top/bottom)
  - Edit, Move Up, Move Down, Delete buttons

### 3. **UI/UX**
- **Move Up Button**: Arrow-up icon, disabled if item is first
- **Move Down Button**: Arrow-down icon, disabled if item is last
- Disabled buttons show lighter color (#ccc)
- Meta info displays: `id: 1 • sort: 5 • subtopics: 3`

## API Contract

### GET /main-topic
Returns topics sorted by `sortOrder`:
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Doors", "sortOrder": 1, "delStatus": false },
    { "id": 2, "name": "Windows", "sortOrder": 2, "delStatus": false }
  ]
}
```

### PUT /main-topic/{id}
Update topic with new sort order:
```json
{
  "name": "Doors",
  "sortOrder": 2,
  "delStatus": false
}
```

## How Sorting Works

1. **Initial Load**: Topics are loaded in order of `sortOrder`
2. **Move Up**: Current item's `sortOrder` ← Prev item's `sortOrder`
3. **Move Down**: Current item's `sortOrder` → Next item's `sortOrder`
4. **Persist**: Both items are updated simultaneously via API

## Error Handling

- If move fails, list reverts to previous state
- User is not blocked from continuing
- Failed requests are logged with `[API]` prefix

## Future Enhancements

- Drag & drop support (replace arrow buttons)
- Batch reorder operations
- Undo/redo functionality
- Sort by `delStatus` to hide soft-deleted items

## Testing

1. Create 3-4 topics
2. Click up/down arrows to reorder
3. Check network tab: PUT requests update sortOrder
4. Refresh page: Topics remain in new order
5. Verify top item's up arrow is disabled
6. Verify last item's down arrow is disabled
