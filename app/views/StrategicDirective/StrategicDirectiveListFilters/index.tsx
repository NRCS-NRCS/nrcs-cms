import { TextInput } from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

export type StrategicDirectiveFilterUIType = {
    search?: string | null;
};

export interface Props {
    value: StrategicDirectiveFilterUIType;
    onChange: (...args: EntriesAsList<StrategicDirectiveFilterUIType>) => void;
}

function StrategicDirectiveListFilter({ value, onChange }: Props) {
    return (
        <TextInput
            name="search"
            placeholder="Search by title"
            value={value.search}
            onChange={onChange}
        />
    );
}

export default StrategicDirectiveListFilter;
