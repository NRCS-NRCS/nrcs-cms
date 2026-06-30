import { TextInput } from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

export type FAQsFilterUIType = {
    search?: string | null;
};

export interface Props {
    value: FAQsFilterUIType;
    onChange: (...args: EntriesAsList<FAQsFilterUIType>) => void;
}

function FAQsListFilter({ value, onChange }: Props) {
    return (
        <TextInput
            name="search"
            placeholder="Search by question"
            value={value.search}
            onChange={onChange}
        />
    );
}

export default FAQsListFilter;
