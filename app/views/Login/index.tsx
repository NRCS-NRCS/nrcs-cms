import {
    use,
    useCallback,
} from 'react';
import { useNavigate } from 'react-router';
import {
    Button,
    Image,
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

import banner from '../../resources/image/redCrossBanner.png';

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

    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
    } = useForm(loginFormSchema, { value: defaultLoginFormValue });

    const error = getErrorObject(formError);

    const [{ fetching }, triggerLogin] = useLoginMutation();

    const handleFormSubmit = useCallback(() => {
        const handler = createSubmitHandler(
            validate,
            setError,
            (val) => {
                triggerLogin({
                    username: val.email ?? '',
                    password: val.password ?? '',
                }).then((response) => {
                    const loginResponse = response.data?.login;
                    if (!loginResponse) return;
                    if (loginResponse) {
                        setUser({
                            id: loginResponse.id,
                            firstName: loginResponse.firstName,
                            lastName: loginResponse.lastName,
                            email: loginResponse.email,
                        });
                        navigate('/');
                    } else {
                        setError({ email: 'Failed to login!' });
                    }
                });
            },
        );
        handler();
    }, [navigate, setError, setUser, triggerLogin, validate]);

    return (
        <Page>
            <main className={styles.loginContainer}>
                <Image src={banner} />
                <form
                    className={styles.loginForm}
                    onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }}
                >
                    <div className={styles.field}>
                        <TextInput
                            name="email"
                            label="Email"
                            value={value.email}
                            onChange={setFieldValue}
                            error={error?.email}
                            autoFocus
                        />
                        <PasswordInput
                            name="password"
                            label="Password"
                            value={value.password}
                            error={error?.password}
                            onChange={setFieldValue}
                        />
                    </div>
                    <div className={styles.utilityLinks}>
                        {/* <Radio
                            name="keepme"
                            description="Keep me logged in"
                            onClick={() => { }}
                            value={false}
                        />
                        <Heading level={5}>Forgot your password/username?</Heading> */}
                    </div>
                    <div className={styles.loginBtn}>
                        <Button
                            name={undefined}
                            spacing="relaxed"
                            disabled={fetching}
                            type="submit"
                        >
                            {fetching ? 'Logging in...' : 'Login'}
                        </Button>
                    </div>
                </form>
            </main>
        </Page>
    );
}

export default Login;
