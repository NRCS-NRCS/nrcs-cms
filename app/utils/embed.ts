export const HORIZONTAL = 'horizontal';
export const VERTICAL = 'vertical';

export type Orientation = typeof HORIZONTAL | typeof VERTICAL;

const YOUTUBE_URL_REGEX = /^https?:\/\/(?:(?:www|m)\.)?(?:youtube\.com\/(?:watch\?(?:[^\s]*&)?v=[\w-]{11}|embed\/[\w-]{11}|shorts\/[\w-]{11}|live\/[\w-]{11})|youtu\.be\/[\w-]{11})(?![\w-])[^\s]*$/i;

const FACEBOOK_URL_REGEX = /^https?:\/\/(?:(?:(?:www|web|m)\.)?facebook\.com\/(?:watch\/?\?(?:[^\s]*&)?v=\d+|reel\/\d+|[\w.-]+\/videos\/(?:[\w.-]+\/)?\d+|video\.php\?(?:[^\s]*&)?v=\d+)|fb\.watch\/[\w-]+)(?![\w-])[^\s]*$/i;

const VERTICAL_URL_REGEX = /(?:facebook\.com\/reel\/|youtube\.com\/shorts\/)/i;

export function isSupportedEmbedUrl(url: string) {
    return YOUTUBE_URL_REGEX.test(url) || FACEBOOK_URL_REGEX.test(url);
}

export function inferOrientation(url: string): Orientation {
    return VERTICAL_URL_REGEX.test(url) ? VERTICAL : HORIZONTAL;
}

interface EmbedBlockOptions {
    url: string;
    orientation?: Orientation;
    caption?: string;
}

/** Build the body of the fenced block, without the fences themselves. */
export function buildEmbedBody(options: EmbedBlockOptions) {
    const { url, orientation, caption } = options;

    const lines = [`url: ${url}`];
    if (orientation) {
        lines.push(`orientation: ${orientation}`);
    }
    if (caption) {
        lines.push(`caption: ${caption}`);
    }

    return lines.join('\n');
}

/** Build the fenced block the server parses. */
export function buildEmbedBlock(options: EmbedBlockOptions) {
    return ['```embed', buildEmbedBody(options), '```'].join('\n');
}

export interface ParsedEmbed {
    url?: string;
    orientation?: Orientation;
    caption?: string;
}

export function parseEmbedBody(body: string): ParsedEmbed {
    const parsed: ParsedEmbed = {};

    body.split('\n').forEach((line) => {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex === -1) {
            return;
        }
        const key = line.slice(0, separatorIndex).trim().toLowerCase();
        // The value keeps its own colons, which every URL has.
        const value = line.slice(separatorIndex + 1).trim();
        if (!value) {
            return;
        }
        if (key === 'url' && !parsed.url) {
            parsed.url = value;
        } else if (key === 'orientation' && (value === HORIZONTAL || value === VERTICAL)) {
            parsed.orientation = value;
        } else if (key === 'caption') {
            parsed.caption = value;
        }
    });

    if (!parsed.orientation && parsed.url) {
        parsed.orientation = inferOrientation(parsed.url);
    }

    return parsed;
}
