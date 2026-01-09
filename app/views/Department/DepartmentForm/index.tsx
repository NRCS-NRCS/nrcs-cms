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
    Container,
    Heading,
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

import FormSection from '#components/FormSection';
import Page from '#components/Page';
import RichTextEditor from '#components/RichTextEditor';
import {
    DepartmentCreateInput,
    useCreateDepartmentMutation,
    useDepartmentDetailQuery,
    useDirectiveQuery,
    useUpdateDepartmentMutation,
} from '#generated/types/graphql';

import styles from './styles.module.css';

type PartialFormType = PartialForm<DepartmentCreateInput> &
{ createdBy: string, modifiedBy: string, slug: string | null }

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const EditBlogSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        contactPersonEmail: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        description: {
            required: false,
            requiredValidation: requiredStringCondition,
        },
        contactPersonName: {
            required: false,
        },
        strategicDirective: {
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
            required: false,
            requiredValidation: requiredStringCondition,
        },

    }),
};

const defaultEditFormValue: PartialFormType = {
    createdBy: '',
    modifiedBy: '',
    slug: '',
};
function DepartmentForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [{ data }] = useDepartmentDetailQuery({
        variables: { id: id || '' }, pause: !id,
    });
    const [{ data: directive }] = useDirectiveQuery();
    const [{ fetching: createPending }, createDepartmentMutate] = useCreateDepartmentMutation();
    const [{ fetching: updatePending }, updateDepartmentMutate] = useUpdateDepartmentMutation();
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
                    contactPersonName: val.contactPersonName ?? '',
                    contactPersonEmail: val.contactPersonEmail ?? '',
                    strategicDirective: val.strategicDirective ?? '',
                    title: val.title ?? '',
                    description: val.description ?? '',
                };
                if (id) {
                    const res = await updateDepartmentMutate({
                        pk: id,
                        data: mutateData,
                    });
                    if (res.data?.updateDepartment?.ok) {
                        navigate('/departments');
                    } else if (res.data?.updateDepartment) {
                        setError(res.data.updateDepartment.errors);
                    }
                } else {
                    const res = await createDepartmentMutate({
                        data: mutateData,
                    });

                    if (res.data?.createDepartment.ok) {
                        navigate('/departments');
                    } else if (res.data?.createDepartment?.errors) {
                        setError(res.data.createDepartment.errors);
                    }
                }
            },
        );
        handler();
    }, [setError, validate, id, createDepartmentMutate, updateDepartmentMutate, navigate]);

    const directiveOptions = directive?.strategicDirectives.results.map(
        (dir) => ({
            id: dir.id,
            name: dir.title,
        }),
    ) ?? [];

    useEffect(() => {
        if (data?.department) {
            const { department } = data;
            setFieldValue(department.title, 'title');
            setFieldValue(department.contactPersonEmail, 'contactPersonEmail');
            setFieldValue(department.contactPersonName, 'contactPersonName');
            setFieldValue(department.description, 'description');
            setFieldValue(department.strategicDirectiveId ?? '', 'strategicDirective');
            setFieldValue(department.slug ?? '', 'slug');
            setFieldValue(`${department.modifiedBy.firstName} ${department.modifiedBy.lastName}`, 'modifiedBy');
            setFieldValue(`${department.createdBy.firstName} ${department.createdBy.lastName}`, 'createdBy');
        }
    }, [data, setFieldValue]);
    return (
        <Page>
            <Container
                className={styles.container}
                childrenContainerClassName={styles.containerChild}
            >
                <FormSection headingLevel={3} label="DEPARTMENT DETAIL" />
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
                <FormSection label="Title*" description="Enter the title name of the Department">
                    <TextInput
                        name="title"
                        value={value.title}
                        error={error?.title as string}
                        onChange={setFieldValue}
                    />
                </FormSection>
                <div>
                    <RichTextEditor
                        value={value.description}
                        onChange={(val) => setFieldValue(val, 'description')}
                    />
                </div>
                <FormSection label="Contact Person Name*" description="Author name should be the person who wrote the blog">
                    <TextInput
                        name="contactPersonName"
                        value={value.contactPersonName}
                        onChange={setFieldValue}
                        error={error?.contactPersonName as string}
                    />
                </FormSection>
                <FormSection label="Contact Person Email*" description="Unique URL identifier for the blog">
                    <TextInput
                        name="contactPersonEmail"
                        value={value.contactPersonEmail ?? ''}
                        onChange={setFieldValue}
                        error={error?.contactPersonEmail}
                    />
                </FormSection>
                <FormSection label="Strategic Directive (NS)" description="Select under which strategic directive it belongs">
                    <SelectInput
                        name="strategicDirective"
                        options={directiveOptions}
                        value={value.strategicDirective}
                        keySelector={(option) => option.id}
                        labelSelector={(option) => option.name}
                        onChange={setFieldValue}
                        placeholder="Select Directive"
                        error={error?.strategicDirective}
                    />
                </FormSection>
                <FormSection label="Slug*" description="Unique URL identifier for the blog">
                    <TextInput
                        name="slug"
                        value={value.slug ?? ''}
                        onChange={(val) => setFieldValue(val || null, 'slug')}
                        error={error?.slug}
                        disabled
                    />
                </FormSection>
                <div className={styles.submitBtn}>
                    <Button name="save" onClick={handleFormSubmit} variant="primary">
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </div>
            </Container>
        </Page>
    );
}

export default DepartmentForm;
