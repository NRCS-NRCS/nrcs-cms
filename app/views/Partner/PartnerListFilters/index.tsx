import {
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import {
    PartnerFilter,
    PartnerScopeEnum,
} from '#generated/types/graphql';
import {
    labelSelector,
    scopeFilterOptions,
    valueSelector,
} from '#utils/common';

export interface PartnerFilterUIType extends Omit<PartnerFilter, 'scope'> {
    scope: PartnerScopeEnum | undefined;
}

export interface Props {
    value: PartnerFilterUIType;
    onChange: (...args: EntriesAsList<PartnerFilterUIType>) => void;
}

function PartnerListFilter({ value, onChange }: Props) {
    return (
        <>
            <SelectInput
                name="scope"
                placeholder="Scope"
                value={value.scope}
                onChange={onChange}
                options={scopeFilterOptions}
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

export default PartnerListFilter;
