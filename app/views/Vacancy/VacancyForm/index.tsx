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
    type ObjectSchema,
    type PartialForm,
    removeNull,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import FileUpload from '#components/FileUpload';
import NonFieldError from '#components/NonFieldError';
import {
    type JobVacancyCreateInput,
    type JobVacancyUpdateInput,
    useCreateVacancyMutation,
    useDepartmentsQuery,
    useUpdateVacancyMutation,
    useVacancyDetailQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import useUnsavedModal from '#hooks/useUnsavedModal';
import {
    ACCEPTED_FILE_TYPES,
    errorMessage,
    keySelector,
    labelSelector,
} from '#utils/common';

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

const defaultEditFormValue: PartialFormType = {
    // NOTE: An unchecked box means false, not "unanswered".
    isArchived: false,
};
function VacancyForm() {
    const { id } = useParams();
    const navigate = useRouting();
    const { canEditContent } = usePermissions();
    const alert = useAlert();

    const [{ data, fetching: vacancyDetailFetch }] = useVacancyDetailQuery({
        variables: { id: (id ?? '') },
        pause: !id,
        requestPolicy: 'network-only',
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
        pristine,
    } = useForm(VacancySchema, { value: defaultEditFormValue });

    const {
        unsavedModal,
        bypassUnsavedModal,
    } = useUnsavedModal(!pristine);

    const error = getErrorObject(formError);

    const handleMutation = useCallback(async (mutationData: PartialFormType) => {
        const redirectPath = 'vacancy';
        const alertMessage = `Vacancy ${id ? 'updated' : 'created'} successfully`;
        const { file, ...otherMutationData } = mutationData;
        const dataToSubmit = {
            ...otherMutationData,
            file: file instanceof File ? file : undefined,
        };
        if (id) {
            const res = await updateVacancyMutate({
                pk: id,
                data: dataToSubmit as JobVacancyUpdateInput,
            });
            const result = res.data?.updateJobVacancy;
            if (result?.ok) {
                bypassUnsavedModal();
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        } else {
            const res = await createVacancyMutate({
                data: dataToSubmit as JobVacancyCreateInput,
            });
            const result = res.data?.createJobVacancy;
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
        createVacancyMutate,
        id,
        navigate,
        setError,
        updateVacancyMutate,
    ]);

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
            ...other
        } = removeNull(data.jobVacancy);

        setValue({
            ...other,
            department: departmentId,
        });
    }, [data, setValue]);

    const departmentOptions = useMemo(() => departments?.departments.results.map(
        (dept) => ({
            key: dept.id,
            label: dept.title,
        }),
    ) ?? [], [departments]);

    const handleCancelClick = useCallback(() => {
        navigate('vacancy');
    }, [navigate]);

    if (!canEditContent) {
        return <Navigate to="/vacancy" replace />;
    }

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
        <Container
            withPadding
            heading={id ? 'VACANCY DETAILS' : 'CREATE VACANCY'}
            headerDescription={id ? 'Review and update the details of this vacancy' : 'Fill in the details below to create a new vacancy posting'}
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
                        disabled={createPending || updatePending}
                    >
                        Cancel
                    </Button>
                    <Button
                        name="save"
                        onClick={handleFormSubmit}
                        styleVariant="filled"
                        disabled={createPending || updatePending}
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
                    description="Add a File, which will be attached and shown on Vacancy Page"
                    withAsteriskOnTitle
                >
                    <FileUpload
                        name="file"
                        onChange={setFieldValue}
                        value={value.file}
                        error={getErrorString(error?.file)}
                        accept={ACCEPTED_FILE_TYPES}
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
                    description="After this date, the Vacancy will no longer be visible on the website"
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
                        value={value.isArchived ?? false}
                        onChange={setFieldValue}
                        error={error?.isArchived}
                        label="Is Archived"
                    />
                </InputSection>
            </ListView>
            {unsavedModal}
        </Container>
    );
}

export default VacancyForm;
