import {
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import { NewsFilter } from '#generated/types/graphql';
import {
    highlightedFilterOptions,
    labelSelector,
    statusOptions,
    valueSelector,
} from '#utils/common';

export interface NewsFilterUIType extends Omit<NewsFilter, 'isHighlighted'> {
    isHighlighted: string | undefined;
}

export interface Props {
    value: NewsFilterUIType;
    onChange: (...args: EntriesAsList<NewsFilterUIType>) => void;
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
            <SelectInput
                name="isHighlighted"
                placeholder="Highlighted"
                value={value.isHighlighted}
                onChange={onChange}
                options={highlightedFilterOptions}
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
