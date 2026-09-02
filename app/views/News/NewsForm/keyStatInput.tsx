import { IoRemoveCircleOutline } from 'react-icons/io5';
import {
    Button,
    Checkbox,
    ListView,
    NumberInput,
    TextInput,
} from '@ifrc-go/ui';
import { randomString } from '@togglecorp/fujs';
import {
    type Error,
    getErrorObject,
    type PartialForm,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import { type KeyStatType } from '#generated/types/graphql';

import styles from './styles.module.css';

export interface KeyStatFormValue extends KeyStatType {
    clientId: string;
}

export type PartialKeyStatForm = PartialForm<KeyStatFormValue, 'clientId'>;

interface Props {
    value: PartialKeyStatForm;
    error: Error<KeyStatFormValue> | undefined;
    onChange: (value: SetValueArg<PartialKeyStatForm>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
}

const defaultKeyStatValue: PartialKeyStatForm = { clientId: randomString() };

function KeyStatInput(props: Props) {
    const {
        value,
        error: riskyError,
        onChange,
        onRemove,
        index,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultKeyStatValue);

    const error = getErrorObject(riskyError);

    return (
        <ListView className={styles.keyStatRow} withWrap>
            <TextInput
                name="title"
                value={value.title ?? ''}
                placeholder="Title"
                error={error?.title}
                onChange={onFieldChange}
            />
            <NumberInput
                name="stat"
                value={value.stat}
                placeholder="Value"
                error={error?.stat}
                onChange={onFieldChange}
            />
            <Checkbox
                name="featured"
                label="Featured"
                value={value.featured ?? false}
                error={error?.featured}
                onChange={onFieldChange}
            />
            <Button
                name={index}
                onClick={onRemove}
                colorVariant="secondary"
                styleVariant="action"
            >
                <IoRemoveCircleOutline />
            </Button>
        </ListView>
    );
}

export default KeyStatInput;
