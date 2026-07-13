import { TextInput } from '@ifrc-go/ui';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import { type ProjectFilter } from '#generated/types/graphql';

export type ProjectFilterUIType = ProjectFilter;

export interface Props {
    value: ProjectFilterUIType;
    onChange: (...args: EntriesAsList<ProjectFilterUIType>) => void;
}

function ProjectListFilter({ value, onChange }: Props) {
    return (
        <TextInput
            name="search"
            placeholder="Search by title"
            value={value.search}
            onChange={onChange}
        />
    );
}

export default ProjectListFilter;
