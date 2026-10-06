import {
    encodeDate,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import { nonFieldError } from '@togglecorp/toggle-form';
import { api } from 'app/config';

import {
    CecMemberTypeEnum,
    PartnerScopeEnum,
    RadioProgramTypeEnum,
    ResourceTypeEnum,
    StatusEnum,
    UserTypeEnum,
} from '#generated/types/graphql';

export function labelSelector<T>(item: { label: T }) {
    return item.label;
}

export function keySelector<T>(item: { key: T }) {
    return item.key;
}

export function idSelector<T>(item: { id: T }) {
    return item.id;
}

export function nameSelector<T>(item: { name: T }) {
    return item.name;
}

export function valueSelector<T>(item: { value: T }) {
    return item.value;
}

export const archivedFilterOptions = [
    { label: 'Active', value: 'false' },
    { label: 'Archived', value: 'true' },
];

export const resourceTypeLabels: Record<ResourceTypeEnum, string> = {
    [ResourceTypeEnum.PolicyAndGuidelines]: 'Policy and Guidelines',
    [ResourceTypeEnum.Report]: 'Report',
};

export const typeFilterOptions = (
    Object.values(ResourceTypeEnum).map((type) => ({
        label: resourceTypeLabels[type],
        value: type,
    }))
);

export const radioProgramTypeLabels: Record<RadioProgramTypeEnum, string> = {
    [RadioProgramTypeEnum.RadioRedCross]: 'Radio Red Cross',
    [RadioProgramTypeEnum.TogetherForHumanity]: 'Together For Humanity',
};

export const typeRadioFilterOptions = (
    Object.values(RadioProgramTypeEnum).map((type) => ({
        label: radioProgramTypeLabels[type],
        value: type,
    }))
);

export const scopeFilterOptions = [
    { label: 'Global', value: PartnerScopeEnum.Global },
    { label: 'Local', value: PartnerScopeEnum.Local },
];

export const cecMemberTypeLabels: Record<CecMemberTypeEnum, string> = {
    [CecMemberTypeEnum.OfficeBearer]: 'Office Bearer',
    [CecMemberTypeEnum.Member]: 'Member',
    [CecMemberTypeEnum.Staff]: 'Staff',
};

export const cecMemberTypeOptions = Object.values(CecMemberTypeEnum).map((memberType) => ({
    label: cecMemberTypeLabels[memberType],
    value: memberType,
}));

export const statusOptions = [
    { label: 'Published', value: StatusEnum.Published },
    { label: 'Draft', value: StatusEnum.Draft },
    { label: 'Archived', value: StatusEnum.Archived },
];

export const userTypeLabels: Record<UserTypeEnum, string> = {
    [UserTypeEnum.Admin]: 'Admin',
    [UserTypeEnum.Staff]: 'Staff',
    [UserTypeEnum.Viewer]: 'Viewer',
};

export const highlightedFilterOptions = [
    { label: 'Highlighted', value: 'true' },
    { label: 'Not Highlighted', value: 'false' },
];

export const errorMessage = 'Something went wrong. Please try again. ';

interface ServerError {
    field: string;
    messages: string | null;
    objectErrors?: ServerError[] | null;
    arrayErrors?: unknown[] | null;
}

export function transformToFormError(
    serverErrors: ServerError[],
): Record<string | symbol, unknown> {
    return serverErrors.reduce(
        (acc, { field, messages, objectErrors }) => {
            if (field === 'nonFieldErrors') {
                return { ...acc, [nonFieldError]: messages ?? '' };
            }
            if (objectErrors?.length) {
                return { ...acc, [field]: transformToFormError(objectErrors) };
            }
            return { ...acc, [field]: messages ?? '' };
        },
        {} as Record<string | symbol, unknown>,
    );
}

interface OperationInfoResult {
    __typename: 'OperationInfo';
    messages: { message: string }[];
}

interface MutationResponseResult {
    ok: boolean;
    errors?: unknown;
}

function collectFieldMessages(serverErrors: ServerError[]): string[] {
    return serverErrors.flatMap(({ messages, objectErrors }) => [
        ...(isTruthyString(messages) ? [messages] : []),
        ...(objectErrors?.length ? collectFieldMessages(objectErrors) : []),
    ]);
}

export function getMutationErrorMessage(
    result: object | null | undefined,
): string | undefined {
    if (isNotDefined(result)) {
        return errorMessage;
    }

    // eslint-disable-next-line no-underscore-dangle
    if ('__typename' in result && result.__typename === 'OperationInfo') {
        const { messages } = result as OperationInfoResult;
        const joined = (messages ?? [])
            .map((entry) => entry?.message)
            .filter(isTruthyString)
            .join(' ');
        return joined || errorMessage;
    }

    if ('ok' in result && !(result as MutationResponseResult).ok) {
        const { errors } = result as MutationResponseResult;
        const formError = Array.isArray(errors)
            ? transformToFormError(errors as ServerError[])
            : undefined;
        const nonField = formError?.[nonFieldError];
        if (typeof nonField === 'string' && nonField !== '') {
            return nonField;
        }
        const fieldMessages = Array.isArray(errors)
            ? collectFieldMessages(errors as ServerError[])
            : [];
        return fieldMessages.length > 0 ? fieldMessages.join(' ') : errorMessage;
    }

    return undefined;
}

export function resolveImageSrc(source: string) {
    if (source.startsWith('/')) {
        return `${api}${source}`;
    }
    return source;
}

export function getTodayDateString() {
    return encodeDate(new Date());
}

export function isDateExpired(expiryDate: string | null | undefined) {
    return isTruthyString(expiryDate) && expiryDate < getTodayDateString();
}

export function dateGreaterThanOrEqualCondition(x: string, message?: string) {
    return (value: string | null | undefined) => (
        isTruthyString(value) && value < x
            ? (message ?? `Select a date on or after ${x}.`)
            : undefined
    );
}

export function getExpiryMinDate(
    publishedDate: string | null | undefined,
    isEdit: boolean,
) {
    const today = isEdit ? undefined : getTodayDateString();
    if (!isTruthyString(publishedDate)) {
        return today;
    }
    if (isNotDefined(today) || publishedDate > today) {
        return publishedDate;
    }
    return today;
}

export function getExpiryDateValidations(
    publishedDate: string | null | undefined,
    isEdit: boolean,
) {
    return [
        ...(isTruthyString(publishedDate)
            ? [dateGreaterThanOrEqualCondition(
                publishedDate,
                'Expiry date must be on or after the published date.',
            )]
            : []),
        ...(isEdit
            ? []
            : [dateGreaterThanOrEqualCondition(
                getTodayDateString(),
                'Expiry date cannot be in the past.',
            )]),
    ];
}

export const ACCEPTED_FILE_TYPES = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xlsm';
export const ACCEPTED_IMAGE_TYPES = 'image/*';
export const BYTES_PER_MEGA_BYTE = 1024 * 1024;

// NOTE: Keep these in sync with the limits on the server (backend/utils/common.py)
export const MAX_IMAGE_FILE_SIZE_IN_MB = 4;
export const MAX_AUDIO_FILE_SIZE_IN_MB = 40;
export const MAX_FILE_SIZE_IN_MB = 30;
export const MAX_NEWS_ATTACHMENT_SIZE_IN_MB = 30;
export const MAX_FEATURED_KEY_STATS = 4;
export const MAX_NEWS_ATTACHMENTS = 50;
export const MAX_MARKDOWN_IMAGE_SIZE_IN_MB = 2;
export const ACCEPTED_MARKDOWN_IMAGE_FORMATS = ['jpg', 'jpeg', 'gif', 'png', 'bmp', 'webp', 'svg'];
