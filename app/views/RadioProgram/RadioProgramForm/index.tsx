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
    DateInput,
    Heading,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import {
    createSubmitHandler,
    getErrorObject,
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import ContainerWrapper from '#components/ContainerWrapper';
import FileUpload from '#components/FileUpload';
import FormSection from '#components/FormSection';
import Page from '#components/Page';
import {
    RadioProgramCreateInput,
    RadioProgramQuery,
    RadioProgramTypeEnum,
    useCreateRadioProgramMutation,
    useRadioProgramQuery,
    useUpdateRadioProgramMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import urlToFile from '#utils/urlToFile';

type RadioProgramListItem = NonNullable<RadioProgramQuery['radioProgram']>['results'][number];

type PartialFormType = PartialForm<RadioProgramCreateInput> &
{ createdBy: string, modifiedBy: string }

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
        createdBy: {},
        modifiedBy: {},

    }),
};

const defaultEditFormValue: PartialFormType = {
    createdBy: '',
    modifiedBy: '',
};
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
    } = useForm(RadioProgramSchema, { value: defaultEditFormValue });

    const error = getErrorObject(formError);

    const handleFormSubmit = useCallback(() => {
        const handler = createSubmitHandler(
            validate,
            setError,
            async (val) => {
                const mutateData = {
                    audioFile: val.audioFile ?? null,
                    title: val.title ?? '',
                    publishedDate: val.publishedDate,
                    type: val.type,

                };
                if (id) {
                    const res = await updateRadioProgramMutate({
                        pk: id,
                        data: mutateData,
                    });
                    if (res.data?.updateRadioProgram?.ok) {
                        navigate('/radio-programs');
                        alert.show('Radio Program updated successfully', { variant: 'success' });
                    } else if (res.data?.updateRadioProgram.errors) {
                        const errorMessages = res.data?.updateRadioProgram?.errors;
                        alert.show(errorMessages, { variant: 'danger' });
                        setError(errorMessages);
                    }
                } else {
                    const res = await createRadioProgramMutate({
                        data: mutateData,
                    });

                    if (res.data?.createRadioProgram.ok) {
                        navigate('/radio-programs');
                        alert.show('Radio Program created successfully', { variant: 'success' });
                    } else if (res.data?.createRadioProgram?.errors) {
                        const errorMessages = res.data?.createRadioProgram?.errors;
                        alert.show(errorMessages, { variant: 'danger' });
                        setError(errorMessages);
                    }
                }
            },
        );
        handler();
    }, [setError, alert,
        validate, id, createRadioProgramMutate, updateRadioProgramMutate, navigate]);

    useEffect(() => {
        if (data?.radioProgram) {
            const radioProgram = data.radioProgram.results[0] as unknown as RadioProgramListItem;
            if (radioProgram.audioFile) {
                urlToFile(radioProgram?.audioFile?.url, radioProgram?.audioFile?.name)
                    .then((file) => {
                        setFieldValue(file, 'audioFile');
                    });
            }
            setFieldValue(radioProgram?.title, 'title');
            setFieldValue(radioProgram?.type, 'type');
            setFieldValue(radioProgram?.publishedDate, 'publishedDate');
            setFieldValue(`${radioProgram.modifiedBy?.firstName} ${radioProgram.modifiedBy?.lastName}`, 'modifiedBy');
            setFieldValue(`${radioProgram.createdBy?.firstName} ${radioProgram.createdBy?.lastName}`, 'createdBy');
        }
    }, [data, setFieldValue]);

    const radioType = useMemo(() => Object.values(RadioProgramTypeEnum).map((status) => ({
        value: status,
        label: status,
    })), []);
    return (
        <Page>
            <ContainerWrapper>
                <FormSection headingLevel={3} label="RADIO PROGRAM DETAILS" />
                <Activity mode={value.createdBy && value.modifiedBy ? 'visible' : 'hidden'}>
                    <FormSection>
                        <Heading level={6}>
                            Created by:
                            {' '}
                            {value.createdBy}
                        </Heading>
                        <Heading level={6}>
                            Modified by:
                            {' '}
                            {value.createdBy}
                        </Heading>
                    </FormSection>
                </Activity>
                <FormSection label="Title" description="Enter the Title" withAsteriskOnTitle>
                    <TextInput
                        name="title"
                        value={value.title}
                        error={error?.title as string}
                        onChange={setFieldValue}
                        placeholder="title"
                        autoFocus
                    />
                </FormSection>
                <FormSection label="Audio File" description="Add a Audio, which will be attached and shown on Radio Page" withAsteriskOnTitle>
                    <FileUpload
                        name="audioFile"
                        onChange={(files) => setFieldValue(files, 'audioFile')}
                        accept="audio/*"
                        value={value.audioFile}
                        error={error?.audioFile as string}
                    />
                </FormSection>
                <FormSection label="Published Date" description="This date should be the Published Date of the RadioProgram" withAsteriskOnTitle>
                    <DateInput
                        name="publishedDate"
                        value={value.publishedDate}
                        onChange={setFieldValue}
                        placeholder="Select Date"
                        error={error?.publishedDate as string}
                    />
                </FormSection>
                <FormSection label="Type" description="Add type to either Tuesday Program or Radio Red Cross" withAsteriskOnTitle>
                    <SelectInput
                        name="type"
                        options={radioType}
                        value={value.type}
                        keySelector={(o) => o.label}
                        labelSelector={(o) => o.value}
                        onChange={setFieldValue}
                        placeholder="Select Status"
                        error={error?.type}
                    />
                </FormSection>
                <FormSection>
                    <Button name="save" onClick={handleFormSubmit} variant="primary">
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </FormSection>
            </ContainerWrapper>
        </Page>
    );
}

export default RadioProgramForm;
