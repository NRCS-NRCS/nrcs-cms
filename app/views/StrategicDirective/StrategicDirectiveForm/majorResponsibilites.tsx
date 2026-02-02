import { IoRemoveCircleOutline } from 'react-icons/io5';
import {
    Button,
    TextArea,
    TextInput,
} from '@ifrc-go/ui';
import { randomString } from '@togglecorp/fujs';
import {
    Error,
    getErrorObject,
    PartialForm,
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import { StrategicDirectivesCreateInput } from '#generated/types/graphql';

import styles from './styles.module.css';

type PartialFormType = PartialForm<StrategicDirectivesCreateInput>

type MajorResponsibilitiesType = NonNullable<NonNullable<PartialFormType['majorResponsibilities']>>[number] & {
    clientId: string
    id?: string
};

type PartialMajorResponsibilitiesType= PartialForm<MajorResponsibilitiesType, 'clientId'>
interface MajorResponsibilitiesInputProps {
    value: PartialMajorResponsibilitiesType;
    error: Error<MajorResponsibilitiesType> | undefined;
    onChange: (value: SetValueArg<PartialMajorResponsibilitiesType>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
}

const defaultActionLinkValue: PartialMajorResponsibilitiesType = { clientId: randomString() };

function MajorResponsibilities(props: MajorResponsibilitiesInputProps) {
    const {
        value,
        error: riskyError,
        onChange,
        onRemove,
        index,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultActionLinkValue);

    const error = getErrorObject(riskyError);

    return (
        <div key={index} className={styles.majorResponsibilities}>
            <div className={styles.majorResponsibilitiesHeader}>
                <TextInput
                    name="title"
                    value={value.title ?? ''}
                    placeholder="Title"
                    error={error?.title}
                    onChange={onFieldChange}
                />
                <Button
                    name={index}
                    onClick={onRemove}
                    colorVariant="secondary"
                    styleVariant="transparent"
                >
                    <IoRemoveCircleOutline />
                </Button>
            </div>
            <TextArea
                name="description"
                value={value.description ?? ''}
                error={error?.description}
                placeholder="Description"
                onChange={onFieldChange}
            />
        </div>
    );
}

export default MajorResponsibilities;
