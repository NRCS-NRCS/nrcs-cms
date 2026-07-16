import { TextInput } from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import { type UserFilter as UserFilterType } from '#generated/types/graphql';

export interface Props {
    value: UserFilterType;
    onChange: (...args: EntriesAsList<UserFilterType>) => void;
}

function UserFilter({ value, onChange }: Props) {
    return (
        <TextInput
            name="search"
            placeholder="Search by name or email"
            value={value.search}
            onChange={onChange}
        />
    );
}

export default UserFilter;
