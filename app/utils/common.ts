import { nonFieldError } from '@togglecorp/toggle-form';

import {
    PartnerScopeEnum,
    RadioProgramTypeEnum,
    ResourceTypeEnum,
    StatusEnum,
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

export const statusFilterOptions = [
    { label: 'Active', value: 'true' },
    { label: 'Inactive', value: 'false' },
];

export const archivedFilterOptions = [
    { label: 'Active', value: 'false' },
    { label: 'Archived', value: 'true' },
];

export const typeFilterOptions = [
    { label: 'Policy and Guidelines', value: ResourceTypeEnum.PolicyAndGuidelines },
    { label: 'Report', value: ResourceTypeEnum.Report },
];

export const typeRadioFilterOptions = [
    { label: 'Radio Red Cross', value: RadioProgramTypeEnum.RadioRedCross },
    { label: 'Together For Humanity', value: RadioProgramTypeEnum.TogetherForHumanity },
];

export const scopeFilterOptions = [
    { label: 'Global', value: PartnerScopeEnum.Global },
    { label: 'Local', value: PartnerScopeEnum.Local },
];

export const statusOptions = [
    { label: 'Published', value: StatusEnum.Published },
    { label: 'Draft', value: StatusEnum.Draft },
    { label: 'Archived', value: StatusEnum.Archived },
];

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
