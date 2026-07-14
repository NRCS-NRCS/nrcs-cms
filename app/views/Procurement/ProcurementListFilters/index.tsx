import { TextInput } from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

export type ProcurementFilterUIType = {
    search?: string | null;
};

export interface Props {
    value: ProcurementFilterUIType;
    onChange: (...args: EntriesAsList<ProcurementFilterUIType>) => void;
}

function ProcurementListFilter({ value, onChange }: Props) {
    return (
        <TextInput
            name="search"
            placeholder="Search by title"
            value={value.search}
            onChange={onChange}
        />
    );
}

export default ProcurementListFilter;
