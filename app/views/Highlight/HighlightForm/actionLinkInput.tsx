import { IoRemoveCircleOutline } from 'react-icons/io5';
import {
    Button,
    ListView,
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

import { ActionLinkType } from '#generated/types/graphql';

import styles from './styles.module.css';

interface ActionLinkFormValue extends ActionLinkType {
    clientId: string;
}

type PartialActionLinkForm = PartialForm<ActionLinkFormValue, 'clientId'>;

interface ActionInputProps {
    value: PartialActionLinkForm;
    error: Error<ActionLinkFormValue> | undefined;
    onChange: (value: SetValueArg<PartialActionLinkForm>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;

}

const defaultActionLinkValue: PartialActionLinkForm = { clientId: randomString() };

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
                error={error?.url}
                onChange={onFieldChange}
            />
            <TextInput
                name="label"
                value={value.label ?? ''}
                error={error?.label}
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
