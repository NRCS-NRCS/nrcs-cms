import {
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import {
    type BlogFilter,
    type StatusEnum,
} from '#generated/types/graphql';
import {
    labelSelector,
    statusOptions,
    valueSelector,
} from '#utils/common';

export interface BlogFilterUIType extends Omit<BlogFilter, 'status'> {
    status: StatusEnum | undefined;
}

export interface Props {
    value: BlogFilterUIType;
    onChange: (...args: EntriesAsList<BlogFilterUIType>) => void;
}

function BlogListFilter({ value, onChange }: Props) {
    return (
        <>
            <SelectInput
                name="status"
                placeholder="Status"
                value={value.status}
                onChange={onChange}
                options={statusOptions}
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

export default BlogListFilter;
