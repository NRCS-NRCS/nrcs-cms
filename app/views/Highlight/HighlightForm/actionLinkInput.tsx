import { IoRemoveCircleOutline } from 'react-icons/io5';
import {
    Button,
    ListView,
    TextInput,
} from '@ifrc-go/ui';
import {
    Error,
    getErrorObject,
    PartialForm,
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import { ActionLinkType } from '#generated/types/graphql';

import styles from './styles.module.css';

interface ActionLinkFormValue extends ActionLinkType {
    clientId: string;
}

interface ActionInputProps {
    value: PartialForm<ActionLinkFormValue>;
    error: Error<ActionLinkFormValue> | undefined;
    onChange: (value: SetValueArg<PartialForm<ActionLinkFormValue>>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;

}

const defaultActionLinkValue: PartialForm<ActionLinkFormValue> = { clientId: '' };

function ActionLinkInputComponent(props: ActionInputProps) {
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
        <ListView key={index} className={styles.actionLinkRow} withWrap>
            <TextInput
                name="url"
                value={value.url ?? ''}
                placeholder="URL"
                error={error?.url as string}
                onChange={onFieldChange}
            />
            <TextInput
                name="label"
                value={value.label ?? ''}
                error={error?.label as string}
                placeholder="Label"
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

export default ActionLinkInputComponent;
