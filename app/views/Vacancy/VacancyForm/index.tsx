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
    Checkbox,
    DateInput,
    Heading,
    NumberInput,
    SelectInput,
    TextArea,
    TextInput,
} from '@ifrc-go/ui';
import {
    createSubmitHandler,
    getErrorObject,
    integerCondition,
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
    JobVacancyCreateInput,
    useCreateVacancyMutation,
    useDepartmentsQuery,
    useUpdateVacancyMutation,
    useVacancyDetailQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import urlToFile from '#utils/urlToFile';

type PartialFormType = PartialForm<JobVacancyCreateInput> &
{ createdBy: string, modifiedBy: string }

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const VacancySchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        description: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        position: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        publishedAt: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        expiryDate: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        department: {
            required: true,
        },
        file: {
            required: true,
        },
        numberOfVacancies: {
            required: true,
            requiredValidation: integerCondition,

        },
        isArchived: {},
        createdBy: {},
        modifiedBy: {},

    }),
};

const defaultEditFormValue: PartialFormType = {
    createdBy: '',
    modifiedBy: '',
};
function VacancyForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const alert = useAlert();

    const [{ data }] = useVacancyDetailQuery({
        variables: { id: id || '' }, pause: !id,
    });
    const [{ data: departments }] = useDepartmentsQuery();

    const [{ fetching: createPending }, createVacancyMutate] = useCreateVacancyMutation();
    const [{ fetching: updatePending }, updateVacancyMutate] = useUpdateVacancyMutation();
    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
    } = useForm(VacancySchema, { value: defaultEditFormValue });

    const error = getErrorObject(formError);

    const handleFormSubmit = useCallback(() => {
        const handler = createSubmitHandler(
            validate,
            setError,
            async (val) => {
                const mutateData = {
                    file: val.file ?? null,
                    title: val.title ?? '',
                    publishedAt: val.publishedAt,
                    department: val.department ?? null,
                    description: val.description ?? '',
                    expiryDate: val.expiryDate,
                    numberOfVacancies: val.numberOfVacancies ?? 0,
                    position: val.position ?? '',
                    isArchived: val.isArchived,

                };
                if (id) {
                    const res = await updateVacancyMutate({
                        pk: id,
                        data: mutateData,
                    });
                    if (res.data?.updateJobVacancy?.ok) {
                        navigate('/vacancy');
                        alert.show('Vacancy updated successfully', { variant: 'success' });
                    } else if (res.data?.updateJobVacancy.errors) {
                        const errorMessages = res.data?.updateJobVacancy?.errors;
                        alert.show(errorMessages, { variant: 'danger' });
                        setError(errorMessages);
                    }
                } else {
                    const res = await createVacancyMutate({
                        data: mutateData,
                    });

                    if (res.data?.createJobVacancy.ok) {
                        navigate('/vacancy');
                        alert.show('Vacancy created successfully', { variant: 'success' });
                    } else if (res.data?.createJobVacancy?.errors) {
                        const errorMessages = res.data?.createJobVacancy?.errors;
                        alert.show(errorMessages, { variant: 'danger' });
                        setError(errorMessages);
                    }
                }
            },
        );
        handler();
    }, [setError, alert, validate, id, createVacancyMutate, updateVacancyMutate, navigate]);

    useEffect(() => {
        if (data?.jobVacancy) {
            const { jobVacancy } = data;
            if (jobVacancy.file) {
                urlToFile(jobVacancy?.file?.url, jobVacancy?.file?.name)
                    .then((file) => {
                        setFieldValue(file, 'file');
                    });
            }
            setFieldValue(jobVacancy?.title, 'title');
            setFieldValue(jobVacancy?.description, 'description');
            setFieldValue(jobVacancy?.publishedAt, 'publishedAt');
            setFieldValue(jobVacancy?.isArchived, 'isArchived');
            setFieldValue(jobVacancy?.expiryDate, 'expiryDate');
            setFieldValue(jobVacancy?.departmentId, 'department');
            setFieldValue(jobVacancy?.numberOfVacancies, 'numberOfVacancies');
            setFieldValue(jobVacancy?.position, 'position');
            setFieldValue(`${jobVacancy.modifiedBy?.firstName} ${jobVacancy.modifiedBy?.lastName}`, 'modifiedBy');
            setFieldValue(`${jobVacancy.createdBy?.firstName} ${jobVacancy.createdBy?.lastName}`, 'createdBy');
        }
    }, [data, setFieldValue]);

    const departmentOptions = useMemo(() => departments?.departments.results.map(
        (dept) => ({
            id: dept.id,
            name: dept.title,
        }),
    ) ?? [], [departments]);

    return (
        <Page>
            <ContainerWrapper>
                <FormSection headingLevel={3} label="VACANCY DETAILS" />
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
                <FormSection label="File" description="Add a File, which will be attached and shown on Radio Page" withAsteriskOnTitle>
                    <FileUpload
                        name="file"
                        onChange={(files) => setFieldValue(files, 'file')}
                        value={value.file}
                        error={error?.file as string}
                    />
                </FormSection>
                <FormSection label="Vacancy Position" description="Enter the Vacancy Position" withAsteriskOnTitle>
                    <TextInput
                        name="position"
                        value={value.position}
                        error={error?.position as string}
                        onChange={setFieldValue}
                        placeholder="position"
                    />
                </FormSection>
                <FormSection label="Description" description="Enter the Description" withAsteriskOnTitle>
                    <TextArea
                        name="description"
                        value={value.description}
                        error={error?.description as string}
                        onChange={setFieldValue}
                        placeholder="description"
                    />
                </FormSection>
                <FormSection label="Number of Vacancies" description="Enter the Number of Vacancies" withAsteriskOnTitle>
                    <NumberInput
                        name="numberOfVacancies"
                        value={value.numberOfVacancies}
                        error={error?.numberOfVacancies as string}
                        onChange={setFieldValue}
                        placeholder="numberOfVacancies"
                    />
                </FormSection>
                <FormSection label="Published Date" description="This date should be the Published Date of the Vacancy" withAsteriskOnTitle>
                    <DateInput
                        name="publishedAt"
                        value={value.publishedAt}
                        onChange={setFieldValue}
                        placeholder="Select Date"
                        error={error?.publishedAt as string}
                    />
                </FormSection>
                <FormSection label="Expire Date" description="This date should be the Expire Date of the Vacancy" withAsteriskOnTitle>
                    <DateInput
                        name="expiryDate"
                        value={value.expiryDate}
                        onChange={setFieldValue}
                        placeholder="Select Date"
                        error={error?.expiryDate as string}
                    />
                </FormSection>
                <FormSection label="Department" description="Add which department this vacancy belongs to" withAsteriskOnTitle>
                    <SelectInput
                        name="department"
                        options={departmentOptions}
                        value={value.department}
                        keySelector={(o) => o.id}
                        labelSelector={(o) => o.name}
                        onChange={setFieldValue}
                        placeholder="Select Department"
                        error={error?.department}
                    />
                </FormSection>
                <FormSection label="Archive" description="Click on the checkbox if the Vacancy is to be archived?" withAsteriskOnTitle>
                    <Checkbox
                        name="isArchived"
                        value={value.isArchived}
                        onChange={setFieldValue}
                        error={error?.isArchived as string}
                        label="Is Archived"
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

export default VacancyForm;
