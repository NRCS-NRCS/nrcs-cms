import {
    useCallback,
    useEffect,
} from 'react';
import {
    useNavigate,
    useParams,
} from 'react-router';
import {
    Button,
    Checkbox,
    Container,
    DateInput,
    Heading,
    RawFileInput,
    SelectInput,
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
import { gql } from 'urql';

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

import styles from './styles.module.css';

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
        createdBy: {
            required: false,
            requiredValidation: requiredStringCondition,
        },
        modifiedBy: {
            required: false,
            requiredValidation: requiredStringCondition,
        },
        slug: {
            required: true,
            requiredValidation: requiredStringCondition,
        },

    }),
};

const defaultEditFormValue: PartialFormType = {
    createdBy: '',
    modifiedBy: '',
    slug: '',
};

const BLOG_DETAIL_QUERY = gql`
  query BlogDetailQuery($id: ID!) {
    blog(id: $id) {
      author
      content
      coverImage {
        name
        size
        url
      }
      departmentId
      directiveId
      featured
      id
      modifiedBy {
        firstName
        lastName
      }
      publishedDate
      slug
      status
      title
      createdBy {
        firstName
        lastName
      }
    }
  }
`;

const DEPARTMENT_AND_DIRECTIVE = gql`
  query DepartmentAndDirective {
    departments {
      id
      description
      title
      strategicDirectiveId
    }
    strategicDirectives {
      id
      title
    }
  }
`;

const CREATE_BLOG_MUTATION = gql`
  mutation CreateBlog($data: BlogCreateInput!) {
    createBlog(data: $data) {
      ... on BlogTypeMutationResponseType {
        errors
        ok
      }
    }
  }
`;

export const UPDATE_BLOG_MUTATION = gql`
  mutation UpdateBlog($pk: ID!, $data: BlogUpdateInput!) {
    updateBlog(pk: $pk, data: $data) {
      ... on BlogTypeMutationResponseType {
        errors
        ok
      }
    }
  }
`;

function BlogForm() {
    const { id } = useParams();
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
                        navigate('/cm/blog');
                    } else if (res.data?.updateBlog?.errors) {
                        setError(res.data.updateBlog.errors);
                    }
                } else {
                    const res = await createBlogMutate({
                        data: mutateData,
                    });

                    if (!res.data?.createBlog.ok) {
                        navigate('/cm/blog');
                    } else if (res.data?.createBlog?.errors) {
                        setError(res.data.createBlog.errors);
                    }
                }
            },
        );
        handler();
    }, [setError, validate, id, updateBlogMutate, createBlogMutate, navigate]);

    const departmentOptions = departmentAndDirective?.departments.map(
        (dept) => ({
            id: dept.id,
            name: dept.title,
        }),
    ) ?? [];

    const directiveOptions = departmentAndDirective?.strategicDirectives.map(
        (directive) => ({
            id: directive.id,
            name: directive.title,
        }),
    ) ?? [];

    const statusOptions = Object.values(StatusEnum).map((status) => ({
        value: status,
        label: status,
    }));

    useEffect(() => {
        if (data?.blog) {
            const { blog } = data;
            setFieldValue(blog.author, 'author');
            setFieldValue(blog.title, 'title');
            setFieldValue(blog.content, 'content');
            setFieldValue(blog.coverImage, 'coverImage');
            setFieldValue(blog.status, 'status');
            setFieldValue(blog.publishedDate, 'publishedDate');
            setFieldValue(blog.departmentId, 'department');
            setFieldValue(blog.directiveId, 'directive');
            setFieldValue(blog.featured, 'featured');
            setFieldValue(`${blog.modifiedBy.firstName} ${blog.modifiedBy.lastName}`, 'modifiedBy');
            setFieldValue(blog.slug, 'slug');
            setFieldValue(`${blog.createdBy.firstName} ${blog.createdBy.lastName}`, 'createdBy');
        }
    }, [data, setFieldValue]);
    return (
        <Page>
            <Container
                className={styles.container}
                childrenContainerClassName={styles.containerChild}
            >
                <FormSection headingLevel={3} label="BLOG DETAIL" />
                {(value.createdBy && value.modifiedBy) && (
                    <FormSection inputClassName={styles.inputClassName}>
                        <div>
                            <Heading level={6}>Created by:</Heading>
                            <Heading level={6}>{value.createdBy}</Heading>
                        </div>
                        <div>
                            <Heading level={6}>Modified by:</Heading>
                            <Heading level={6}>{value.createdBy}</Heading>
                        </div>
                    </FormSection>
                )}
                <FormSection label="Title*" description="Enter the title name of the Blog">
                    <TextInput
                        name="title"
                        value={value.title}
                        error={error?.title as string}
                        onChange={setFieldValue}
                    />
                </FormSection>
                <FormSection label="Published Date*" description="This date should be the Published Date of the blog">
                    <DateInput
                        name="publishedDate"
                        value={value.publishedDate}
                        onChange={setFieldValue}
                        placeholder="Select Date"
                        error={error?.publishedDate as string}
                    />
                </FormSection>
                <FormSection label="Author*" description="Author name should be the person who wrote the blog">
                    <TextInput
                        name="author"
                        value={value.author}
                        onChange={setFieldValue}
                        error={error?.author as string}
                    />
                </FormSection>
                <FormSection label="Cover photo*" description="Add a cover photo, which will be displayed on top">
                    <RawFileInput
                        name="coverImage"
                        onChange={(files) => setFieldValue(files, 'coverImage')}
                        variant="secondary"
                    >
                        Upload
                    </RawFileInput>
                    {value.coverImage?.name && <p>{value.coverImage.name}</p>}
                </FormSection>
                <FormSection label="Featured*" description="Click on the checkbox if the blog is to be featured">
                    <Checkbox
                        name="featured"
                        label="Feature"
                        onChange={setFieldValue}
                        value={value.featured}
                        error={error?.featured}
                    />
                </FormSection>
                <FormSection label="Status*" description="Add status to either draft, publish or archived">
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
                <FormSection label="Slug*" description="Unique URL identifier for the blog">
                    <TextInput
                        name="slug"
                        value={value.slug ?? ''}
                        onChange={(val) => setFieldValue(val || null, 'slug')}
                        error={error?.slug}
                    />
                </FormSection>
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
                <div>
                    <RichTextEditor
                        value={value.content}
                        onChange={(val) => setFieldValue(val, 'content')}
                    />
                </div>
                <div className={styles.submitBtn}>
                    <Button name="save" onClick={handleFormSubmit} variant="primary">
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </div>
            </Container>
        </Page>
    );
}

export default BlogForm;
