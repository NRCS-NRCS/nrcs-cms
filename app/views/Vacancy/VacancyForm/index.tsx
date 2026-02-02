import {
    Activity,
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import { useParams } from 'react-router';
import {
    BlockLoading,
    Button,
    Checkbox,
    Container,
    DateInput,
    Heading,
    InputSection,
    ListView,
    NumberInput,
    SelectInput,
    TextArea,
    TextInput,
} from '@ifrc-go/ui';
import { isNotDefined } from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    getErrorString,
    integerCondition,
    ObjectSchema,
    PartialForm,
    removeNull,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import FileUpload from '#components/FileUpload';
import {
    JobVacancyCreateInput,
    JobVacancyUpdateInput,
    useCreateVacancyMutation,
    useDepartmentsQuery,
    useUpdateVacancyMutation,
    useVacancyDetailQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    keySelector,
    labelSelector,
} from '#utils/common';
import urlToFile from '#utils/urlToFile';

type PartialFormType = PartialForm<JobVacancyCreateInput>
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
    }),
};

const defaultEditFormValue: PartialFormType = {};
function VacancyForm() {
    const { id } = useParams();
    const navigate = useRouting();
    const alert = useAlert();

    const [{ data, fetching: vacancyDetailFetch }] = useVacancyDetailQuery({
        variables: { id: (id ?? '') }, pause: !id,
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
        setValue,
    } = useForm(VacancySchema, { value: defaultEditFormValue });

    const error = getErrorObject(formError);

    const handleMutation = useCallback(async (mutationData: PartialFormType) => {
        const redirectPath = 'vacancy';
        const alertMessage = `Vacancy ${id ? 'updated' : 'created'} successfully`;
        if (id) {
            const res = await updateVacancyMutate({
                pk: id,
                data: mutationData as JobVacancyUpdateInput,
            });
            const result = res.data?.updateJobVacancy;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        } else {
            const res = await createVacancyMutate({
                data: mutationData as JobVacancyCreateInput,
            });
            const result = res.data?.createJobVacancy;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result?.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        }
    }, [alert, createVacancyMutate, id, navigate, setError, updateVacancyMutate]);

    const handleFormSubmit = useCallback(
        () => createSubmitHandler(
            validate,
            setError,
            handleMutation,
        )(),
        [validate, setError, handleMutation],
    );

    useEffect(() => {
        if (isNotDefined(data?.jobVacancy)) {
            return;
        }
        const {
            departmentId,
            file,
            ...other
        } = removeNull(data.jobVacancy);

        setValue({
            ...other,
            department: departmentId,
        });
        if (file) {
            urlToFile(file.url, file.name).then((fileData) => {
                setValue((prev) => ({
                    ...prev,
                    file: fileData,
                }));
            });
        }
    }, [data, setValue]);

    const departmentOptions = useMemo(() => departments?.departments.results.map(
        (dept) => ({
            key: dept.id,
            label: dept.title,
        }),
    ) ?? [], [departments]);

    if (vacancyDetailFetch) {
        return (
            <BlockLoading
                withoutBorder
                compact
                message="Loading"
            />
        );
    }

    return (
        <Container withPadding>
            <ListView layout="block">
                <InputSection withoutTitleSection>
                    <Heading level={4}>
                        {id ? 'VACANCY DETAILS' : 'CREATE VACANCY'}
                    </Heading>
                </InputSection>
                <Activity mode={data?.jobVacancy.createdBy && data.jobVacancy.modifiedBy ? 'visible' : 'hidden'}>
                    <InputSection
                        title={`Created by: ${data?.jobVacancy.createdBy.firstName} ${data?.jobVacancy.createdBy.lastName}`}
                    >
                        <Heading level={6}>
                            Modified by:
                            {' '}
                            {data?.jobVacancy.modifiedBy.firstName}
                            {' '}
                            {data?.jobVacancy.modifiedBy.lastName}
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
                    title="File"
                    description="Add a File, which will be attached and shown on Radio Page"
                    withAsteriskOnTitle
                >
                    <FileUpload
                        name="file"
                        onChange={setFieldValue}
                        value={value.file}
                        error={getErrorString(error?.file)}
                    />
                </InputSection>
                <InputSection
                    title="Vacancy Position"
                    description="Enter the Vacancy Position"
                    withAsteriskOnTitle
                >
                    <TextInput
                        name="position"
                        value={value.position}
                        error={error?.position}
                        onChange={setFieldValue}
                        placeholder="position"
                    />
                </InputSection>
                <InputSection
                    title="Description"
                    description="Enter the Description"
                    withAsteriskOnTitle
                >
                    <TextArea
                        name="description"
                        value={value.description}
                        error={error?.description}
                        onChange={setFieldValue}
                        placeholder="description"
                    />
                </InputSection>
                <InputSection
                    title="Number of Vacancies"
                    description="Enter the Number of Vacancies"
                    withAsteriskOnTitle
                >
                    <NumberInput
                        name="numberOfVacancies"
                        value={value.numberOfVacancies}
                        error={error?.numberOfVacancies}
                        onChange={setFieldValue}
                        placeholder="numberOfVacancies"
                        min={1}
                    />
                </InputSection>
                <InputSection
                    title="Published Date"
                    description="This date should be the Published Date of the Vacancy"
                    withAsteriskOnTitle
                >
                    <DateInput
                        name="publishedAt"
                        value={value.publishedAt}
                        onChange={setFieldValue}
                        placeholder="Select Date"
                        error={getErrorString(error?.publishedAt)}
                    />
                </InputSection>
                <InputSection
                    title="Expire Date"
                    description="This date should be the Expire Date of the Vacancy"
                    withAsteriskOnTitle
                >
                    <DateInput
                        name="expiryDate"
                        value={value.expiryDate}
                        onChange={setFieldValue}
                        placeholder="Select Date"
                        error={getErrorString(error?.expiryDate)}
                    />
                </InputSection>
                <InputSection
                    title="Department"
                    description="Add which department this vacancy belongs to"
                    withAsteriskOnTitle
                >
                    <SelectInput
                        name="department"
                        options={departmentOptions}
                        value={value.department}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        onChange={setFieldValue}
                        placeholder="Select Department"
                        error={error?.department}
                    />
                </InputSection>
                <InputSection
                    title="Archive"
                    description="Click on the checkbox if the Vacancy is to be archived?"
                >
                    <Checkbox
                        name="isArchived"
                        value={value.isArchived}
                        onChange={setFieldValue}
                        error={error?.isArchived}
                        label="Is Archived"
                    />
                </InputSection>
                <ListView
                    withPadding
                    withBackground
                    withCenteredContents
                >
                    <Button name="save" onClick={handleFormSubmit}>
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </ListView>
            </ListView>
        </Container>
    );
}

export default VacancyForm;
