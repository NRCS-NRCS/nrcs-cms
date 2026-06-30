import {
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import { RadioProgramFilter } from '#generated/types/graphql';
import {
    labelSelector,
    typeRadioFilterOptions,
    valueSelector,
} from '#utils/common';

export type RadioProgramFilterUIType = RadioProgramFilter;

export interface Props {
    value: RadioProgramFilterUIType;
    onChange: (...args: EntriesAsList<RadioProgramFilterUIType>) => void;
}

function RadioProgramListFilter({ value, onChange }: Props) {
    return (
        <>
            <SelectInput
                name="type"
                placeholder="Type"
                value={value.type}
                onChange={onChange}
                options={typeRadioFilterOptions}
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

export default RadioProgramListFilter;
