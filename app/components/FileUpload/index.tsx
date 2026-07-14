import {
    Activity,
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import {
    DeleteBinLineIcon,
    UploadFillIcon,
} from '@ifrc-go/icons';
import {
    IconButton,
    Image,
    InputError,
    ListView,
    RawFileInput,
    type SingleRawFileInputProps,
} from '@ifrc-go/ui';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { type DjangoFileType } from '#generated/types/graphql';

const IMAGE_EXTENSION_REGEX = /\.(jpe?g|png|gif|webp|svg|bmp)$/i;

function isImageFile(file: File | DjangoFileType) {
    if (file instanceof File) {
        return file.type.startsWith('image/');
    }
    return IMAGE_EXTENSION_REGEX.test(file.name);
}

interface Props<NAME> {
    name: NAME;
    label?: string;
    value?: File | DjangoFileType;
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

    const objectUrl = useMemo(() => {
        if (value instanceof File && isImageFile(value)) {
            return URL.createObjectURL(value);
        }
        return undefined;
    }, [value]);

    useEffect(
        () => () => {
            if (isDefined(objectUrl)) {
                URL.revokeObjectURL(objectUrl);
            }
        },
        [objectUrl],
    );

    let previewUrl: string | undefined;
    if (value instanceof File) {
        previewUrl = objectUrl;
    } else if (isDefined(value) && isImageFile(value)) {
        previewUrl = value.url ?? undefined;
    }

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
                    {value?.name ?? 'No document selected'}
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
            <Activity mode={isDefined(previewUrl) ? 'visible' : 'hidden'}>
                <Image
                    src={previewUrl}
                    alt={value?.name ?? 'Preview'}
                    withContainedFit
                    size="lg"
                />
            </Activity>
            <Activity mode={error ? 'visible' : 'hidden'}>
                <InputError>
                    {error}
                </InputError>
            </Activity>
        </>
    );
}

export default FileUpload;
