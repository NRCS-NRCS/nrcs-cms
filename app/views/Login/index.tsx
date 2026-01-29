import {
    use,
    useCallback,
} from 'react';
import { useNavigate } from 'react-router';
import {
    Button,
    Image,
    ListView,
    PasswordInput,
    TextInput,
} from '@ifrc-go/ui';
import {
    createSubmitHandler,
    getErrorObject,
    type ObjectSchema,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';
import { gql } from 'urql';

import Page from '#components/Page';
import UserContext from '#contexts/UserContext';
import { useLoginMutation } from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import banner from '#resources/image/redCrossBanner.png';

import styles from './styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGIN_MUTATION = gql`
    mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            email
            firstName
            id
            lastName
        }
    }
`;

interface LoginFormFields {
    email?: string;
    password?: string;
}

type LoginFormSchema = ObjectSchema<LoginFormFields>;
type LoginFormSchemaFields = ReturnType<LoginFormSchema['fields']>

const loginFormSchema: LoginFormSchema = {
    fields: (): LoginFormSchemaFields => ({
        email: {
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
    const navigate = useNavigate();
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

    const handleFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const handler = createSubmitHandler(
            validate,
            setError,
            async (val) => {
                try {
                    const { data, error: apiError } = await triggerLogin({
                        username: val.email ?? '',
                        password: val.password ?? '',
                    });

                    if (apiError) {
                        alert.show('Incorrect username/password', {
                            variant: 'danger',
                        });
                        return;
                    }

                    const loginResponse = data?.login;

                    if (!loginResponse) {
                        alert.show('Something went wrong. Please try again.', {
                            variant: 'danger',
                        });
                        return;
                    }

                    setUser({
                        id: loginResponse.id,
                        firstName: loginResponse.firstName,
                        lastName: loginResponse.lastName,
                        email: loginResponse.email,
                    });

                    alert.show('Login successful!', { variant: 'success' });
                    navigate('/');
                } catch {
                    alert.show('Something went wrong. Please try again.', {
                        variant: 'danger',
                    });
                }
            },
        );

        handler();
    }, [validate, setError, triggerLogin, setUser, navigate, alert]);

    return (
        <Page>
            <main className={styles.loginContainer}>
                <Image src={banner} size="sm" withContainedFit withoutBackground />
                <form
                    className={styles.loginForm}
                    onSubmit={handleFormSubmit}
                >
                    <ListView
                        layout="block"
                    >
                        <TextInput
                            name="email"
                            label="Email"
                            value={value.email}
                            onChange={setFieldValue}
                            error={error?.email}
                            autoFocus
                            withAsterisk

                        />
                        <PasswordInput
                            name="password"
                            label="Password"
                            value={value.password}
                            error={error?.password}
                            onChange={setFieldValue}
                            withAsterisk
                        />
                    </ListView>
                    <ListView layout="block" withCenteredContents>
                        <Button
                            name={undefined}
                            styleVariant="filled"
                            spacing="sm"
                            disabled={loginPending}
                            type="submit"
                        >
                            {loginPending ? 'Logging in...' : 'Login'}
                        </Button>
                    </ListView>
                </form>
            </main>
        </Page>
    );
}

export default Login;
