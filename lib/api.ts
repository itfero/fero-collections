// lib/api.ts
import { API_PREFIX } from './config';

// Simple fetch wrapper with timeout using AbortController.
async function fetchWithTimeout(input: RequestInfo, init?: RequestInit, timeout = 6000) {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const signal = controller ? controller.signal : undefined;
    const timer = controller ? setTimeout(() => controller.abort(), timeout) : null;
    try {
        const res = await fetch(input, { ...(init || {}), signal } as any);
        return res;
    } finally {
        if (timer) clearTimeout(timer);
    }
}
type RawRow = {
    TOPIC_ID: number;
    TOPIC_NAME: string;
    SUBTOPIC_ID: number | null;
    SUBTOPIC_NAME: string | null;
    SUB_TITLE_ID: number | null;
    SUB_TITLE: string | null;
    IMAGE_ID: number | null;
    IMAGE_URL: string | null;
    SORT_ORDER: number | null;
};

export type ImageItem = {
    id: string;
    url: string;
};

export type SubTitle = {
    id: string;
    title: string;
    images: ImageItem[];
};

export type SubTopic = {
    id: string;
    title: string;
    subTitles?: SubTitle[];
    images: string[];
};

export type Topic = {
    id: string;
    title: string;
    subtopics: SubTopic[];
    images: string[];
};

/**
 * Fetch raw rows from your API.
 * Adjust the path '/main/...' below if your endpoint path differs.
 * action,
      formId,
      topicId,
      topicName,
      subtopicId,
      subtopicName,
      subTitleId,
      subTitle,
      imageId,
      imageUrl,
      sortOrder,
      preview,
      user
 */
export async function fetchRows(action: any, formId: any, topicId: any, subTopicId: any, preview: any, topicName: any = '', subtopicName: any = '', subTitleId: any = '', subTitle: any = '', imageId: any = '', imageUrl: any = '', sortOrder: any = ''): Promise<RawRow[]> {
    const dynUrl = action == 'R' ? '/get_data' : '/write_data';
    const url = `${API_PREFIX}${dynUrl}`; // AWS API Gateway endpoint
    const postdata = {
        "action": action,
        "topicId": topicId,
        "subtopicId": subTopicId,
        "formId": formId,
        "preview": preview,
        "user": "ADMIN",
        "topicName": topicName,
        "subtopicName": subtopicName,
        "subTitleId": subTitleId,
        "subTitle": subTitle,
        "imageId": imageId,
        "imageUrl": imageUrl,
        "sortOrder": sortOrder
    };
    
    console.log(`[AWS] ${action} Request to:`, url);
    console.log(`[AWS] Payload:`, postdata);
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postdata),
        });
        
        if (!res.ok) {
            const text = await res.text();
            console.error(`[AWS] Error ${res.status}:`, text);
            throw new Error(`AWS API Error ${res.status}: ${text}`);
        }
        
        const json = await res.json();
        console.log(`[AWS] Response:`, json);
        
        // Handle AWS response format: { msg, success, data: [...] } or direct data
        const result = (action == 'R' ? json?.data : json) ?? [];
        return result;
    } catch (error) {
        console.error(`[AWS] Failed to fetch rows:`, error);
        throw error;
    }
}

/**
 * Given raw rows, produce array of Topic objects:
 * - Groups rows by TOPIC_ID
 * - Within each topic, groups by SUB_TITLE_ID (this matches your mapping)
 * - For each subtitle group, collects IMAGE_URLs into images[]
 *
 * The mapping you provided:
 * const map = {};
 * rows.forEach(r => {
 *   if (!map[r.SUB_TITLE_ID]) {
 *     map[r.SUB_TITLE_ID] = {
 *       title: r.SUB_TITLE,
 *       images: [],
 *     };
 *   }
 *   if (r.IMAGE_URL) {
 *     map[r.SUB_TITLE_ID].images.push(r.IMAGE_URL);
 *   }
 * });
 * return Object.values(map);
 *
 * This function applies that mapping per-topic and returns topics with subtopics array.
 */
