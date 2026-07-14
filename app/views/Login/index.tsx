import {
    use,
    useCallback,
    useMemo,
} from 'react';
import {
    BlockLoading,
    Button,
    Container,
    Image,
    InlineLayout,
    ListView,
    PasswordInput,
    TextInput,
} from '@ifrc-go/ui';
import {
    createSubmitHandler,
    getErrorObject,
    type ObjectSchema,
    removeNull,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';
import { gql } from 'urql';

import UserContext from '#contexts/UserContext';
import { useLoginMutation } from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import background from '#resources/image/aboutUs.jpeg';
import banner from '#resources/image/redCrossBanner.png';
import { errorMessage } from '#utils/common';

import styles from './styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGIN_MUTATION = gql`
    mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            userType
            lastName
            lastLogin
            isActive
            id
            firstName
            email
            createdAt
        }
    }
`;

interface LoginFormFields {
    username?: string;
    password?: string;
}

type LoginFormSchema = ObjectSchema<LoginFormFields>;
type LoginFormSchemaFields = ReturnType<LoginFormSchema['fields']>

const loginFormSchema: LoginFormSchema = {
    fields: (): LoginFormSchemaFields => ({
        username: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        password: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
    }),
};

const defaultLoginFormValue: LoginFormFields = {};

function Login() {
    const { setUser } = use(UserContext);
    const navigate = useRouting();
    const alert = useAlert();

    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
    } = useForm(loginFormSchema, { value: defaultLoginFormValue });

    const error = getErrorObject(formError);

    const [{ fetching: loginPending }, triggerLogin] = useLoginMutation();

    const handleMutation = useCallback(async (mutationData: LoginFormFields) => {
        try {
            const { data, error: apiError } = await triggerLogin({
                username: mutationData.username ?? '',
                password: mutationData.password ?? '',
            });

            if (apiError) {
                alert.show('Incorrect username/password', {
                    variant: 'danger',
                });
                return;
            }

            const loginResponse = data?.login;

            if (!loginResponse) {
                alert.show(errorMessage, {
                    variant: 'danger',
                });
                return;
            }

            setUser(removeNull(loginResponse));

            alert.show('Login successful!', { variant: 'success' });
            navigate('home');
        } catch {
            alert.show(errorMessage, {
                variant: 'danger',
            });
        }
    }, [alert, navigate, setUser, triggerLogin]);

    const handleFormSubmit = useMemo(
        () => createSubmitHandler(
            validate,
            setError,
            handleMutation,
        ),
        [validate, setError, handleMutation],
    );

    if (loginPending) {
        return (
            <BlockLoading
                withoutBorder
                compact
                message="Loading"
            />
        );
    }

    return (
        <ListView
            layout="grid"
            className={styles.pageContainer}
            numPreferredGridColumns={2}
        >
            <Image
                src={background}
                className={styles.image}
            />
            <form onSubmit={handleFormSubmit}>
                <Container
                    spacing="4xl"
                    withCenteredContent
                    withPadding
                    className={styles.container}
                >
                    <InlineLayout
                        contentAlignment="center"
                        contentJustification="center"
                        className={styles.login}
                    >
                        <ListView
                            layout="block"
                            spacing="md"
                        >
                            <ListView
                                layout="block"
                                spacing="none"
                            >
                                <Image
                                    withoutBackground
                                    src={banner}
                                    alt="logo"
                                />
                            </ListView>
                            <ListView
                                layout="block"
                                spacing="lg"
                            >
                                <TextInput
                                    name="username"
                                    label="Username"
                                    value={value.username}
                                    onChange={setFieldValue}
                                    error={error?.username}
                                    withAsterisk
                                    disabled={loginPending}
                                    autoFocus
                                />
                                <PasswordInput
                                    name="password"
                                    label="Password"
                                    value={value.password}
                                    onChange={setFieldValue}
                                    error={error?.password}
                                    disabled={loginPending}
                                    withAsterisk
                                />
                            </ListView>
                            <ListView
                                layout="block"
                                withCenteredContents
                            >
                                <Button
                                    name={undefined}
                                    type="submit"
                                    styleVariant="filled"
                                    disabled={loginPending}
                                >
                                    Login
                                </Button>
                            </ListView>
                        </ListView>
                    </InlineLayout>
                </Container>
            </form>
        </ListView>
    );
}

export default Login;
