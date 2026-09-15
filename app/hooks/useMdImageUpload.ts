import { useCallback } from 'react';
import { Cookies } from 'react-cookie';
import {
    api,
    environment,
} from 'app/config';

import useAlert from '#hooks/useAlert';
import {
    ACCEPTED_MARKDOWN_IMAGE_FORMATS,
    BYTES_PER_MEGA_BYTE,
    MAX_MARKDOWN_IMAGE_SIZE_IN_MB,
} from '#utils/common';

export const ACCEPTED_IMAGE_EXTENSIONS = ACCEPTED_MARKDOWN_IMAGE_FORMATS
    .map((format) => `.${format}`)
    .join(',');

const COOKIE_NAME = `NRCS-${environment}-CSRFTOKEN`;
const UPLOAD_ENDPOINT = `${api}/mdeditor/uploads/`;

const cookies = new Cookies();
    interface UploadResponse {
        success: 0 | 1;
        message: string;
        url: string;
    }
async function uploadMarkdownImage(image: File) {
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

function useImageUpload() {
    const alert = useAlert();

    return useCallback(async (image: File) => {
        const extension = image.name.split('.').pop()?.toLowerCase();
        if (!extension || !ACCEPTED_MARKDOWN_IMAGE_FORMATS.includes(extension)) {
            const message = `Unsupported image format. Allowed: ${ACCEPTED_MARKDOWN_IMAGE_FORMATS.join(', ')}.`;
            alert.show(message, { variant: 'danger' });
            throw new Error(message);
        }
        if (image.size > MAX_MARKDOWN_IMAGE_SIZE_IN_MB * BYTES_PER_MEGA_BYTE) {
            const message = `Image is too large. Max size must be less than ${MAX_MARKDOWN_IMAGE_SIZE_IN_MB} MB.`;
            alert.show(message, { variant: 'danger' });
            throw new Error(message);
        }

        try {
            return await uploadMarkdownImage(image);
        } catch (uploadError) {
            const message = uploadError instanceof Error
                ? uploadError.message
                : 'The image could not be uploaded.';
            alert.show(message, { variant: 'danger' });
            throw uploadError;
        }
    }, [alert]);
}

export default useImageUpload;
