import { DeleteBinLineIcon } from '@ifrc-go/icons';
import {
    IconButton,
    ListView,
    TextInput,
} from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';
import {
    type Error,
    getErrorObject,
    type PartialForm,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import { type DjangoFileType } from '#generated/types/graphql';
import { BYTES_PER_MEGA_BYTE } from '#utils/common';

import styles from './styles.module.css';

export interface AttachmentFormValue {
    clientId: string;
    id?: string;
    label?: string;
    order?: number;
    file?: File | DjangoFileType;
}

export type PartialAttachmentForm = PartialForm<AttachmentFormValue, 'clientId' | 'file'>;

function getFileName(file: File | DjangoFileType | undefined) {
    if (!isDefined(file)) {
        return 'No file';
    }
    return file.name;
}

function getFileSize(file: File | DjangoFileType | undefined) {
    if (!isDefined(file)) {
        return undefined;
    }
    return `${(file.size / BYTES_PER_MEGA_BYTE).toFixed(2)} MB`;
}

interface Props {
    value: PartialAttachmentForm;
    error: Error<AttachmentFormValue> | undefined;
    onChange: (value: SetValueArg<PartialAttachmentForm>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
}

const defaultAttachmentValue: PartialAttachmentForm = { clientId: '' };

function AttachmentInput(props: Props) {
    const {
        value,
        error: riskyError,
        onChange,
        onRemove,
        index,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultAttachmentValue);

    const error = getErrorObject(riskyError);
    const size = getFileSize(value.file);

    return (
        <div className={styles.attachmentCard}>
            <ListView
                className={styles.attachmentCardHeader}
                spacing="xs"
                withWrap
            >
                <div className={styles.attachmentFileName}>
                    {getFileName(value.file)}
                </div>
                {isDefined(size) && (
                    <div className={styles.attachmentFileSize}>
                        {size}
                    </div>
                )}
                <IconButton
                    name={index}
                    onClick={onRemove}
                    title="Remove attachment"
                    ariaLabel="Remove attachment"
                    spacing="none"
                >
                    <DeleteBinLineIcon />
                </IconButton>
            </ListView>
            <TextInput
                name="label"
                value={value.label ?? ''}
                placeholder="Label shown to readers (optional)"
                error={error?.label}
                onChange={onFieldChange}
            />
        </div>
    );
}

export default AttachmentInput;
