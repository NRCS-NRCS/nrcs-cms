import { useCallback } from 'react';

import useAlert from '#hooks/useAlert';
import { BYTES_PER_MEGA_BYTE } from '#utils/common';
import {
    ACCEPTED_MARKDOWN_IMAGE_FORMATS,
    MAX_MARKDOWN_IMAGE_SIZE_IN_MB,
    uploadMarkdownImage,
} from '#utils/markdownImage';

export const ACCEPTED_IMAGE_EXTENSIONS = ACCEPTED_MARKDOWN_IMAGE_FORMATS
    .map((format) => `.${format}`)
    .join(',');

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
