const CONTACT_NUMBER_REGEX = /^\+?\d+(-\d+)*-?$/;

const CONTACT_NUMBER_DISALLOWED_CHARS_REGEX = /[^\d+-]/g;

export function contactNumberCondition(value: string | null | undefined) {
    if (value && !CONTACT_NUMBER_REGEX.test(value)) {
        return 'Contact number must contain only numbers and hyphens.';
    }
    return undefined;
}

export function sanitizeContactNumber(value: string | undefined) {
    return value?.replace(CONTACT_NUMBER_DISALLOWED_CHARS_REGEX, '');
}
