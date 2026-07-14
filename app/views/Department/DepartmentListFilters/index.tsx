import { TextInput } from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

export type DepartmentFilterUIType = {
    search?: string | null;
};

export interface Props {
    value: DepartmentFilterUIType;
    onChange: (...args: EntriesAsList<DepartmentFilterUIType>) => void;
}

function DepartmentListFilter({ value, onChange }: Props) {
    return (
        <TextInput
            name="search"
            placeholder="Search by title"
            value={value.search}
            onChange={onChange}
        />
    );
}

export default DepartmentListFilter;
