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
    Container,
    DateInput,
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
    type ResourceCreateInput,
    ResourceTypeEnum,
    type ResourceUpdateInput,
    useCreateResourceMutation,
    useDirectiveQuery,
    useResourceDetailQuery,
    useUpdateResourceMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import useUnsavedModal from '#hooks/useUnsavedModal';
import {
    errorMessage,
    idSelector,
    keySelector,
    labelSelector,
    nameSelector,
} from '#utils/common';

type PartialFormType = PartialForm<ResourceCreateInput>
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const ResourceSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        content: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        coverImage: {
            required: true,
        },
        publishedDate: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        directive: {
            required: true,
        },
        file: {
            required: true,
        },
        type: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
    }),
};

const defaultEditFormValue: PartialFormType = {};

function ResourceForm() {
    const { id } = useParams();
    const navigate = useRouting();
    const { canEditContent } = usePermissions();
    const alert = useAlert();

    const [{ data, fetching: resourcesDetailFetch }] = useResourceDetailQuery({
        variables: { id: (id ?? '') }, pause: !id,
    });
    const [{ data: directive }] = useDirectiveQuery();

    const [{ fetching: createPending }, createResourceMutate] = useCreateResourceMutation();
    const [{ fetching: updatePending }, updateResourceMutate] = useUpdateResourceMutation();
    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
        setValue,
        pristine,
    } = useForm(ResourceSchema, { value: defaultEditFormValue });

    const {
        unsavedModal,
        bypassUnsavedModal,
    } = useUnsavedModal(!pristine);

    const error = getErrorObject(formError);

    const handleMutation = useCallback(async (mutationData: PartialFormType) => {
        const redirectPath = 'resources';
        const alertMessage = `Resources ${id ? 'updated' : 'created'} successfully`;
        const { file, coverImage, ...otherMutationData } = mutationData;
        const dataToSubmit = {
            ...otherMutationData,
            file: file instanceof File ? file : undefined,
            coverImage: coverImage instanceof File ? coverImage : undefined,
        };
        if (id) {
            const res = await updateResourceMutate({
                pk: id,
                data: dataToSubmit as ResourceUpdateInput,
            });
            const result = res.data?.updateResource;
            if (result?.ok) {
                bypassUnsavedModal();
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        } else {
            const res = await createResourceMutate({
                data: dataToSubmit as ResourceCreateInput,
            });
            const result = res.data?.createResource;
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
        createResourceMutate,
        id,
        navigate,
        setError,
        updateResourceMutate,
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
        if (isNotDefined(data?.resource)) {
            return;
        }
        const {
            directiveId,
            ...other
        } = removeNull(data.resource);

        setValue({
            ...other,
            directive: directiveId,
        });
    }, [data, setValue]);

    const directiveOptions = useMemo(() => directive?.strategicDirectives.results.map(
        (dept) => ({
            id: dept.id,
            name: dept.title,
        }),
    ) ?? [], [directive]);

    const resourcesOptions = useMemo(() => Object.values(ResourceTypeEnum).map((scope) => ({
        key: scope,
        label: scope,
    })), []);

    const ContentEditor = (
        <MarkdownEditor
            heading="Content"
            headingDescription="Enter the Content"
            name="content"
            value={value.content}
            onChange={setFieldValue}
            error={error?.content}
            placeholder="Start writing content here..."
        />
    );

    const handleCancelClick = useCallback(() => {
        navigate('resources');
    }, [navigate]);

    if (!canEditContent) {
        return <Navigate to="/resources" replace />;
    }

    if (resourcesDetailFetch) {
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
            heading={id ? 'RESOURCE DETAILS' : 'CREATE RESOURCE'}
            headerDescription={id ? 'Review and update the details of this resource' : 'Fill in the details below to create a new resource'}
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
                <Activity mode={data?.resource.createdBy && data.resource.modifiedBy ? 'visible' : 'hidden'}>
                    <InputSection
                        title={`Created by: ${data?.resource.createdBy.firstName} ${data?.resource.createdBy.lastName}`}
                    >
                        <Heading level={6}>
                            Modified by:
                            {' '}
                            {data?.resource.modifiedBy.firstName}
                            {' '}
                            {data?.resource.modifiedBy.lastName}
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
                    description="Add a File, which will be attached and shown on Resource Page"
                    withAsteriskOnTitle
                >
                    <FileUpload
                        name="file"
                        onChange={(files) => setFieldValue(files, 'file')}
                        value={value.file}
                        error={getErrorString(error?.file)}
                    />
                </InputSection>
                <InputSection
                    title="Cover Image"
                    description="Add a Cover Image, which will be attached and shown on Resource Page"
                    withAsteriskOnTitle
                >
                    <FileUpload
                        name="coverImage"
                        onChange={(files) => setFieldValue(files, 'coverImage')}
                        value={value.coverImage}
                        error={getErrorString(error?.coverImage)}
                        accept="image/*"

                    />
                </InputSection>
                {ContentEditor}
                <InputSection
                    title="Published Date"
                    description="This date should be the Published Date of the Resource"
                    withAsteriskOnTitle
                >
                    <DateInput
                        name="publishedDate"
                        value={value.publishedDate}
                        onChange={setFieldValue}
                        placeholder="Select Date"
                        error={getErrorString(error?.publishedDate)}
                    />
                </InputSection>
                <InputSection
                    title="Strategic Directive"
                    description="Add the Strategic Directive"
                    withAsteriskOnTitle
                >
                    <SelectInput
                        name="directive"
                        options={directiveOptions}
                        value={value.directive}
                        keySelector={idSelector}
                        labelSelector={nameSelector}
                        onChange={setFieldValue}
                        placeholder="Select Strategic Directive"
                        error={error?.directive}
                    />
                </InputSection>
                <InputSection
                    title="Type"
                    description="Add type to either global or local"
                    withAsteriskOnTitle
                >
                    <SelectInput
                        name="type"
                        options={resourcesOptions}
                        value={value.type}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        onChange={setFieldValue}
                        placeholder="Select Type"
                        error={error?.type}
                    />
                </InputSection>
            </ListView>
            {unsavedModal}
        </Container>
    );
}

export default ResourceForm;
