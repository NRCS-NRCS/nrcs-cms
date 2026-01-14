import {
    useCallback,
    useEffect,
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
    RawFileInput,
    SelectInput,
    TextArea,
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
import urlToFile from '#utils/urlToFile';

import styles from './styles.module.css';

type RadioProgramListItem = NonNullable<RadioProgramQuery['radioProgram']>['results'][number];

type PartialFormType = PartialForm<RadioProgramCreateInput> &
{ createdBy: string, modifiedBy: string }

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const EditBlogSchema: FormSchema = {
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
    } = useForm(EditBlogSchema, { value: defaultEditFormValue });

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
                    } else if (res.data?.updateRadioProgram.errors) {
                        setError(res.data.updateRadioProgram.errors);
                    }
                } else {
                    const res = await createRadioProgramMutate({
                        data: mutateData,
                    });

                    if (res.data?.createRadioProgram.ok) {
                        navigate('/radio-programs');
                    } else if (res.data?.createRadioProgram?.errors) {
                        setError(res.data.createRadioProgram.errors);
                    }
                }
            },
        );
        handler();
    }, [setError, validate, id, createRadioProgramMutate, updateRadioProgramMutate, navigate]);

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
    const radioType = Object.values(RadioProgramTypeEnum).map((status) => ({
        value: status,
        label: status,
    }));
    return (
        <Page>
            <Container
                className={styles.container}
                childrenContainerClassName={styles.containerChild}
            >
                <FormSection headingLevel={3} label="RadioProgram Detail" />
                {(value.createdBy && value.modifiedBy) && (
                    <FormSection inputClassName={styles.inputClassName}>
                        <div>
                            <Heading level={6}>Created by:</Heading>
                            <Heading level={6}>{value.createdBy}</Heading>
                        </div>
                        <div>
                            <Heading level={6}>Modified by:</Heading>
                            <Heading level={6}>{value.createdBy}</Heading>
                        </div>
                    </FormSection>
                )}
                <FormSection label="Title*" description="Enter the Title">
                    <TextInput
                        name="title"
                        value={value.title}
                        error={error?.title as string}
                        onChange={setFieldValue}
                    />
                </FormSection>
                <FormSection label="Audio File*" description="Add a Audio, which will be attached and shown on Radio Page">
                    <RawFileInput
                        name="audioFile"
                        onChange={(files) => setFieldValue(files, 'audioFile')}
                        variant="secondary"
                        accept="audio/*"
                    >
                        Upload
                    </RawFileInput>
                    {value.audioFile?.name && <p>{value.audioFile.name}</p>}
                </FormSection>
                <FormSection label="Published Date*" description="This date should be the Published Date of the RadioProgram">
                    <DateInput
                        name="publishedDate"
                        value={value.publishedDate}
                        onChange={setFieldValue}
                        placeholder="Select Date"
                        error={error?.publishedDate as string}
                    />
                </FormSection>
                <FormSection label="Type*" description="Add type to either Tuesday Program or Radio Red Cross">
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
                <div className={styles.submitBtn}>
                    <Button name="save" onClick={handleFormSubmit} variant="primary">
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </div>
            </Container>
        </Page>
    );
}

export default RadioProgramForm;
