import { use } from 'react';
import {
    Container,
    ListView,
} from '@ifrc-go/ui';

import Link from '#components/Link';
import UserContext from '#contexts/UserContext';

function NotFound() {
    const { authenticated } = use(UserContext);

    return (
        <Container
            withPadding
            withCenteredContent
            heading="Page not found"
            headerDescription="The page you are looking for does not exist, or has been moved."
        >
            <ListView withCenteredContents>
                <Link
                    to={authenticated ? 'home' : 'login'}
                    withUnderline
                >
                    {authenticated ? 'Go to the dashboard' : 'Go to login'}
                </Link>
            </ListView>
        </Container>
    );
}

export default NotFound;
