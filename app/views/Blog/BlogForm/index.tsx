import React, {
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
    BlogCreateInput,
    StatusEnum,
    useBlogDetailQueryQuery,
    useCreateBlogMutation,
    useDepartmentAndDirectiveQuery,
    useUpdateBlogMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';

type PartialFormType = PartialForm<BlogCreateInput> &
{ createdBy: string, modifiedBy: string, slug: string | null };

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const EditBlogSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        author: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        content: {
            required: false,
            requiredValidation: requiredStringCondition,
        },
        coverImage: {
            required: false,
        },
        department: {
            required: false,
            requiredValidation: requiredStringCondition,
        },
        directive: {
            required: false,
            requiredValidation: requiredStringCondition,
        },
        featured: {
            required: true,
        },
        publishedDate: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        status: {
            required: false,
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

function BlogForm() {
    const { id } = useParams();
    const alert = useAlert();

    const navigate = useNavigate();
    const [{ data }] = useBlogDetailQueryQuery({
        variables: { id: id || '' }, pause: !id,
    });
    const [{ data: departmentAndDirective }] = useDepartmentAndDirectiveQuery();
    const [{ fetching: createPending }, createBlogMutate] = useCreateBlogMutation();
    const [{ fetching: updatePending }, updateBlogMutate] = useUpdateBlogMutation();
    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
        setValue,
    } = useForm(EditBlogSchema, { value: defaultEditFormValue });

    const error = getErrorObject(formError);

    const handleFormSubmit = useCallback(() => {
        const handler = createSubmitHandler(
            validate,
            setError,
            async (val) => {
                const mutateData = {
                    author: val.author ?? '',
                    content: val.content ?? '',
                    department: val.department,
                    directive: val.directive,
                    featured: val.featured,
                    status: val.status,
                    publishedDate: val.publishedDate,
                    title: val.title ?? '',
                    ...(val.coverImage instanceof File && { coverImage: val.coverImage }),
                };
                if (id) {
                    const res = await updateBlogMutate({
                        pk: id,
                        data: mutateData,
                    });
                    if (res.data?.updateBlog?.ok) {
                        navigate('/blog');
                        alert.show('Blog updated successfully', { variant: 'success' });
                    } else if (res.data?.updateBlog?.errors) {
                        const errorMessages = res.data?.updateBlog?.errors;
                        setError(res.data.updateBlog.errors);
                        alert.show(errorMessages, { variant: 'danger' });
                    }
                } else {
                    const res = await createBlogMutate({
                        data: mutateData,
                    });
                    if (res.data?.createBlog.ok) {
                        navigate('/blog');
                        alert.show('Blog created successfully', { variant: 'success' });
                    } else if (res.data?.createBlog?.errors) {
                        const errorMessages = res.data?.createBlog?.errors;
                        setError(res.data.createBlog.errors);
                        alert.show(errorMessages, { variant: 'danger' });
                    }
                }
            },
        );
        handler();
    }, [setError, alert, validate, id, updateBlogMutate, createBlogMutate, navigate]);

    const departmentOptions = useMemo(
        () => departmentAndDirective?.departments.results.map((dept) => ({
            id: dept.id,
            name: dept.title,
        })) ?? [],
        [departmentAndDirective?.departments.results],
    );

    const directiveOptions = useMemo(
        () => departmentAndDirective?.strategicDirectives.results.map((directive) => ({
            id: directive.id,
            name: directive.title,
        })) ?? [],
        [departmentAndDirective?.strategicDirectives.results],
    );

    const statusOptions = useMemo(
        () => Object.values(StatusEnum).map((status) => ({
            value: status,
            label: status,
        })),
        [],
    );

    useEffect(() => {
        if (isNotDefined(data?.blog)) {
            return;
        }
        const {
            modifiedBy, createdBy, departmentId, directiveId, ...other
        } = removeNull(data.blog);

        setValue({
            ...other,
            department: departmentId,
            directive: directiveId,
            modifiedBy: `${modifiedBy.firstName} ${modifiedBy.lastName}`,
            createdBy: `${createdBy.firstName} ${createdBy.lastName}`,
        });
    }, [data, setValue]);

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
                <FormSection headingLevel={3} label={id ? 'BLOG DETAIL' : 'CREATE BLOG'} />
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
                <FormSection label="Title" description="Enter the title name of the Blog" withAsteriskOnTitle>
                    <TextInput
                        name="title"
                        autoFocus
                        value={value.title}
                        error={error?.title as string}
                        onChange={setFieldValue}
                        placeholder="title"
                    />
                </FormSection>
                <FormSection label="Published Date" description="This date should be the Published Date of the blog" withAsteriskOnTitle>
                    <DateInput
                        name="publishedDate"
                        value={value.publishedDate}
                        onChange={setFieldValue}
                        placeholder="Select Date"
                        error={error?.publishedDate as string}
                    />
                </FormSection>
                <FormSection label="Author" description="Author name should be the person who wrote the blog" withAsteriskOnTitle>
                    <TextInput
                        name="author"
                        value={value.author}
                        onChange={setFieldValue}
                        error={error?.author as string}
                        placeholder="author"
                    />
                </FormSection>
                <FormSection label="Cover photo" description="Add a cover photo, which will be displayed on top" withAsteriskOnTitle>
                    <FileUpload
                        name="coverImage"
                        onChange={(files) => setFieldValue(files, 'coverImage')}
                        value={value.coverImage}
                        error={error?.coverImage as string}
                    />
                </FormSection>
                <FormSection label="Featured" description="Click on the checkbox if the blog is to be featured" withAsteriskOnTitle>
                    <Checkbox
                        name="featured"
                        label="Feature"
                        onChange={setFieldValue}
                        value={value.featured}
                        error={error?.featured}
                    />
                </FormSection>
                <FormSection label="Status" description="Add status to either draft, publish or archived" withAsteriskOnTitle>
                    <SelectInput
                        name="status"
                        options={statusOptions}
                        value={value.status}
                        keySelector={(o) => o.label}
                        labelSelector={(o) => o.value}
                        onChange={setFieldValue}
                        placeholder="Select Status"
                        error={error?.status}
                    />
                </FormSection>
                <Activity mode={value.slug ? 'visible' : 'hidden'}>
                    <FormSection label="Slug" description="Unique URL identifier for the blog">
                        <TextInput
                            name="slug"
                            value={value.slug ?? ''}
                            onChange={(val) => setFieldValue(val || null, 'slug')}
                            error={error?.slug}
                            readOnly
                        />
                    </FormSection>
                </Activity>
                <FormSection label="Strategic Directive (NS)" description="Select under which strategic directive it belongs">
                    <SelectInput
                        name="directive"
                        options={directiveOptions}
                        value={value.directive}
                        keySelector={(option) => option.id}
                        labelSelector={(option) => option.name}
                        onChange={setFieldValue}
                        placeholder="Select Directive"
                        error={error?.directive}
                    />
                </FormSection>
                <FormSection label="Department" description="Select the department">
                    <SelectInput
                        name="department"
                        options={departmentOptions}
                        value={value.department}
                        keySelector={(option) => option.id}
                        labelSelector={(option) => option.name}
                        onChange={setFieldValue}
                        placeholder="Select Department"
                        error={error?.department}
                    />
                </FormSection>
                <FormSection label="Write blog" />
                <FormSection>{ContentEditor}</FormSection>
                <FormSection>
                    <Button name="save" onClick={handleFormSubmit} variant="primary">
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </FormSection>
            </ContainerWrapper>
        </Page>
    );
}

export default BlogForm;
