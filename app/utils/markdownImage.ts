import { Cookies } from 'react-cookie';
import {
    api,
    environment,
} from 'app/config';

const COOKIE_NAME = `NRCS-${environment}-CSRFTOKEN`;
const UPLOAD_ENDPOINT = `${api}/mdeditor/uploads/`;

const cookies = new Cookies();

export const MAX_MARKDOWN_IMAGE_SIZE_IN_MB = 2;
export const ACCEPTED_MARKDOWN_IMAGE_FORMATS = ['jpg', 'jpeg', 'gif', 'png', 'bmp', 'webp', 'svg'];

interface UploadResponse {
    success: 0 | 1;
    message: string;
    url: string;
}

export async function uploadMarkdownImage(image: File) {
    const body = new FormData();
    body.append('editormd-image-file', image);

    const response = await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        body,
        credentials: 'include',
        headers: {
            'X-CSRFToken': cookies.get(COOKIE_NAME),
        },
    });

    let data: UploadResponse | undefined;
    try {
        data = await response.json() as UploadResponse;
    } catch {
        data = undefined;
    }

    if (!response.ok || !data || data.success !== 1 || !data.url) {
        throw new Error(data?.message || 'The image could not be uploaded. Please try again.');
    }

    return data.url;
}

export function resolveMarkdownImageSrc(source: string) {
    if (source.startsWith('/')) {
        return `${api}${source}`;
    }
    return source;
}
