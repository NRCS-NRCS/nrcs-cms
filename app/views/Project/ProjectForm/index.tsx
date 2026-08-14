import {
    Activity,
    useCallback,
    useEffect,
} from 'react';
import {
    Navigate,
    useParams,
} from 'react-router';
import {
    BlockLoading,
    Button,
    Container,
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
import MarkdownEditor from '#components/MarkdownEditor';
import NonFieldError from '#components/NonFieldError';
import {
    type ProjectCreateInput,
    type ProjectUpdateInput,
    useCreateProjectMutation,
    useDepartmentsQuery,
    useProjectDetailQuery,
    useUpdateProjectMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import useUnsavedModal from '#hooks/useUnsavedModal';
import {
    ACCEPTED_IMAGE_TYPES,
    errorMessage,
    idSelector,
    nameSelector,
} from '#utils/common';

type PartialFormType = PartialForm<ProjectCreateInput>

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const ProjectSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        description: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        department: {
            required: true,
        },
        coverImage: {
            required: true,
        },
    }),
};

const defaultEditFormValue: PartialFormType = {};

function ProjectForm() {
    const { id } = useParams();
    const navigate = useRouting();
    const { canEditContent } = usePermissions();
    const alert = useAlert();

    const [{ data, fetching: projectDetailFetch }] = useProjectDetailQuery({
        variables: { id: (id ?? '') }, pause: !id,
    });
    const [{ data: departments }] = useDepartmentsQuery();

    const [{ fetching: createPending }, createProjectMutate] = useCreateProjectMutation();
    const [{ fetching: updatePending }, updateProjectMutate] = useUpdateProjectMutation();
    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
        setValue,
        pristine,
    } = useForm(ProjectSchema, { value: defaultEditFormValue });

    const {
        unsavedModal,
        bypassUnsavedModal,
    } = useUnsavedModal(!pristine);

    const error = getErrorObject(formError);

    const handleMutation = useCallback(async (mutationData: PartialFormType) => {
        const redirectPath = 'project';
        const alertMessage = `Project ${id ? 'updated' : 'created'} successfully`;
        const { coverImage, ...otherMutationData } = mutationData;
        const dataToSubmit = {
            ...otherMutationData,
            coverImage: coverImage instanceof File ? coverImage : undefined,
        };
        if (id) {
            const res = await updateProjectMutate({
                pk: id,
                data: dataToSubmit as ProjectUpdateInput,
            });
            const result = res.data?.updateProject;
            if (result?.ok) {
                bypassUnsavedModal();
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        } else {
            const res = await createProjectMutate({
                data: dataToSubmit as ProjectCreateInput,
            });
            const result = res.data?.createProject;
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
        createProjectMutate,
        id,
        navigate,
        setError,
        updateProjectMutate,
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
        if (isNotDefined(data?.project)) {
            return;
        }
        const {
            department,
            ...other
        } = removeNull(data.project);

        setValue({
            ...other,
            department: department?.id,
        });
    }, [data, setValue]);

    const departmentOptions = departments?.departments.results.map(
        (dept) => ({
            id: dept.id,
            name: dept.title,
        }),
    ) ?? [];

    const handleCancelClick = useCallback(() => {
        navigate('project');
    }, [navigate]);

    if (!canEditContent) {
        return <Navigate to="/projects" replace />;
    }

    if (projectDetailFetch) {
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
            heading={id ? 'PROJECT DETAILS' : 'CREATE PROJECT'}
            headerDescription={id ? 'Review and update the details of this project' : 'Fill in the details below to create a new project'}
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
                <Activity mode={data?.project.createdBy && data.project.modifiedBy ? 'visible' : 'hidden'}>
                    <InputSection
                        title={`Created by: ${data?.project.createdBy.firstName} ${data?.project.createdBy.lastName}`}
                    >
                        <Heading level={6}>
                            Modified by:
                            {' '}
                            {data?.project.modifiedBy.firstName}
                            {' '}
                            {data?.project.modifiedBy.lastName}
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
                    title="Cover Image"
                    description="Add a Cover Image, which will be attached and shown on Project"
                    withAsteriskOnTitle
                >
                    <FileUpload
                        name="coverImage"
                        onChange={setFieldValue}
                        value={value.coverImage}
                        error={getErrorString(error?.coverImage)}
                        accept={ACCEPTED_IMAGE_TYPES}
                    />
                </InputSection>
                <InputSection
                    title="Type"
                    description="Add type to either Tuesday Program or Radio Red Cross"
                    withAsteriskOnTitle
                >
                    <SelectInput
                        name="department"
                        options={departmentOptions}
                        value={value.department}
                        keySelector={idSelector}
                        labelSelector={nameSelector}
                        onChange={setFieldValue}
                        placeholder="Select Status"
                        error={error?.department}
                    />
                </InputSection>
                <MarkdownEditor
                    heading="Write Description"
                    withAsteriskOnHeading
                    headingDescription="Enter the Description"
                    name="description"
                    value={value.description}
                    onChange={setFieldValue}
                    error={error?.description}
                    placeholder="Start writing description here..."
                />
            </ListView>
            {unsavedModal}
        </Container>
    );
}

export default ProjectForm;
