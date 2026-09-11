import {
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import { nonFieldError } from '@togglecorp/toggle-form';

import {
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
        return typeof nonField === 'string' && nonField !== '' ? nonField : errorMessage;
    }

    return undefined;
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
