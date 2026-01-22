import {
    Activity,
    useCallback,
    useEffect,
} from 'react';
import {
    useNavigate,
    useParams,
} from 'react-router';
import {
    Button,
    DateInput,
    Heading,
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

import ContainerWrapper from '#components/ContainerWrapper';
import FileUpload from '#components/FileUpload';
import FormSection from '#components/FormSection';
import Page from '#components/Page';
import {
    ProcurementCreateInput,
    useCreateProcurementMutation,
    useProcurementDetailQuery,
    useUpdateProcurementMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import urlToFile from '#utils/urlToFile';

type PartialFormType = PartialForm<ProcurementCreateInput> &
{ createdBy: string, modifiedBy: string }

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const ProcurementSchema: FormSchema = {
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
    const alert = useAlert();

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
    } = useForm(ProcurementSchema, { value: defaultEditFormValue });

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
                        alert.show('Procurement updated successfully', { variant: 'success' });
                    } else if (res.data?.updateProcurement.errors) {
                        const errorMessages = res.data?.updateProcurement?.errors;
                        alert.show(errorMessages, { variant: 'danger' });
                        setError(errorMessages);
                    }
                } else {
                    const res = await createProcurementMutate({
                        data: mutateData,
                    });

                    if (res.data?.createProcurement.ok) {
                        navigate('/procurements');
                        alert.show('Procurement created successfully', { variant: 'success' });
                    } else if (res.data?.createProcurement?.errors) {
                        const errorMessages = res.data?.createProcurement?.errors;
                        alert.show(errorMessages, { variant: 'danger' });
                        setError(errorMessages);
                    }
                }
            },
        );
        handler();
    }, [setError, alert, validate, id, createProcurementMutate, updateProcurementMutate, navigate]);

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
            <ContainerWrapper>
                <FormSection headingLevel={3} label={id ? 'PROCUREMENT DETAILS' : 'CREATE PROCUREMENT'} />
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
                        autoFocus
                        placeholder="title"
                    />
                </FormSection>
                <FormSection label="Description" description="Describe how the EAP is aligned with the Disaster Risk Management strategy of the National Society (e.g. in the existing contingency plan, DRR plan etc.)." withAsteriskOnTitle>
                    <TextArea
                        name="description"
                        value={value.description}
                        error={error?.description as string}
                        onChange={setFieldValue}
                        placeholder="description"
                    />
                </FormSection>
                <FormSection label="Procurement File" description="Add a cover photo, which will be attached and displayed on top of your application" withAsteriskOnTitle>
                    <FileUpload
                        name="file"
                        onChange={(files) => setFieldValue(files, 'file')}
                        value={value.file}
                        error={error?.file as string}
                    />
                </FormSection>
                <FormSection label="Published Date" description="This date should be the Published Date of the Procurement" withAsteriskOnTitle>
                    <DateInput
                        name="publishedDate"
                        value={value.publishedDate}
                        onChange={setFieldValue}
                        placeholder="Select Date"
                        error={error?.publishedDate as string}
                    />
                </FormSection>
                <FormSection label="Expire Date" description="This date should be the Expire Date of the Procurement" withAsteriskOnTitle>
                    <DateInput
                        name="expiryDate"
                        value={value.expiryDate}
                        onChange={setFieldValue}
                        placeholder="Select Date"
                        error={error?.expiryDate as string}
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

export default ProcurementForm;
