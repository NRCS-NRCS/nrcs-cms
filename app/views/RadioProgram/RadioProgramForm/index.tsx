import {
    Activity,
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import {
    useNavigate,
    useParams,
} from 'react-router';
import {
    Button,
    Container,
    DateInput,
    Heading,
    InputSection,
    ListView,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { isNotDefined } from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    ObjectSchema,
    PartialForm,
    removeNull,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import FileUpload from '#components/FileUpload';
import {
    RadioProgramCreateInput,
    RadioProgramTypeEnum,
    RadioProgramUpdateInput,
    useCreateRadioProgramMutation,
    useRadioProgramQuery,
    useUpdateRadioProgramMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import {
    errorMessage,
    keySelector,
    labelSelector,
} from '#utils/common';
import urlToFile from '#utils/urlToFile';

type PartialFormType = PartialForm<RadioProgramCreateInput>

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const RadioProgramSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        publishedDate: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        type: {
            required: true,
        },
        audioFile: {
            required: true,
        },
    }),
};

const defaultEditFormValue: PartialFormType = {};
function RadioProgramForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const alert = useAlert();

    const [{ data }] = useRadioProgramQuery({
        variables: {
            filter: { id },
        },
        pause: !id,
    });

    const [{ fetching: createPending }, createRadioProgramMutate] = useCreateRadioProgramMutation();
    const [{ fetching: updatePending }, updateRadioProgramMutate] = useUpdateRadioProgramMutation();
    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
        setValue,
    } = useForm(RadioProgramSchema, { value: defaultEditFormValue });

    const error = getErrorObject(formError);

    const handleMutation = useCallback(async (mutationData: PartialFormType) => {
        const redirectPath = '/radio-programs';
        const alertMessage = `Radio Program ${id ? 'updated' : 'created'} successfully`;
        if (id) {
            const res = await updateRadioProgramMutate({
                pk: id,
                data: mutationData as RadioProgramUpdateInput,
            });
            const result = res.data?.updateRadioProgram;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        } else {
            const res = await createRadioProgramMutate({
                data: mutationData as RadioProgramCreateInput,
            });
            const result = res.data?.createRadioProgram;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result?.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        }
    }, [alert, createRadioProgramMutate, id, navigate, setError, updateRadioProgramMutate]);

    const handleFormSubmit = useCallback(
        () => createSubmitHandler(
            validate,
            setError,
            handleMutation,
        )(),
        [validate, setError, handleMutation],
    );

    const radioProgramData = data?.radioProgram.results[0];

    useEffect(() => {
        if (isNotDefined(radioProgramData)) {
            return;
        }
        const {
            audioFile,
            ...other
        } = removeNull(radioProgramData);
        setValue({
            ...other,
        });
        if (audioFile) {
            urlToFile(audioFile.url, audioFile.name).then((audioFileData) => {
                setValue((prev) => ({
                    ...prev,
                    audioFile: audioFileData,
                }));
            });
        }
    }, [radioProgramData, setValue]);

    const radioType = useMemo(() => Object.values(RadioProgramTypeEnum).map((status) => ({
        key: status,
        label: status,
    })), []);

    return (
        <Container withPadding>
            <ListView layout="block">
                <InputSection withoutTitleSection>
                    <Heading level={4}>
                        {id ? 'RADIO PROGRAM DETAILS' : 'CREATE RADIO PROGRAM'}
                    </Heading>
                </InputSection>
                <Activity mode={radioProgramData?.createdBy && radioProgramData?.modifiedBy ? 'visible' : 'hidden'}>
                    <InputSection
                        title={`Created by: ${radioProgramData?.createdBy.firstName} ${radioProgramData?.createdBy.lastName}`}
                    >
                        <Heading level={6}>
                            Modified by:
                            {' '}
                            {radioProgramData?.modifiedBy.firstName}
                            {' '}
                            {radioProgramData?.modifiedBy.lastName}
                        </Heading>
                    </InputSection>
                </Activity>
                <InputSection
                    title="Title"
                    description="Enter the Title"
                    withAsteriskOnTitle
                >
                    <TextInput
                        name="title"
                        value={value.title}
                        error={error?.title as string}
                        onChange={setFieldValue}
                        placeholder="title"
                        autoFocus
                    />
                </InputSection>
                <InputSection
                    title="Audio File"
                    description="Add a Audio, which will be attached and shown on Radio Page"
                    withAsteriskOnTitle
                >
                    <FileUpload
                        name="audioFile"
                        onChange={setFieldValue}
                        accept="audio/*"
                        value={value.audioFile}
                        error={error?.audioFile as string}
                    />
                </InputSection>
                <InputSection
                    title="Published Date"
                    description="This date should be the Published Date of the RadioProgram"
                    withAsteriskOnTitle
                >
                    <DateInput
                        name="publishedDate"
                        value={value.publishedDate}
                        onChange={setFieldValue}
                        placeholder="Select Date"
                        error={error?.publishedDate as string}
                    />
                </InputSection>
                <InputSection
                    title="Type"
                    description="Add type to either Tuesday Program or Radio Red Cross"
                    withAsteriskOnTitle
                >
                    <SelectInput
                        name="type"
                        options={radioType}
                        value={value.type}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        onChange={setFieldValue}
                        placeholder="Select Status"
                        error={error?.type}
                    />
                </InputSection>
                <ListView withPadding withBackground withCenteredContents>
                    <Button name="save" onClick={handleFormSubmit}>
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </ListView>
            </ListView>
        </Container>
    );
}

export default RadioProgramForm;
