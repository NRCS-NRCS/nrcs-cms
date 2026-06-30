import React, {
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
    Heading,
    InputSection,
    ListView,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import {
    isDefined,
    isNotDefined,
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
    useCreateUserMutation,
    UserCreateInput,
    UserTypeEnum,
    UserUpdateInput,
    useUpdateUserMutation,
    useUserQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    keySelector,
    labelSelector,
    transformToFormError,
} from '#utils/common';

type PartialFormType = PartialForm<UserCreateInput & UserUpdateInput>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

// password is only required when creating a brand new user
function getUserFormSchema(isEditMode: boolean): FormSchema {
    return {
        fields: (): FormSchemaFields => ({
            username: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            email: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            password: {
                required: !isEditMode,
                requiredValidation: requiredStringCondition,
            },
            firstName: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            lastName: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            userType: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            isActive: {},
        }),
    };
}

const defaultEditFormValue: PartialFormType = {
    isActive: false,
};
function UserForm() {
    const { id } = useParams();
    const isEditMode = isDefined(id);
    const alert = useAlert();
    const navigate = useRouting();

    const [{ data, fetching: userDetailFetching }] = useUserQuery({
        variables: { id: (id ?? '') },
        pause: !isEditMode,
    });
    const [{ fetching: createPending }, createUserMutate] = useCreateUserMutation();
    const [{ fetching: updatePending }, updateUserMutate] = useUpdateUserMutation();

    const userFormSchema = useMemo(
        () => getUserFormSchema(isEditMode),
        [isEditMode],
    );

    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
        setValue,
    } = useForm(userFormSchema, { value: defaultEditFormValue });

    const error = getErrorObject(formError);

    const userTypeOptions = useMemo(
        () => Object.values(UserTypeEnum).map((userType) => ({
            key: userType,
            label: userType,
        })),
        [],
    );

    const handleCreate = useCallback(async (mutationData: PartialFormType) => {
        const createPayload = removeNull(mutationData) as unknown as UserCreateInput;
        const res = await createUserMutate({ data: createPayload });
        const result = res.data?.createUser;

        if (isDefined(result) && result.ok) {
            navigate('users');
            alert.show('User created successfully', { variant: 'success' });
        } else if (isDefined(result) && isDefined(result)) {
            setError(transformToFormError(result.errors));
            alert.show(errorMessage, { variant: 'danger' });
        } else {
            alert.show(errorMessage, { variant: 'danger' });
        }
    }, [createUserMutate, navigate, alert, setError]);

    const handleUpdate = useCallback(async (mutationData: PartialFormType) => {
        if (isNotDefined(id)) {
            return;
        }
        const updatePayload = Object.fromEntries(
            Object.entries(removeNull(mutationData)).filter(([key]) => key !== 'email'),
        ) as UserUpdateInput;

        const res = await updateUserMutate({ id, data: updatePayload });
        const result = res.data?.updateUser;

        if (isDefined(result) && result.ok) {
            navigate('users');
            alert.show('User updated successfully', { variant: 'success' });
        } else if (isDefined(result) && isDefined(result.errors)) {
            setError(transformToFormError(result.errors));
            alert.show(errorMessage, { variant: 'danger' });
        } else {
            alert.show(errorMessage, { variant: 'danger' });
        }
    }, [updateUserMutate, id, navigate, alert, setError]);

    const handleFormSubmit = useCallback(
        () => createSubmitHandler(
            validate,
            setError,
            isDefined(id) ? handleUpdate : handleCreate,
        )(),
        [validate, setError, id, handleUpdate, handleCreate],
    );

    useEffect(() => {
        if (isNotDefined(data?.user)) {
            return;
        }
        const {
            username, email, firstName, lastName, userType,
        } = removeNull(data.user);
        setValue({
            username, email, firstName, lastName, userType,
        });
    }, [data, setValue]);

    if (userDetailFetching) {
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
                        {isEditMode ? 'USER DETAIL' : 'CREATE USER'}
                    </Heading>
                </InputSection>
                <Activity mode={data?.user.createdAt ? 'visible' : 'hidden'}>
                    <InputSection
                        title={`Created: ${data?.user.createdAt}`}
                    >
                        <Heading level={6}>
                            Last login:
                            {' '}
                            {data?.user.lastLogin ?? 'Never'}
                        </Heading>
                    </InputSection>
                </Activity>
                <InputSection
                    title="Username"
                    description="Unique username for the user"
                    withAsteriskOnTitle
                >
                    <TextInput
                        name="username"
                        autoFocus
                        value={value.username}
                        error={error?.username}
                        onChange={setFieldValue}
                        placeholder="username"
                    />
                </InputSection>
                <InputSection
                    title="Email"
                    description="Email address for the user"
                    withAsteriskOnTitle
                >
                    <TextInput
                        name="email"
                        value={value.email}
                        error={error?.email}
                        onChange={setFieldValue}
                        placeholder="email"
                    />
                </InputSection>
                <InputSection
                    title="Password"
                    description={isEditMode
                        ? 'Leave blank to keep the existing password'
                        : 'Set an initial password for the user'}
                    withAsteriskOnTitle={!isEditMode}
                >
                    <TextInput
                        name="password"
                        type="password"
                        value={value.password}
                        error={error?.password}
                        onChange={setFieldValue}
                        placeholder="password"
                    />
                </InputSection>
                <InputSection
                    title="First Name"
                    description="First name of the user"
                    withAsteriskOnTitle
                >
                    <TextInput
                        name="firstName"
                        value={value.firstName}
                        error={error?.firstName}
                        onChange={setFieldValue}
                        placeholder="first name"
                    />
                </InputSection>
                <InputSection
                    title="Last Name"
                    description="Last name of the user"
                    withAsteriskOnTitle
                >
                    <TextInput
                        name="lastName"
                        value={value.lastName}
                        error={error?.lastName}
                        onChange={setFieldValue}
                        placeholder="last name"
                    />
                </InputSection>
                <InputSection
                    title="User Type"
                    description="Role assigned to the user"
                    withAsteriskOnTitle
                >
                    <SelectInput
                        name="userType"
                        options={userTypeOptions}
                        value={value.userType}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        onChange={setFieldValue}
                        placeholder="Select User Type"
                        error={error?.userType}
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

export default UserForm;
