import React, {
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
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import {
    isNotDefined,
    noOp,
} from '@togglecorp/fujs';
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
import {
    type BlogCreateInput,
    type BlogUpdateInput,
    StatusEnum,
    useBlogDetailQueryQuery,
    useCreateBlogMutation,
    useDepartmentAndDirectiveQuery,
    useUpdateBlogMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import useUnsavedModal from '#hooks/useUnsavedModal';
import {
    errorMessage,
    keySelector,
    labelSelector,
} from '#utils/common';

type PartialFormType = PartialForm<BlogCreateInput>

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
            required: true,
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
    }),
};

const defaultEditFormValue: PartialFormType = {};

function BlogForm() {
    const { id } = useParams();
    const alert = useAlert();

    const navigate = useRouting();
    const { canEditContent } = usePermissions();
    const [{ data, fetching: blogDetailFetch }] = useBlogDetailQueryQuery({
        variables: { id: (id ?? '') }, pause: !id,
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
        pristine,
    } = useForm(EditBlogSchema, { value: defaultEditFormValue });

    const {
        unsavedModal,
        bypassUnsavedModal,
    } = useUnsavedModal(!pristine);

    const error = getErrorObject(formError);

    const handleMutation = useCallback(async (mutationData: PartialFormType) => {
        const redirectPath = 'blog';
        const alertMessage = `Blog ${id ? 'updated' : 'created'} successfully`;
        const { coverImage, ...otherMutationData } = mutationData;

        const dataToSubmit = {
            ...otherMutationData,
            coverImage: coverImage instanceof File ? coverImage : undefined,
        };
        if (id) {
            const res = await updateBlogMutate({
                pk: id,
                data: dataToSubmit as BlogUpdateInput,
            });
            const result = res.data?.updateBlog;
            if (result?.ok) {
                bypassUnsavedModal();
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        } else {
            const res = await createBlogMutate({
                data: dataToSubmit as BlogCreateInput,
            });
            const result = res.data?.createBlog;
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
        createBlogMutate,
        id,
        navigate,
        setError,
        updateBlogMutate,
    ]);

    const handleFormSubmit = useCallback(
        () => createSubmitHandler(
            validate,
            setError,
            handleMutation,
        )(),
        [validate, setError, handleMutation],
    );

    const departmentOptions = useMemo(
        () => departmentAndDirective?.departments.results.map((dept) => ({
            key: dept.id,
            label: dept.title,
        })) ?? [],
        [departmentAndDirective?.departments.results],
    );

    const directiveOptions = useMemo(
        () => departmentAndDirective?.strategicDirectives.results.map((directive) => ({
            key: directive.id,
            label: directive.title,
        })) ?? [],
        [departmentAndDirective?.strategicDirectives.results],
    );

    const statusOptions = useMemo(
        () => Object.values(StatusEnum).map((status) => ({
            key: status,
            label: status,
        })),
        [],
    );

    useEffect(() => {
        if (isNotDefined(data?.blog)) {
            return;
        }
        const {
            departmentId, directiveId, ...other
        } = removeNull(data.blog);

        setValue({
            ...other,
            department: departmentId,
            directive: directiveId,
        });
    }, [data, setValue]);

    if (!canEditContent) {
        return <Navigate to="/blog" replace />;
    }

    if (blogDetailFetch) {
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
            <ListView
                layout="block"
                spacing="lg"
            >
                <InputSection withoutTitleSection>
                    <Heading level={4}>
                        {id ? 'BLOG DETAIL' : 'CREATE BLOG'}
                    </Heading>
                </InputSection>
                <Activity mode={data?.blog.createdBy && data?.blog.modifiedBy ? 'visible' : 'hidden'}>
                    <InputSection
                        title={`Created by: ${data?.blog.createdBy.firstName}`}
                    >
                        <Heading level={6}>
                            Modified by:
                            {' '}
                            {data?.blog.createdBy.lastName}
                        </Heading>
                    </InputSection>
                </Activity>
                <InputSection
                    title="Title"
                    description="Enter the title of the Blog"
                    withAsteriskOnTitle
                >
                    <TextInput
                        name="title"
                        autoFocus
                        value={value.title}
                        error={error?.title}
                        onChange={setFieldValue}
                        placeholder="title"
                    />
                </InputSection>
                <InputSection
                    title="Published Date"
                    description="This date should be the Published Date of the blog"
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
                    title="Author"
                    description="Author name should be the person who wrote the blog"
                    withAsteriskOnTitle
                >
                    <TextInput
                        name="author"
                        value={value.author}
                        onChange={setFieldValue}
                        error={error?.author}
                        placeholder="author"
                    />
                </InputSection>
                <InputSection
                    title="Cover photo"
                    description="Add a cover photo, which will be displayed on top"
                    withAsteriskOnTitle
                >
                    <FileUpload
                        name="coverImage"
                        onChange={setFieldValue}
                        value={value.coverImage}
                        error={getErrorString(error?.coverImage)}
                        accept="image/*"
                    />
                </InputSection>
                <InputSection
                    title="Featured"
                    description="Click on the checkbox if the blog is to be featured"
                    withAsteriskOnTitle
                >
                    <Checkbox
                        name="featured"
                        label="Feature"
                        onChange={setFieldValue}
                        value={value.featured}
                        error={error?.featured}
                    />
                </InputSection>
                <InputSection
                    title="Status"
                    description="Add status to either draft, publish or archived"
                    withAsteriskOnTitle
                >
                    <SelectInput
                        name="status"
                        options={statusOptions}
                        value={value.status}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        onChange={setFieldValue}
                        placeholder="Select Status"
                        error={error?.status}

                    />
                </InputSection>
                <Activity mode={data?.blog.slug ? 'visible' : 'hidden'}>
                    <InputSection title="Slug" description="Unique URL identifier for the blog">
                        <TextInput
                            name="slug"
                            value={data?.blog.slug ?? ''}
                            onChange={noOp}
                            readOnly
                        />
                    </InputSection>
                </Activity>
                <InputSection
                    title="Strategic Directive (NS)"
                    description="Select under which strategic directive it belongs"
                >
                    <SelectInput
                        name="directive"
                        options={directiveOptions}
                        value={value.directive}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        onChange={setFieldValue}
                        placeholder="Select Directive"
                        error={error?.directive}
                    />
                </InputSection>
                <InputSection
                    title="Department"
                    description="Select the department"
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
                <InputSection withoutTitleSection>
                    <Heading level={5}>
                        Write Blogs
                    </Heading>
                </InputSection>
                <MarkdownEditor
                    name="content"
                    value={value.content}
                    onChange={setFieldValue}
                    error={error?.content}
                    placeholder="Start writing blog here..."
                />
                <ListView
                    withFullWidth
                    withCenteredContents
                    withBackground
                    withPadding
                >
                    <Button name="save" onClick={handleFormSubmit} styleVariant="outline">
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </ListView>
            </ListView>
            {unsavedModal}
        </Container>
    );
}

export default BlogForm;
