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
    DateInput,
    Heading,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { isNotDefined } from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    ObjectSchema,
    PartialForm,
    removeNull,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import ContainerWrapper from '#components/ContainerWrapper';
import FileUpload from '#components/FileUpload';
import FormSection from '#components/FormSection';
import Page from '#components/Page';
import RichTextEditor from '#components/RichTextEditor';
import {
    ResourceCreateInput,
    ResourceTypeEnum,
    useCreateResourceMutation,
    useDirectiveQuery,
    useResourceDetailQuery,
    useUpdateResourceMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import urlToFile from '#utils/urlToFile';

type PartialFormType = PartialForm<ResourceCreateInput> &
{ createdBy: string, modifiedBy: string, slug: string};

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
        createdBy: {},
        modifiedBy: {},
        slug: {},

    }),
};

const defaultEditFormValue: PartialFormType = {
    createdBy: '',
    modifiedBy: '',
    slug: '',
};
function ResourceForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const alert = useAlert();

    const [{ data }] = useResourceDetailQuery({
        variables: { id: id || '' }, pause: !id,
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

    const handleFormSubmit = useCallback(() => {
        const handler = createSubmitHandler(
            validate,
            setError,
            async (val) => {
                const mutateData = {
                    file: val.file ?? null,
                    title: val.title ?? '',
                    publishedDate: val.publishedDate,
                    directive: val.directive ?? '',
                    content: val.content ?? '',
                    coverImage: val.coverImage ?? null,
                    type: val.type ?? null,

                };
                if (id) {
                    const res = await updateResourceMutate({
                        pk: id,
                        data: mutateData,
                    });
                    if (res.data?.updateResource?.ok) {
                        navigate('/resources');
                        alert.show('Resource updated successfully', { variant: 'success' });
                    } else if (res.data?.updateResource.errors) {
                        const errorMessages = res.data?.updateResource?.errors;
                        alert.show(errorMessages, { variant: 'danger' });
                        setError(errorMessages);
                    }
                } else {
                    const res = await createResourceMutate({
                        data: mutateData,
                    });

                    if (res.data?.createResource.ok) {
                        navigate('/resources');
                        alert.show('Resource created successfully', { variant: 'success' });
                    } else if (res.data?.createResource?.errors) {
                        const errorMessages = res.data?.createResource?.errors;
                        alert.show(errorMessages, { variant: 'danger' });
                        setError(errorMessages);
                    }
                }
            },
        );
        handler();
    }, [setError, alert, validate, id, createResourceMutate, updateResourceMutate, navigate]);

    useEffect(() => {
        if (isNotDefined(data?.resource)) {
            return;
        }
        const {
            modifiedBy,
            createdBy,
            file,
            coverImage,
            directiveId,
            ...other
        } = removeNull(data.resource);

        setValue({
            ...other,
            directive: directiveId,
            modifiedBy: `${modifiedBy.firstName} ${modifiedBy.lastName}`,
            createdBy: `${createdBy.firstName} ${createdBy.lastName}`,
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
        value: scope,
        label: scope,
    })), []);

    const ContentEditor = useMemo(() => (
        <RichTextEditor
            value={value.content}
            onChange={(val) => setFieldValue(val, 'content')}
            error={error?.content}
        />
    ), [value.content, error?.content, setFieldValue]);

    return (
        <Page>
            <ContainerWrapper>
                <FormSection headingLevel={3} label={id ? 'RESOURCE DETAILS' : 'CREATE RESOURCE'} />
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
                <FormSection label="Cover Image" description="Add a File, which will be attached and shown on Radio Page" withAsteriskOnTitle>
                    <FileUpload
                        name="coverImage"
                        onChange={(files) => setFieldValue(files, 'coverImage')}
                        value={value.coverImage}
                        error={error?.coverImage as string}
                    />
                </FormSection>
                <FormSection label="Content" description="Enter the Content" withAsteriskOnTitle>
                    {ContentEditor}
                </FormSection>
                <FormSection label="Published Date" description="This date should be the Published Date of the Resource" withAsteriskOnTitle>
                    <DateInput
                        name="publishedDate"
                        value={value.publishedDate}
                        onChange={setFieldValue}
                        placeholder="Select Date"
                        error={error?.publishedDate as string}
                    />
                </FormSection>
                <FormSection label="Strategic Directive" description="Add the Strategic Directive" withAsteriskOnTitle>
                    <SelectInput
                        name="directive"
                        options={directiveOptions}
                        value={value.directive}
                        keySelector={(o) => o.id}
                        labelSelector={(o) => o.name}
                        onChange={setFieldValue}
                        placeholder="Select Strategic Directive"
                        error={error?.directive as string}
                    />
                </FormSection>
                <FormSection label="Type" description="Add type to either global or local" withAsteriskOnTitle>
                    <SelectInput
                        name="type"
                        options={resourcesOptions}
                        value={value.type}
                        keySelector={(o) => o.label}
                        labelSelector={(o) => o.value}
                        onChange={setFieldValue}
                        placeholder="Select Type"
                        error={error?.type as string}
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

export default ResourceForm;
