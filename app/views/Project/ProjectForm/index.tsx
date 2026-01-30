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
    ObjectSchema,
    PartialForm,
    removeNull,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import FileUpload from '#components/FileUpload';
import MarkdownEditor from '#components/MarkdownEditor';
import {
    ProjectCreateInput,
    ProjectUpdateInput,
    useCreateProjectMutation,
    useDepartmentsQuery,
    useProjectDetailQuery,
    useUpdateProjectMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    idSelector,
    nameSelector,
} from '#utils/common';
import urlToFile from '#utils/urlToFile';

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
    } = useForm(ProjectSchema, { value: defaultEditFormValue });

    const error = getErrorObject(formError);

    const handleMutation = useCallback(async (mutationData: PartialFormType) => {
        const redirectPath = 'project';
        const alertMessage = `Project ${id ? 'updated' : 'created'} successfully`;
        if (id) {
            const res = await updateProjectMutate({
                pk: id,
                data: mutationData as ProjectUpdateInput,
            });
            const result = res.data?.updateProject;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        } else {
            const res = await createProjectMutate({
                data: mutationData as ProjectCreateInput,
            });
            const result = res.data?.createProject;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result?.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        }
    }, [alert, createProjectMutate, id, navigate, setError, updateProjectMutate]);

    const handleFormSubmit = useCallback(
        () => createSubmitHandler(
            validate,
            setError,
            handleMutation,
        )(),
        [validate, setError, handleMutation],
    );

    useEffect(() => {
        if (data?.project) {
            const { project } = data;
            if (project.coverImage) {
                urlToFile(project?.coverImage?.url, project?.coverImage?.name)
                    .then((file) => {
                        setFieldValue(file, 'coverImage');
                    });
            }
            setFieldValue(project?.title, 'title');
            setFieldValue(project?.description, 'description');
            setFieldValue(project?.department?.id, 'department');
        }
    }, [data, setFieldValue]);

    useEffect(() => {
        if (isNotDefined(data?.project)) {
            return;
        }
        const {
            coverImage,
            department,
            ...other
        } = removeNull(data.project);

        setValue({
            ...other,
            department: department?.id,
        });
        if (coverImage) {
            urlToFile(coverImage.url, coverImage.name).then((coverImageData) => {
                setValue((prev) => ({
                    ...prev,
                    file: coverImageData,
                }));
            });
        }
    }, [data, setValue]);

    const departmentOptions = departments?.departments.results.map(
        (dept) => ({
            id: dept.id,
            name: dept.title,
        }),
    ) ?? [];

    const ContentEditor = useMemo(() => (
        <MarkdownEditor
            value={value.description}
            onChange={(val) => setFieldValue(val, 'description')}
            error={error?.description}
            placeholder="Start writing description here..."
        />
    ), [value.description, error?.description, setFieldValue]);

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
        <Container withPadding>
            <ListView layout="block">
                <InputSection withoutTitleSection>
                    <Heading level={4}>
                        {id ? 'PROJECT DETAILS' : 'CREATE PROJECT'}
                    </Heading>
                </InputSection>
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
                <InputSection
                    title="Write Description"
                    description="Enter the Description"
                    withAsteriskOnTitle
                />
                {ContentEditor}
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

export default ProjectForm;
