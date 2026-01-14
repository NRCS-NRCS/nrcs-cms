import { UploadFillIcon } from '@ifrc-go/icons';
import { RawFileInput } from '@ifrc-go/ui';

import styles from './styles.module.css';

interface Props {
    value?: File;
    onChange: (file?: File) => void;
    name?: string;
    accept?: string
}

function FileUpload(props: Props) {
    const {
        value,
        onChange,
        name,
        accept,
    } = props;

    return (
        <div className={styles.fileInput}>
            <div>
                <RawFileInput
                    name={name}
                    variant="secondary"
                    onChange={onChange}
                    accept={accept}
                >
                    <UploadFillIcon />
                    Upload
                </RawFileInput>
            </div>
            <p>
                {value?.name ? (
                    value.name
                ) : 'No document selected'}
            </p>
        </div>
    );
}

export default FileUpload;
