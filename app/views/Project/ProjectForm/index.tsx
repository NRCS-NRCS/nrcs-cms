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
    Heading,
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

import ContainerWrapper from '#components/ContainerWrapper';
import FileUpload from '#components/FileUpload';
import FormSection from '#components/FormSection';
import Page from '#components/Page';
import {
    ProjectCreateInput,
    useCreateProjectMutation,
    useDepartmentsQuery,
    useProjectDetailQuery,
    useUpdateProjectMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import urlToFile from '#utils/urlToFile';

type PartialFormType = PartialForm<ProjectCreateInput> &
{ createdBy: string, modifiedBy: string }

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
        createdBy: {},
        modifiedBy: {},

    }),
};

const defaultEditFormValue: PartialFormType = {
    createdBy: '',
    modifiedBy: '',
};
function ProjectForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const alert = useAlert();

    const [{ data }] = useProjectDetailQuery({
        variables: { id: id || '' }, pause: !id,
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
    } = useForm(ProjectSchema, { value: defaultEditFormValue });

    const error = getErrorObject(formError);

    const handleFormSubmit = useCallback(() => {
        const handler = createSubmitHandler(
            validate,
            setError,
            async (val) => {
                const mutateData = {
                    coverImage: val.coverImage ?? null,
                    title: val.title ?? '',
                    department: val.department ?? null,
                    description: val.description ?? '',
                };
                if (id) {
                    const res = await updateProjectMutate({
                        pk: id,
                        data: mutateData,
                    });
                    if (res.data?.updateProject?.ok) {
                        navigate('/projects');
                        alert.show('Project updated successfully', { variant: 'success' });
                    } else if (res.data?.updateProject.errors) {
                        const errorMessages = res.data?.updateProject?.errors;
                        alert.show(errorMessages, { variant: 'danger' });
                        setError(errorMessages);
                    }
                } else {
                    const res = await createProjectMutate({
                        data: mutateData,
                    });
                    if (res.data?.createProject.ok) {
                        navigate('/projects');
                        alert.show('Project created successfully', { variant: 'success' });
                    } else if (res.data?.createProject?.errors) {
                        const errorMessages = res.data?.createProject?.errors;
                        alert.show(errorMessages, { variant: 'danger' });
                        setError(errorMessages);
                    }
                }
            },
        );
        handler();
    }, [setError, alert, validate, id, createProjectMutate, updateProjectMutate, navigate]);

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
            setFieldValue(`${project.modifiedBy?.firstName} ${project.modifiedBy?.lastName}`, 'modifiedBy');
            setFieldValue(`${project.createdBy?.firstName} ${project.createdBy?.lastName}`, 'createdBy');
        }
    }, [data, setFieldValue]);

    const departmentOptions = departments?.departments.results.map(
        (dept) => ({
            id: dept.id,
            name: dept.title,
        }),
    ) ?? [];

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
                <FormSection label="Cover Image" description="Add a Cover Image, which will be attached and shown on Project" withAsteriskOnTitle>
                    <FileUpload
                        name="coverImage"
                        onChange={(files) => setFieldValue(files, 'coverImage')}
                        value={value.coverImage}
                        error={error?.coverImage as string}
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
                <FormSection label="Type" description="Add type to either Tuesday Program or Radio Red Cross" withAsteriskOnTitle>
                    <SelectInput
                        name="department"
                        options={departmentOptions}
                        value={value.department}
                        keySelector={(o) => o.id}
                        labelSelector={(o) => o.name}
                        onChange={setFieldValue}
                        placeholder="Select Status"
                        error={error?.department}
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

export default ProjectForm;
