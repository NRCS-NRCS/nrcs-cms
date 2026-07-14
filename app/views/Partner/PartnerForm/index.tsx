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
import {
    type PartnerCreateInput,
    PartnerScopeEnum,
    type PartnerUpdateInput,
    useCreatePartnerMutation,
    usePartnerDetailQuery,
    useUpdatePartnerMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    keySelector,
    labelSelector,
} from '#utils/common';

type PartialFormType = PartialForm<PartnerCreateInput>

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const PartnerSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        scope: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        image: {
            required: true,
        },
    }),
};

const defaultEditFormValue: PartialFormType = {};

function PartnerForm() {
    const { id } = useParams();
    const navigate = useRouting();
    const { canEditContent } = usePermissions();
    const alert = useAlert();

    const [{ data, fetching: partnerDetailFetch }] = usePartnerDetailQuery({
        variables: { id: (id ?? '') }, pause: !id,
    });
    const [{ fetching: createPending }, createPartnerMutate] = useCreatePartnerMutation();
    const [{ fetching: updatePending }, updatePartnerMutate] = useUpdatePartnerMutation();
    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
        setValue,
    } = useForm(PartnerSchema, { value: defaultEditFormValue });

    const error = getErrorObject(formError);

    const handleMutation = useCallback(async (mutationData: PartialFormType) => {
        const redirectPath = 'partner';
        const alertMessage = `Partner ${id ? 'updated' : 'created'} successfully`;
        const { image, ...otherMutationData } = mutationData;
        const dataToSubmit = {
            ...otherMutationData,
            image: image instanceof File ? image : undefined,
        };
        if (id) {
            const res = await updatePartnerMutate({
                pk: id,
                data: dataToSubmit as PartnerUpdateInput,
            });
            const result = res.data?.updatePartner;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        } else {
            const res = await createPartnerMutate({
                data: dataToSubmit as PartnerCreateInput,
            });
            const result = res.data?.createPartner;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result?.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        }
    }, [alert, createPartnerMutate, id, navigate, setError, updatePartnerMutate]);

    const handleFormSubmit = useCallback(
        () => createSubmitHandler(
            validate,
            setError,
            handleMutation,
        )(),
        [validate, setError, handleMutation],
    );

    useEffect(() => {
        if (isNotDefined(data?.partner)) {
            return;
        }
        setValue(removeNull(data.partner));
    }, [data, setValue]);

    const scopeOptions = useMemo(() => Object.values(PartnerScopeEnum).map((scope) => ({
        key: scope,
        label: scope,
    })), []);

    if (!canEditContent) {
        return <Navigate to="/partners" replace />;
    }

    if (partnerDetailFetch) {
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
                        {id ? 'PARTNER DETAILS' : 'CREATE PARTNER'}
                    </Heading>
                </InputSection>
                <Activity mode={data?.partner.createdBy && data?.partner.modifiedBy ? 'visible' : 'hidden'}>
                    <InputSection
                        title={`Created by: ${data?.partner.createdBy.firstName}`}
                    >
                        <Heading level={6}>
                            Modified by:
                            {' '}
                            {data?.partner.createdBy.lastName}
                        </Heading>
                    </InputSection>
                </Activity>
                <InputSection
                    title="Title"
                    description="Enter the title name of the Partner"
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
                    title="Scope"
                    description="Add scope to either global or local"
                    withAsteriskOnTitle
                >
                    <SelectInput
                        name="scope"
                        options={scopeOptions}
                        value={value.scope}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        onChange={setFieldValue}
                        placeholder="Select Status"
                        error={error?.scope}
                    />
                </InputSection>
                <InputSection
                    title="Partner Logo"
                    description="Add a Partner Logo, which will be displayed in Partner Section"
                    withAsteriskOnTitle
                >
                    <FileUpload
                        name="image"
                        onChange={setFieldValue}
                        value={value.image}
                        error={getErrorString(error?.image)}
                        accept="image/*"
                    />
                </InputSection>
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
        </Container>
    );
}

export default PartnerForm;