// export function rowsToTopics(rows: RawRow[]): Topic[] {
//     const topicsMap: Record<number, { title: string; subtitleMap: Record<number, { title: string; images: string[] }>; topicImages: string[] }> = {};

//     rows.forEach(r => {
//         const tId = r.TOPIC_ID;
//         if (!topicsMap[tId]) {
//             topicsMap[tId] = { title: r.TOPIC_NAME ?? `Topic ${tId}`, subtitleMap: {}, topicImages: [] };
//         }

//         // add image to topic-level images (optional)
//         if (r.IMAGE_URL) {
//             topicsMap[tId].topicImages.push(absImageUrl(r.IMAGE_URL));
//         }

//         const subTitleId = r.SUB_TITLE_ID;
//         if (subTitleId != null) {
//             if (!topicsMap[tId].subtitleMap[subTitleId]) {
//                 topicsMap[tId].subtitleMap[subTitleId] = { title: r.SUB_TITLE ?? `Subtitle ${subTitleId}`, images: [] };
//             }
//             if (r.IMAGE_URL) {
//                 topicsMap[tId].subtitleMap[subTitleId].images.push(absImageUrl(r.IMAGE_URL));
//             }
//         }
//     });

//     // Convert to Topic[]
//     const topics: Topic[] = Object.keys(topicsMap).map(k => {
//         const t = topicsMap[Number(k)];
//         const subtopics: SubTopic[] = Object.keys(t.subtitleMap).map(sid => ({
//             id: sid,
//             title: t.subtitleMap[Number(sid)].title,
//             images: t.subtitleMap[Number(sid)].images,
//         }));
//         return {
//             id: String(k),
//             title: t.title,
//             subtopics,
//             images: t.topicImages,
//         };
//     });

//     return topics;
// }
export function rowsToTopics(rows: RawRow[]): Topic[] {
    const topicMap: Record<
        number,
        {
            title: string;
            subMap: Record<number, SubTopic>;
            images: string[];
        }
    > = {};

    rows.forEach(r => {
        const topicId = r.TOPIC_ID;

        if (!topicMap[topicId]) {
            topicMap[topicId] = {
                title: r.TOPIC_NAME ?? `Topic ${topicId}`,
                subMap: {},
                images: [],
            };
        }

        // topic-level images (optional)
        if (r.IMAGE_URL) {
            topicMap[topicId].images.push(absImageUrl(r.IMAGE_URL));
        }

        // ✅ REAL SUB TOPIC MAPPING
        if (r.SUBTOPIC_ID != null) {
            const subId = r.SUBTOPIC_ID;

            if (!topicMap[topicId].subMap[subId]) {
                topicMap[topicId].subMap[subId] = {
                    id: String(subId),
                    title: r.SUBTOPIC_NAME ?? `Sub Topic ${subId}`,
                    images: [],
                };
            }

            if (r.IMAGE_URL) {
                topicMap[topicId].subMap[subId].images.push(
                    absImageUrl(r.IMAGE_URL)
                );
            }
        }
    });

    return Object.entries(topicMap).map(([id, t]) => ({
        id,
        title: t.title,
        subtopics: Object.values(t.subMap),
        images: t.images,
    }));
}

export function rowsToSubTitles(rows: RawRow[]): SubTitle[] {
    const map: Record<number, SubTitle> = {};

    rows.forEach(r => {
        if (!r.SUB_TITLE_ID) return;

        if (!map[r.SUB_TITLE_ID]) {
            map[r.SUB_TITLE_ID] = {
                id: String(r.SUB_TITLE_ID),
                title: r.SUB_TITLE ?? '',
                images: [],
            };
        }

        if (r.IMAGE_ID && r.IMAGE_URL) {
            map[r.SUB_TITLE_ID].images.push({
                id: String(r.IMAGE_ID),
                url: absImageUrl(r.IMAGE_URL),
            });
        }
    });

    return Object.values(map);
}

/**
 * Make IMAGE_URL absolute if it's a relative path (prefix with API_PREFIX).
 * If URL already starts with http/https, return as-is.
 */
