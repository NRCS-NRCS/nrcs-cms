import {
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import { type CecMemberTypeEnum } from '#generated/types/graphql';
import {
    cecMemberTypeOptions,
    labelSelector,
    valueSelector,
} from '#utils/common';

export interface CecMemberFilterUIType {
    memberType: CecMemberTypeEnum | undefined;
    search: string | undefined;
}

export interface Props {
    value: CecMemberFilterUIType;
    onChange: (...args: EntriesAsList<CecMemberFilterUIType>) => void;
}

function CecMemberListFilter({ value, onChange }: Props) {
    return (
        <>
            <SelectInput
                name="memberType"
                placeholder="Member type"
                value={value.memberType}
                onChange={onChange}
                options={cecMemberTypeOptions}
                keySelector={valueSelector}
                labelSelector={labelSelector}
            />
            <TextInput
                name="search"
                placeholder="Search by name or designation"
                value={value.search}
                onChange={onChange}
            />
        </>
    );
}

export default CecMemberListFilter;
