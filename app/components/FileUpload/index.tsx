import { Activity } from 'react';
import { UploadFillIcon } from '@ifrc-go/icons';
import {
    InputError,
    RawFileInput,
} from '@ifrc-go/ui';

import styles from './styles.module.css';

interface Props {
    value?: File;
    onChange: (file?: File) => void;
    name?: string;
    accept?: string
    error?: string;
}

function FileUpload(props: Props) {
    const {
        value,
        onChange,
        name,
        accept,
        error,
    } = props;

    return (
        <div className={styles.fileInput}>
            <div className={styles.inputSection}>
                <RawFileInput
                    name={name}
                    variant="secondary"
                    onChange={onChange}
                    accept={accept}
                >
                    <UploadFillIcon />
                    Upload
                </RawFileInput>
                <p>
                    {value?.name ? (
                        value.name
                    ) : 'No document selected'}
                </p>
            </div>
            <Activity mode={error ? 'visible' : 'hidden'}>
                <InputError>
                    {error}
                </InputError>
            </Activity>
        </div>
    );
}

export default FileUpload;