function absImageUrl(url: string) {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // ensure no double slashes
    return API_PREFIX.replace(/\/$/, '') + '/' + url.replace(/^\//, '');
}

/* ---------------- REST helpers for main-topics (newer API routes) ---------------- */

type MainTopicItem = {
    id: number | string;
    name: string;
    sortOrder?: number;
    delStatus?: boolean;
};

export async function getMainTopics(): Promise<MainTopicItem[]> {
    const url = `${API_PREFIX}/main-topic`;
    console.log('[API] GET', url);
    const res = await fetchWithTimeout(url, { method: 'GET' }, 6000);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch main topics: ${res.status} ${text}`);
    }
    const json = await res.json();
    // expected shape: { success: true, data: [ { id, name }, ... ] }
    return json?.data ?? [];
}

export async function getBrochureTree(): Promise<any[]> {
    const url = `${API_PREFIX}/brochure-tree`;
    console.log('[API] GET', url);
    const res = await fetchWithTimeout(url, { method: 'GET' }, 6000);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch brochure tree: ${res.status} ${text}`);
    }
    const json = await res.json();
    // expected shape: { success: true, data: [ { id, name, SubTopics: [ { id, name, SubTitles: [ { id, title, Attachments: [...] } ] } ] } ] }
    return json?.data ?? [];
}

export async function createMainTopic(payload: { name: string; sortOrder?: number; delStatus?: boolean }): Promise<MainTopicItem> {
    const url = `${API_PREFIX}/main-topic`;
    console.log('[API] POST', url, payload);
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to create main topic: ${res.status} ${text}`);
    }
    const json = await res.json();
    // expected shape: { success: true, data: { id, name, sortOrder, delStatus } }
    return json?.data ?? null;
}

export async function updateMainTopic(payload: { name: string; id: string | number; sortOrder?: number; delStatus?: boolean }): Promise<MainTopicItem> {
    const url = `${API_PREFIX}/main-topic`;
    console.log('[API] POST', url, payload);
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: payload.name, sortOrder: payload.sortOrder, delStatus: payload.delStatus, id: payload.id }),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to update main topic: ${res.status} ${text}`);
    }
    const json = await res.json();
    console.log('out', json);
    
    return json?.data ?? null;
}

export async function deleteMainTopic(payload: { name: string; id: string | number; sortOrder?: number; delStatus?: boolean }): Promise<MainTopicItem> {
    const url = `${API_PREFIX}/main-topic`;
    console.log('[API] POST', url);
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to delete main topic: ${res.status} ${text}`);
    }
    const json = await res.json();
    return json?.success ?? true;
}

/* ---------------- REST helpers for sub-topics (routes: /by-subtopic, /by-subtopic/:id) ---------------- */

type SubTopicItem = {
    id: number | string;
    name: string;
};

export async function getSubTopicsByMainTopic(mainTopicId: string | number): Promise<SubTopicItem[]> {
    const url = `${API_PREFIX}/sub-topic/${mainTopicId}`;
    console.log('[API] GET', url);
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch sub-topics: ${res.status} ${text}`);
    }
    const json = await res.json();
    // expected shape: { success: true, data: [ { id, title }, ... ] }
    return json?.data ?? [];
}

export async function getAllSubTopics(): Promise<SubTopicItem[]> {
    const url = `${API_PREFIX}/sub-topic`;
    console.log('[API] GET', url);
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch all sub-topics: ${res.status} ${text}`);
    }
    const json = await res.json();
    // expected shape: { success: true, data: [ { id, title }, ... ] }
    return json?.data ?? [];
}

export async function createSubTopic(payload: { name: string; mainTopicId: string | number; sortOrder?: number; delStatus?: boolean }): Promise<SubTopicItem> {
    const url = `${API_PREFIX}/sub-topic`;
    console.log('[API] POST', url, payload);
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to create sub-topic: ${res.status} ${text}`);
    }
    const json = await res.json();
    return json?.data ?? null;
}

