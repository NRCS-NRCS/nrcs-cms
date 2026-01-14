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
    ProcurementCreateInput,
    useCreateProcurementMutation,
    useProcurementDetailQuery,
    useUpdateProcurementMutation,
} from '#generated/types/graphql';
import urlToFile from '#utils/urlToFile';

import styles from './styles.module.css';

type PartialFormType = PartialForm<ProcurementCreateInput> &
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
        expiryDate: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        description: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        file: {
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
function ProcurementForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [{ data }] = useProcurementDetailQuery({
        variables: { id: id || '' }, pause: !id,
    });
    const [{ fetching: createPending }, createProcurementMutate] = useCreateProcurementMutation();
    const [{ fetching: updatePending }, updateProcurementMutate] = useUpdateProcurementMutation();
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
                    file: val.file ?? null,
                    title: val.title ?? '',
                    description: val.description ?? '',
                    expiryDate: val.expiryDate,
                    publishedDate: val.publishedDate,

                };
                if (id) {
                    const res = await updateProcurementMutate({
                        pk: id,
                        data: mutateData,
                    });
                    if (res.data?.updateProcurement?.ok) {
                        navigate('/procurements');
                    } else if (res.data?.updateProcurement.errors) {
                        setError(res.data.updateProcurement.errors);
                    }
                } else {
                    const res = await createProcurementMutate({
                        data: mutateData,
                    });

                    if (res.data?.createProcurement.ok) {
                        navigate('/procurements');
                    } else if (res.data?.createProcurement?.errors) {
                        setError(res.data.createProcurement.errors);
                    }
                }
            },
        );
        handler();
    }, [setError, validate, id, createProcurementMutate, updateProcurementMutate, navigate]);

    useEffect(() => {
        if (data?.procurement) {
            const { procurement } = data;
            if (procurement.file) {
                urlToFile(procurement.file.url, procurement.file.name)
                    .then((file) => {
                        setFieldValue(file, 'file');
                    });
            }
            setFieldValue(procurement.title, 'title');
            setFieldValue(procurement.description, 'description');
            setFieldValue(procurement.expiryDate, 'expiryDate');
            setFieldValue(procurement.publishedDate, 'publishedDate');
            setFieldValue(`${procurement.modifiedBy.firstName} ${procurement.modifiedBy.lastName}`, 'modifiedBy');
            setFieldValue(`${procurement.createdBy.firstName} ${procurement.createdBy.lastName}`, 'createdBy');
        }
    }, [data, setFieldValue]);

    return (
        <Page>
            <Container
                className={styles.container}
                childrenContainerClassName={styles.containerChild}
            >
                <FormSection headingLevel={3} label="Procurement Detail" />
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
                <FormSection label="Description*" description="Describe how the EAP is aligned with the Disaster Risk Management strategy of the National Society (e.g. in the existing contingency plan, DRR plan etc.).">
                    <TextArea
                        name="description"
                        value={value.description}
                        error={error?.description as string}
                        onChange={setFieldValue}
                    />
                </FormSection>
                <FormSection label="Procurement File*" description="Add a cover photo, which will be attached and displayed on top of your application">
                    <RawFileInput
                        name="image"
                        onChange={(files) => setFieldValue(files, 'file')}
                        variant="secondary"
                    >
                        Upload
                    </RawFileInput>
                    {value.file?.name && <p>{value.file.name}</p>}
                </FormSection>
                <FormSection label="Published Date*" description="This date should be the Published Date of the Procurement">
                    <DateInput
                        name="publishedDate"
                        value={value.publishedDate}
                        onChange={setFieldValue}
                        placeholder="Select Date"
                        error={error?.publishedDate as string}
                    />
                </FormSection>
                <FormSection label="Expire Date*" description="This date should be the Expire Date of the Procurement">
                    <DateInput
                        name="expiryDate"
                        value={value.expiryDate}
                        onChange={setFieldValue}
                        placeholder="Select Date"
                        error={error?.expiryDate as string}
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

export default ProcurementForm;
