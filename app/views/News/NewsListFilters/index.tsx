import {
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import { type NewsFilter } from '#generated/types/graphql';
import {
    labelSelector,
    statusOptions,
    valueSelector,
} from '#utils/common';

export interface Props {
    value: NewsFilter;
    onChange: (...args: EntriesAsList<NewsFilter>) => void;
}

function NewsListFilter({ value, onChange }: Props) {
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

export default NewsListFilter;
