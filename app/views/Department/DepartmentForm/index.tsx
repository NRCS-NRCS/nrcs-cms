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
        createdBy: {},
        modifiedBy: {},
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
            <ContainerWrapper>
                <FormSection headingLevel={3} label="DEPARTMENT DETAIL" />
                {(value.createdBy && value.modifiedBy) && (
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
                )}
                <FormSection label="Title*" description="Enter the title name of the Department" withAsteriskOnTitle>
                    <TextInput
                        name="title"
                        value={value.title}
                        error={error?.title as string}
                        onChange={setFieldValue}
                    />
                </FormSection>
                <FormSection label="Department" description="Write a short description about the roles and responsibilities of the department" withAsteriskOnTitle>
                    <TextArea
                        name="department"
                        value={value.description}
                        error={error?.description as string}
                        onChange={(val) => setFieldValue(val, 'description')}
                    />
                </FormSection>
                <FormSection label="Contact Person Name" description="Add contact number of the person for the department" withAsteriskOnTitle>
                    <TextInput
                        name="contactPersonName"
                        value={value.contactPersonName}
                        onChange={setFieldValue}
                        error={error?.contactPersonName as string}
                    />
                </FormSection>
                <FormSection label="Contact Person Email" description="Add Email of the person for the department" withAsteriskOnTitle>
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
                {value.slug && (
                    <FormSection label="Slug" description="Unique URL identifier for the blog">
                        <TextInput
                            name="slug"
                            value={value.slug ?? ''}
                            onChange={(val) => setFieldValue(val || null, 'slug')}
                            error={error?.slug}
                            disabled
                        />
                    </FormSection>
                )}
                <FormSection>
                    <Button name="save" onClick={handleFormSubmit} variant="primary">
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </FormSection>
            </ContainerWrapper>
        </Page>
    );
}

export default DepartmentForm;
