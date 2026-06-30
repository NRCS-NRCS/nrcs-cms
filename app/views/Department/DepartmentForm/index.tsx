import {
    Activity,
    useCallback,
    useEffect,
} from 'react';
import {
    Navigate,
    useParams,
} from 'react-router';
import {
    BlockLoading,
    Button,
    Container,
    Heading,
    InputSection,
    ListView,
    SelectInput,
    TextArea,
    TextInput,
} from '@ifrc-go/ui';
import {
    isNotDefined,
    noOp,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    ObjectSchema,
    PartialForm,
    removeNull,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import {
    DepartmentCreateInput,
    DepartmentUpdateInput,
    useCreateDepartmentMutation,
    useDepartmentDetailQuery,
    useDirectiveQuery,
    useUpdateDepartmentMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    idSelector,
    nameSelector,
} from '#utils/common';

type PartialFormType = PartialForm<DepartmentCreateInput>

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const DepartmentSchema: FormSchema = {
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
    }),
};

const defaultEditFormValue: PartialFormType = {};

function DepartmentForm() {
    const { id } = useParams();
    const navigate = useRouting();
    const { canEditContent } = usePermissions();
    const alert = useAlert();

    const [{ data, fetching: departmentDetailFetch }] = useDepartmentDetailQuery({
        variables: { id: (id ?? '') }, pause: !id,
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
        setValue,
    } = useForm(DepartmentSchema, { value: defaultEditFormValue });

    const error = getErrorObject(formError);

    const handleMutation = useCallback(async (mutationData: PartialFormType) => {
        const redirectPath = 'department';
        const alertMessage = `Department ${id ? 'updated' : 'created'} successfully`;

        if (id) {
            const res = await updateDepartmentMutate({
                pk: id,
                data: mutationData as DepartmentUpdateInput,
            });
            const result = res.data?.updateDepartment;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result.errors);
                alert.show(result.errors, { variant: 'danger' });
            }
        } else {
            const res = await createDepartmentMutate({
                data: mutationData as DepartmentCreateInput,
            });
            const result = res.data?.createDepartment;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result?.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        }
    }, [alert, updateDepartmentMutate, id, navigate, setError, createDepartmentMutate]);

    const handleFormSubmit = useCallback(
        () => createSubmitHandler(
            validate,
            setError,
            handleMutation,
        )(),
        [validate, setError, handleMutation],
    );

    const directiveOptions = directive?.strategicDirectives.results.map(
        (dir) => ({
            id: dir.id,
            name: dir.title,
        }),
    ) ?? [];

    useEffect(() => {
        if (isNotDefined(data?.department)) {
            return;
        }
        const {
            strategicDirectiveId, ...other
        } = removeNull(data.department);
        setValue({
            ...other,
            strategicDirective: strategicDirectiveId,
        });
    }, [data, setValue]);

    if (!canEditContent) {
        return <Navigate to="/departments" replace />;
    }

    if (departmentDetailFetch) {
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
                <InputSection title={id ? 'DEPARTMENT DETAIL' : 'CREATE DEPARTMENT'} />
                <Activity mode={data?.department.createdBy && data.department.modifiedBy ? 'visible' : 'hidden'}>
                    <InputSection title={`Created by: ${data?.department.createdBy.firstName} ${data?.department.createdBy.lastName}`}>
                        <Heading level={6}>
                            Modified by:
                            {' '}
                            {data?.department.modifiedBy.firstName}
                            {' '}
                            {data?.department.modifiedBy.lastName}
                        </Heading>
                    </InputSection>
                </Activity>
                <InputSection
                    title="Title"
                    description="Enter the title of the Department"
                    withAsteriskOnTitle
                >
                    <TextInput
                        name="title"
                        value={value.title}
                        autoFocus
                        error={error?.title}
                        onChange={setFieldValue}
                        placeholder="title"
                    />
                </InputSection>
                <InputSection
                    title="Description"
                    description="Write a short description about the roles and responsibilities of the department"
                    withAsteriskOnTitle
                >
                    <TextArea
                        name="description"
                        value={value.description}
                        placeholder="description"
                        error={error?.description}
                        onChange={setFieldValue}
                    />
                </InputSection>
                <InputSection
                    title="Contact Person Name"
                    description="Add contact number of the person for the department"
                    withAsteriskOnTitle
                >
                    <TextInput
                        name="contactPersonName"
                        placeholder="contact person name"
                        value={value.contactPersonName}
                        onChange={setFieldValue}
                        error={error?.contactPersonName}
                    />
                </InputSection>
                <InputSection
                    title="Contact Person Email"
                    description="Add Email of the person for the department"
                    withAsteriskOnTitle
                >
                    <TextInput
                        name="contactPersonEmail"
                        placeholder="contact person email"
                        value={value.contactPersonEmail ?? ''}
                        onChange={setFieldValue}
                        error={error?.contactPersonEmail}
                    />
                </InputSection>
                <InputSection
                    title="Strategic Directive (NS)"
                    description="Select under which strategic directive it belongs"
                >
                    <SelectInput
                        name="strategicDirective"
                        options={directiveOptions}
                        value={value.strategicDirective}
                        keySelector={idSelector}
                        labelSelector={nameSelector}
                        onChange={setFieldValue}
                        placeholder="Select Directive"
                        error={error?.strategicDirective}
                    />
                </InputSection>
                <Activity mode={data?.department.slug ? 'visible' : 'hidden'}>
                    <InputSection
                        title="Slug"
                        description="Unique URL identifier for the department"
                    >
                        <TextInput
                            name="slug"
                            value={data?.department.slug ?? ''}
                            onChange={noOp}
                            readOnly
                        />
                    </InputSection>
                </Activity>
                <ListView
                    withPadding
                    withBackground
                    withCenteredContents
                >
                    <Button name="save" onClick={handleFormSubmit} styleVariant="outline">
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </ListView>
            </ListView>
        </Container>
    );
}

export default DepartmentForm;
