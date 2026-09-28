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
    Checkbox,
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
    emailCondition,
    getErrorObject,
    getErrorString,
    type ObjectSchema,
    type PartialForm,
    removeNull,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import FileUpload from '#components/FileUpload';
import NonFieldError from '#components/NonFieldError';
import {
    type CecMemberCreateInput,
    CecMemberTypeEnum,
    type CecMemberUpdateInput,
    useCecMemberDetailQuery,
    useCreateCecMemberMutation,
    useUpdateCecMemberMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import useUnsavedModal from '#hooks/useUnsavedModal';
import {
    ACCEPTED_IMAGE_TYPES,
    cecMemberTypeOptions,
    errorMessage,
    labelSelector,
    valueSelector,
} from '#utils/common';

type PartialFormType = PartialForm<CecMemberCreateInput>

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const CecMemberSchema: FormSchema = {
    fields: (value): FormSchemaFields => ({
        name: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        memberType: {
            required: true,
        },
        // Office bearers and staff are listed under their designation
        designation: {
            required: value?.memberType !== CecMemberTypeEnum.Member,
            requiredValidation: requiredStringCondition,
        },
        email: {
            validations: [emailCondition],
        },
        secondaryEmail: {
            validations: [emailCondition],
        },
        address: {},
        contactNumber: {},
        photo: {},
        isActive: {},
    }),
};

const defaultFormValue: PartialFormType = {
    memberType: CecMemberTypeEnum.Member,
    isActive: true,
};

function CecMemberForm() {
    const { id } = useParams();
    const navigate = useRouting();
    const { canEditContent } = usePermissions();
    const alert = useAlert();

    const [{ data, fetching: detailPending }] = useCecMemberDetailQuery({
        variables: { id: (id ?? '') },
        pause: !id,
        requestPolicy: 'network-only',
    });
    const [{ fetching: createPending }, createCecMemberMutate] = useCreateCecMemberMutation();
    const [{ fetching: updatePending }, updateCecMemberMutate] = useUpdateCecMemberMutation();
    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
        setValue,
        pristine,
    } = useForm(CecMemberSchema, { value: defaultFormValue });

    const {
        unsavedModal,
        bypassUnsavedModal,
    } = useUnsavedModal(!pristine);

    const error = getErrorObject(formError);

    const handleMutation = useCallback(async (mutationData: PartialFormType) => {
        const redirectPath = 'cecMember';
        const alertMessage = `Member ${id ? 'updated' : 'created'} successfully`;
        const { photo, ...otherMutationData } = mutationData;
        const dataToSubmit = {
            ...otherMutationData,
            photo: photo instanceof File ? photo : undefined,
        };
        const result = id
            ? (await updateCecMemberMutate({
                pk: id,
                data: dataToSubmit as CecMemberUpdateInput,
            })).data?.updateCecMember
            : (await createCecMemberMutate({
                data: dataToSubmit as CecMemberCreateInput,
            })).data?.createCecMember;

        if (result?.ok) {
            bypassUnsavedModal();
            navigate(redirectPath);
            alert.show(alertMessage, { variant: 'success' });
        } else if (result?.errors) {
            setError(result.errors);
            alert.show(result.errors?.message ?? errorMessage, { variant: 'danger' });
        } else {
            alert.show(errorMessage, { variant: 'danger' });
        }
    }, [
        alert,
        bypassUnsavedModal,
        createCecMemberMutate,
        id,
        navigate,
        setError,
        updateCecMemberMutate,
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
        if (isNotDefined(data?.cecMember)) {
            return;
        }
        setValue(removeNull(data.cecMember));
    }, [data, setValue]);

    const handleCancelClick = useCallback(() => {
        navigate('cecMember');
    }, [navigate]);

    if (!canEditContent) {
        return <Navigate to="/cec-members" replace />;
    }

    if (detailPending) {
        return (
            <BlockLoading
                withoutBorder
                compact
                message="Loading"
            />
        );
    }

    const createdBy = data?.cecMember.createdBy;
    const modifiedBy = data?.cecMember.modifiedBy;

    return (
        <Container
            withPadding
            heading={id ? 'CEC MEMBER DETAILS' : 'ADD CEC MEMBER'}
            headerDescription={id ? 'Review and update the details of this member' : 'Fill in the details below to add a new member'}
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
                        disabled={createPending || updatePending}
                    >
                        Cancel
                    </Button>
                    <Button
                        name="save"
                        onClick={handleFormSubmit}
                        styleVariant="filled"
                        disabled={createPending || updatePending}
                    >
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </ListView>
            )}
        >
            <ListView
                layout="block"
                spacing="lg"
            >
                <NonFieldError
                    error={formError}
                    withFallbackError
                />
                <Activity mode={createdBy && modifiedBy ? 'visible' : 'hidden'}>
                    <InputSection
                        title={`Created by: ${createdBy?.firstName} ${createdBy?.lastName}`}
                    >
                        <Heading level={6}>
                            {`Modified by: ${modifiedBy?.firstName} ${modifiedBy?.lastName}`}
                        </Heading>
                    </InputSection>
                </Activity>
                <InputSection
                    title="Name"
                    description="Full name including salutation, e.g. Dr. Bishal Kumar Bhandari"
                    withAsteriskOnTitle
                >
                    <TextInput
                        name="name"
                        value={value.name}
                        error={error?.name}
                        onChange={setFieldValue}
                        placeholder="Name"
                        autoFocus
                    />
                </InputSection>
                <InputSection
                    title="Member Type"
                    description="Office bearers and staff are shown under their designation; members are grouped under Members"
                    withAsteriskOnTitle
                >
                    <SelectInput
                        name="memberType"
                        options={cecMemberTypeOptions}
                        value={value.memberType}
                        keySelector={valueSelector}
                        labelSelector={labelSelector}
                        onChange={setFieldValue}
                        placeholder="Select member type"
                        error={error?.memberType}
                    />
                </InputSection>
                <InputSection
                    title="Designation"
                    description="Heading shown on the website, e.g. Chairperson, Secretary General, Governance Secretariat"
                    withAsteriskOnTitle={value.memberType !== CecMemberTypeEnum.Member}
                >
                    <TextInput
                        name="designation"
                        value={value.designation}
                        error={error?.designation}
                        onChange={setFieldValue}
                        placeholder="Designation"
                    />
                </InputSection>
                <InputSection
                    title="Email"
                    description="Primary and optional secondary email address"
                >
                    <TextInput
                        name="email"
                        value={value.email}
                        error={error?.email}
                        onChange={setFieldValue}
                        placeholder="Email"
                    />
                    <TextInput
                        name="secondaryEmail"
                        value={value.secondaryEmail}
                        error={error?.secondaryEmail}
                        onChange={setFieldValue}
                        placeholder="Secondary email"
                    />
                </InputSection>
                <InputSection
                    title="Address"
                    description="District or address of the member"
                >
                    <TextInput
                        name="address"
                        value={value.address}
                        error={error?.address}
                        onChange={setFieldValue}
                        placeholder="Address"
                    />
                </InputSection>
                <InputSection
                    title="Contact Number"
                >
                    <TextInput
                        name="contactNumber"
                        value={value.contactNumber}
                        error={error?.contactNumber}
                        onChange={setFieldValue}
                        placeholder="Contact number"
                    />
                </InputSection>
                <InputSection
                    title="Photo"
                    description="Square photo works best; a placeholder icon is shown when empty"
                >
                    <FileUpload
                        name="photo"
                        onChange={setFieldValue}
                        value={value.photo}
                        error={getErrorString(error?.photo)}
                        accept={ACCEPTED_IMAGE_TYPES}
                    />
                </InputSection>
                <InputSection
                    title="Visibility"
                    description="Uncheck to hide this member from the website without deleting it"
                >
                    <Checkbox
                        name="isActive"
                        label="Show on website"
                        onChange={setFieldValue}
                        value={value.isActive ?? false}
                        error={error?.isActive}
                    />
                </InputSection>
            </ListView>
            {unsavedModal}
        </Container>
    );
}

export default CecMemberForm;