export async function updateSubTopic(payload: { id: string | number; name?: string; mainTopicId?: string | number; sortOrder?: number; delStatus?: boolean }): Promise<SubTopicItem> {
    const url = `${API_PREFIX}/sub-topic`;
    console.log('[API] POST', url, payload);
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to update sub-topic: ${res.status} ${text}`);
    }
    const json = await res.json();
    return json?.data ?? null;
}

export async function deleteSubTopic(payload: { id: string | number; delStatus?: boolean }): Promise<boolean> {
    const url = `${API_PREFIX}/sub-topic`;
    console.log('[API] POST', url, payload);
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to delete sub-topic: ${res.status} ${text}`);
    }
    const json = await res.json();
    return json?.success ?? true;
}

/* ---------------- REST helpers for sub-titles (routes: /sub-title, /sub-title/:id, /by-subtitle/:id) ---------------- */

type SubTitleItem = {
    id: number | string;
    title: string;
    subTopicId: number | string;
    images?: string[];
};

export async function getSubTitles(): Promise<SubTitleItem[]> {
    const url = `${API_PREFIX}/sub-title`;
    console.log('[API] GET', url);
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch sub-titles: ${res.status} ${text}`);
    }
    const json = await res.json();
    // expected shape: { success: true, data: [ { id, title, subTopicId, images }, ... ] }
    return json?.data ?? [];
}

export async function getSubTitlesBySubTopic(subTopicId: string | number): Promise<SubTitleItem[]> {
    const url = `${API_PREFIX}/sub-topic/${subTopicId}`;
    console.log('[API] GET', url);
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch sub-titles by sub-topic: ${res.status} ${text}`);
    }
    const json = await res.json();
    return json?.data ?? [];
}

export async function createSubTitle(payload: { title: string; subTopicId: string | number; sortOrder?: number }): Promise<SubTitleItem> {
    const url = `${API_PREFIX}/sub-title`;
    console.log('[API] POST', url, payload);
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to create sub-title: ${res.status} ${text}`);
    }
    const json = await res.json();
    // expected shape: { success: true, data: { id, title, subTopicId } }
    return json?.data ?? null;
}

export async function updateSubTitle(payload: { id: string | number; title?: string; subTopicId?: string | number; sortOrder?: number; delStatus?: boolean }): Promise<SubTitleItem> {
    const url = `${API_PREFIX}/sub-title`;
    console.log('[API] POST', url, payload);
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to update sub-title: ${res.status} ${text}`);
    }
    const json = await res.json();
    return json?.data ?? null;
}

export async function deleteSubTitle(payload: { id: string | number; delStatus?: boolean }): Promise<boolean> {
    const url = `${API_PREFIX}/sub-title`;
    console.log('[API] POST', url, payload);
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to delete sub-title: ${res.status} ${text}`);
    }
    const json = await res.json();
    return json?.success ?? true;
}

/* ---------------- REST helpers for image upload (routes: /get-upload-url, /save-image) ---------------- */

export async function getUploadUrl(payload: { subTitleId: string | number; fileName: string; mime: string }): Promise<{ uploadUrl: string; imageUrl: string; uri_original?: string; uri_medium?: string; uri_thumb?: string; uri_webp?: string }> {
    const url = `${API_PREFIX}/get-upload-url`;
    console.log('[API] POST', url, payload);
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to get upload URL: ${res.status} ${text}`);
    }
    const json = await res.json();
    // expected shape: { success: true, data: { uploadUrl, imageUrl, uri_original, uri_medium, uri_thumb, uri_webp } }
    return json?.data ?? null;
}

export async function saveImage(payload: { subTitleId: string | number; imageUrl: string; uri_original?: string; uri_medium?: string; uri_thumb?: string; uri_webp?: string; sortOrder?: number }): Promise<{ id: string | number; imageUrl: string }> {
    const url = `${API_PREFIX}/attachments`;
    console.log('[API] POST', url, payload);
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to save image: ${res.status} ${text}`);
    }
    const json = await res.json();
    // expected shape: { success: true, data: { id, imageUrl } }
    return json?.data ?? null;
}  