import {
    Activity,
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import {
    Navigate,
    useParams,
} from 'react-router';
import {
    BlockLoading,
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
    getErrorString,
    type ObjectSchema,
    type PartialForm,
    removeNull,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import FileUpload from '#components/FileUpload';
import NonFieldError from '#components/NonFieldError';
import {
    type RadioProgramCreateInput,
    RadioProgramTypeEnum,
    type RadioProgramUpdateInput,
    useCreateRadioProgramMutation,
    useRadioProgramQuery,
    useUpdateRadioProgramMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import useUnsavedModal from '#hooks/useUnsavedModal';
import {
    errorMessage,
    keySelector,
    labelSelector,
} from '#utils/common';

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
    const navigate = useRouting();
    const { canEditContent } = usePermissions();
    const alert = useAlert();

    const [{ data, fetching: radioProgramDetailFetch }] = useRadioProgramQuery({
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
        pristine,
    } = useForm(RadioProgramSchema, { value: defaultEditFormValue });

    const {
        unsavedModal,
        bypassUnsavedModal,
    } = useUnsavedModal(!pristine);

    const error = getErrorObject(formError);

    const handleMutation = useCallback(async (mutationData: PartialFormType) => {
        const redirectPath = 'radioProgram';
        const alertMessage = `Radio Program ${id ? 'updated' : 'created'} successfully`;
        const { audioFile, ...otherMutationData } = mutationData;
        const dataToSubmit = {
            ...otherMutationData,
            audioFile: audioFile instanceof File ? audioFile : undefined,
        };
        if (id) {
            const res = await updateRadioProgramMutate({
                pk: id,
                data: dataToSubmit as RadioProgramUpdateInput,
            });
            const result = res.data?.updateRadioProgram;
            if (result?.ok) {
                bypassUnsavedModal();
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        } else {
            const res = await createRadioProgramMutate({
                data: dataToSubmit as RadioProgramCreateInput,
            });
            const result = res.data?.createRadioProgram;
            if (result?.ok) {
                bypassUnsavedModal();
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result?.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        }
    }, [
        alert,
        bypassUnsavedModal,
        createRadioProgramMutate,
        id,
        navigate,
        setError,
        updateRadioProgramMutate,
    ]);

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
        setValue(removeNull(radioProgramData));
    }, [radioProgramData, setValue]);

    const radioType = useMemo(() => Object.values(RadioProgramTypeEnum).map((status) => ({
        key: status,
        label: status,
    })), []);

    const handleCancelClick = useCallback(() => {
        navigate('radioProgram');
    }, [navigate]);

    if (!canEditContent) {
        return <Navigate to="/radio-programs" replace />;
    }

    if (radioProgramDetailFetch) {
        return (
            <BlockLoading
                withoutBorder
                compact
                message="Loading"
            />
        );
    }

    return (
        <Container
            withPadding
            heading={id ? 'RADIO PROGRAM DETAILS' : 'CREATE RADIO PROGRAM'}
            headerDescription={id ? 'Review and update the details of this radio program' : 'Fill in the details below to create a new radio program'}
            footer={(
                <ListView
                    withFullWidth
                    withCenteredContents
                    withBackground
                    withPadding
                >
                    <Button
                        name={undefined}
                        onClick={handleCancelClick}
                    >
                        Cancel
                    </Button>
                    <Button
                        name="save"
                        onClick={handleFormSubmit}
                        styleVariant="filled"
                    >
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </ListView>
            )}
        >
            <ListView layout="block">
                <NonFieldError
                    error={formError}
                    withFallbackError
                />
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
                        error={error?.title}
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
                        error={getErrorString(error?.audioFile)}
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
                        error={getErrorString(error?.publishedDate)}
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
            </ListView>
            {unsavedModal}
        </Container>
    );
}

export default RadioProgramForm;
