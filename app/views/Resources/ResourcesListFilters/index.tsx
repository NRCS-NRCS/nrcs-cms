import {
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import { ResourceFilter } from '#generated/types/graphql';
import {
    labelSelector,
    typeFilterOptions,
    valueSelector,
} from '#utils/common';

export type ResourceFilterUIType = ResourceFilter;

export interface Props {
    value: ResourceFilterUIType;
    onChange: (...args: EntriesAsList<ResourceFilterUIType>) => void;
}

function ResourcesListFilter({ value, onChange }: Props) {
    return (
        <>
            <SelectInput
                name="type"
                placeholder="Type"
                value={value.type}
                onChange={onChange}
                options={typeFilterOptions}
                keySelector={valueSelector}
                labelSelector={labelSelector}
            />
            <TextInput
                name="search"
                placeholder="Search by title"
                value={value.search}
                onChange={onChange}
            />
        </>
    );
}

export default ResourcesListFilter;
