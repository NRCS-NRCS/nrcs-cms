import {
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import { type JobVacancyFilter } from '#generated/types/graphql';
import {
    archivedFilterOptions,
    labelSelector,
    valueSelector,
} from '#utils/common';

export interface VacancyFilterUIType extends Omit<JobVacancyFilter, 'isArchived'> {
    isArchived: string | undefined;
}

export interface Props {
    value: VacancyFilterUIType;
    onChange: (...args: EntriesAsList<VacancyFilterUIType>) => void;
}

function VacancyListFilter({ value, onChange }: Props) {
    return (
        <>
            <SelectInput
                name="isArchived"
                placeholder="Status"
                value={value.isArchived}
                onChange={onChange}
                options={archivedFilterOptions}
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

export default VacancyListFilter;
