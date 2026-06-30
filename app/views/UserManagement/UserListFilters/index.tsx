import {
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import { UserFilter as UserFilterType } from '#generated/types/graphql';
import {
    labelSelector,
    statusFilterOptions,
    valueSelector,
} from '#utils/common';

interface UsersFilterType extends Omit<UserFilterType, 'isActive'> {
    isActive: string | undefined;
}

export interface Props {
    value: UsersFilterType;
    onChange: (...args: EntriesAsList<UsersFilterType>) => void;
}

function UserFilter({ value, onChange }: Props) {
    return (
        <>
            <SelectInput
                name="isActive"
                placeholder="Status"
                value={value.isActive}
                onChange={onChange}
                options={statusFilterOptions}
                keySelector={valueSelector}
                labelSelector={labelSelector}
            />
            <TextInput
                name="search"
                placeholder="Search by name or email"
                value={value.search}
                onChange={onChange}
            />
        </>
    );
}

export default UserFilter;
