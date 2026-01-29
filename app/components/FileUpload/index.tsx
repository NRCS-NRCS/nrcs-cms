import {
    Activity,
    useCallback,
} from 'react';
import {
    DeleteBinLineIcon,
    UploadFillIcon,
} from '@ifrc-go/icons';
import {
    IconButton,
    InputError,
    ListView,
    RawFileInput,
    SingleRawFileInputProps,
} from '@ifrc-go/ui';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

interface Props<NAME> {
    name: NAME;
    label?: string;
    value?: File;
    accept?: string;
    error?: string;
    onChange: (value: File | undefined, name: NAME) => void;
}

function FileUpload<const NAME>(props: Props<NAME>) {
    const {
        value,
        onChange,
        name,
        accept,
        error,
        label = 'Upload',
    } = props;

    const handleClearButtonClick = useCallback(() => {
        onChange(undefined, name);
    }, [onChange, name]);

    const handleChange = useCallback<SingleRawFileInputProps<NAME>['onChange']>((file) => {
        if (isNotDefined(file)) {
            return;
        }
        onChange(file, name);
    }, [onChange, name]);

    return (
        <>
            <ListView withWrap spacing="sm" spacingOffset={-2}>
                <RawFileInput
                    name={name}
                    onChange={handleChange}
                    accept={accept}
                    allowFullScreen
                    colorVariant="primary"
                    styleVariant="outline"
                    before={<UploadFillIcon />}
                >
                    {label}
                </RawFileInput>
                <p>
                    {value?.name ? (
                        value.name
                    ) : 'No document selected'}
                </p>
                <Activity mode={isDefined(value) ? 'visible' : 'hidden'}>
                    <IconButton
                        name={undefined}
                        onClick={handleClearButtonClick}
                        title="Clear"
                        ariaLabel="clear"
                        spacing="none"
                    >
                        <DeleteBinLineIcon />
                    </IconButton>
                </Activity>
            </ListView>
            <Activity mode={error ? 'visible' : 'hidden'}>
                <InputError>
                    {error}
                </InputError>
            </Activity>
        </>
    );
}

export default FileUpload;
