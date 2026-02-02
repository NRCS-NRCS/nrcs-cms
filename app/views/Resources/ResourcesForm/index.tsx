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
    ObjectSchema,
    PartialForm,
    removeNull,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import FileUpload from '#components/FileUpload';
import MarkdownEditor from '#components/MarkdownEditor';
import {
    ResourceCreateInput,
    ResourceTypeEnum,
    ResourceUpdateInput,
    useCreateResourceMutation,
    useDirectiveQuery,
    useResourceDetailQuery,
    useUpdateResourceMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    idSelector,
    keySelector,
    labelSelector,
    nameSelector,
} from '#utils/common';
import urlToFile from '#utils/urlToFile';

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
    } = useForm(ResourceSchema, { value: defaultEditFormValue });

    const error = getErrorObject(formError);

    const handleMutation = useCallback(async (mutationData: PartialFormType) => {
        const redirectPath = 'resources';
        const alertMessage = `Resources ${id ? 'updated' : 'created'} successfully`;
        if (id) {
            const res = await updateResourceMutate({
                pk: id,
                data: mutationData as ResourceUpdateInput,
            });
            const result = res.data?.updateResource;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        } else {
            const res = await createResourceMutate({
                data: mutationData as ResourceCreateInput,
            });
            const result = res.data?.createResource;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result?.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        }
    }, [alert, createResourceMutate, id, navigate, setError, updateResourceMutate]);

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
            file,
            coverImage,
            directiveId,
            ...other
        } = removeNull(data.resource);

        setValue({
            ...other,
            directive: directiveId,
        });
        if (file) {
            urlToFile(file.url, file.name).then((fileData) => {
                setValue((prev) => ({
                    ...prev,
                    file: fileData,
                }));
            });
        }

        if (coverImage) {
            urlToFile(coverImage.url, coverImage.name).then((coverImageData) => {
                setValue((prev) => ({
                    ...prev,
                    coverImage: coverImageData,
                }));
            });
        }
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

    const ContentEditor = useMemo(() => (
        <MarkdownEditor
            value={value.content}
            onChange={(val) => setFieldValue(val, 'content')}
            error={error?.content}
            placeholder="Start writing content here..."
        />
    ), [value.content, error?.content, setFieldValue]);

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
        <Container withPadding>
            <ListView layout="block">
                <InputSection withoutTitleSection>
                    <Heading level={4}>
                        {id ? 'RESOURCE DETAILS' : 'CREATE RESOURCE'}
                    </Heading>
                </InputSection>
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
                    description="Add a File, which will be attached and shown on Radio Page"
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
                    description="Add a File, which will be attached and shown on Radio Page"
                    withAsteriskOnTitle
                >
                    <FileUpload
                        name="coverImage"
                        onChange={(files) => setFieldValue(files, 'coverImage')}
                        value={value.coverImage}
                        error={getErrorString(error?.coverImage)}
                    />
                </InputSection>
                <InputSection
                    title="Content"
                    description="Enter the Content"
                    withAsteriskOnTitle
                />
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

export default ResourceForm;
