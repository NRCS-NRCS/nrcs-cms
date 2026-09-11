import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { RefreshLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    DateOutput,
    type DateOutputProps,
    Message,
    Table,
} from '@ifrc-go/ui';
import {
    createElementColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { useQuery } from 'urql';

import Link, { type Props as LinkProps } from '#components/Link';
import {
    type DeploymentsQuery,
    useTriggerDeploymentMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePermissions from '#hooks/usePermissions';
import { errorMessage } from '#utils/common';

import DeploymentStatusCell, { type Props as DeploymentStatusCellProps } from './DeploymentStatusCell';
import { DEPLOYMENTS_QUERY } from './query';

import styles from './styles.module.css';

type DeploymentItem = NonNullable<DeploymentsQuery['deployments']>['results'][number];

const DATE_TIME_FORMAT = 'dd MMM yyyy, hh:mm aaa';
const POLL_INTERVAL = 10 * 1000;
const AWAITING_RUN_TIMEOUT = 2 * 60 * 1000;

interface PendingTrigger {
    afterRunId: string | undefined;
}

const deploymentKeySelector = (deployment: DeploymentItem) => deployment.id;

function getTriggerLabel(event: string) {
    if (event === 'workflow_dispatch') {
        return 'Manual';
    }
    if (event === 'push') {
        return 'Automatic (push)';
    }
    return event;
}

function getServerErrorMessage(errors: unknown) {
    if (!Array.isArray(errors)) {
        return undefined;
    }
    const [firstError] = errors as { messages?: string | null }[];
    return firstError?.messages ?? undefined;
}

function Deployments() {
    const alert = useAlert();
    const { canTriggerDeployment } = usePermissions();
    const [pendingTrigger, setPendingTrigger] = useState<PendingTrigger>();
    const backstopRef = useRef<number>(undefined);

    useEffect(() => () => window.clearTimeout(backstopRef.current), []);

    const [{ fetching, data, error }, reExecuteQuery] = useQuery<DeploymentsQuery>({
        query: DEPLOYMENTS_QUERY,
    });

    const [{ fetching: triggering }, triggerDeployment] = useTriggerDeploymentMutation();

    const refetch = useCallback(
        () => reExecuteQuery({ requestPolicy: 'network-only' }),
        [reExecuteQuery],
    );

    const errorDescription = error?.graphQLErrors[0]?.message
        ?? error?.message
        ?? 'The deployment list could not be loaded. This does not mean the site is down.';

    const deployments = data?.deployments;
    const hasActiveRun = deployments?.hasActiveRun ?? false;
    const latestRunId = deployments?.results[0]?.id;

    const awaitingRun = isDefined(pendingTrigger) && latestRunId === pendingTrigger.afterRunId;

    const isDeploying = hasActiveRun || awaitingRun;

    useEffect(() => {
        if (!isDeploying) {
            return undefined;
        }
        const interval = setInterval(refetch, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [isDeploying, refetch]);

    const handleTriggerClick = useCallback(
        async () => {
            const response = await triggerDeployment({});
            const result = response.data?.triggerDeployment;

            if (result && 'ok' in result && result.ok) {
                setPendingTrigger({ afterRunId: latestRunId });
                window.clearTimeout(backstopRef.current);
                backstopRef.current = window.setTimeout(
                    () => setPendingTrigger(undefined),
                    AWAITING_RUN_TIMEOUT,
                );
                refetch();
                alert.show(
                    `Deployment triggered on ${result.result?.ref ?? 'the default branch'}.`,
                    { variant: 'success' },
                );
                return;
            }

            const serverMessage = result && 'messages' in result
                ? result.messages[0]?.message
                : getServerErrorMessage(result?.errors);

            alert.show(serverMessage ?? errorMessage, { variant: 'danger' });
        },
        [triggerDeployment, refetch, alert, latestRunId],
    );

    const columns = useMemo(() => [
        createStringColumn<DeploymentItem, string>(
            'runNumber',
            'Run',
            (deployment) => `#${deployment.runNumber}`,
        ),
        createElementColumn<DeploymentItem, string, LinkProps>(
            'title',
            'Title',
            Link,
            (_, deployment) => ({
                external: true,
                href: deployment.url,
                withLinkIcon: true,
                children: deployment.title || `Run #${deployment.runNumber}`,
            }),
        ),
        createElementColumn<DeploymentItem, string, DeploymentStatusCellProps>(
            'status',
            'Status',
            DeploymentStatusCell,
            (_, deployment) => ({ status: deployment.status }),
        ),
        createStringColumn<DeploymentItem, string>(
            'branch',
            'Branch',
            (deployment) => deployment.branch,
        ),
        createStringColumn<DeploymentItem, string>(
            'event',
            'Triggered by',
            (deployment) => getTriggerLabel(deployment.event),
        ),
        createStringColumn<DeploymentItem, string>(
            'actor',
            'GitHub actor',
            (deployment) => deployment.actor,
        ),
        createElementColumn<DeploymentItem, string, DateOutputProps>(
            'startedAt',
            'Started',
            DateOutput,
            (_, deployment) => ({
                value: deployment.startedAt ?? deployment.createdAt,
                format: DATE_TIME_FORMAT,
                invalidText: '-',
            }),
        ),
    ], []);

    const triggerButton = canTriggerDeployment ? (
        <Button
            name="triggerDeployment"
            styleVariant="filled"
            onClick={handleTriggerClick}
            disabled={isDeploying || triggering || isNotDefined(deployments)}
        >
            {isDeploying ? 'Deploying...' : 'Deploy site'}
        </Button>
    ) : undefined;

    return (
        <Container
            withPadding
            heading="Deployments"
            headerDescription={(
                <>
                    Recent runs of the public site&apos;s deployment workflow.
                    {' '}
                    {canTriggerDeployment
                        ? 'Deploy to publish content changes to the live site.'
                        : 'Only admins and staff can start a deployment.'}
                </>
            )}
            headerActions={(
                <div className={styles.headerActions}>
                    <Button
                        name="refresh"
                        styleVariant="transparent"
                        before={(<RefreshLineIcon />)}
                        onClick={refetch}
                        disabled={fetching}
                    >
                        Refresh
                    </Button>
                    {triggerButton}
                </div>
            )}
            footerActions={deployments ? (
                <Link
                    external
                    href={deployments.workflowUrl}
                    withLinkIcon
                >
                    View workflow on GitHub
                </Link>
            ) : undefined}
        >
            {error ? (
                <Message
                    variant="error"
                    title="Couldn't load deployments"
                    description={errorDescription}
                    actions={(
                        <Button
                            name="retry"
                            styleVariant="outline"
                            onClick={refetch}
                        >
                            Retry
                        </Button>
                    )}
                />
            ) : (
                <Table
                    keySelector={deploymentKeySelector}
                    columns={columns}
                    data={deployments?.results}
                    filtered={false}
                    pending={fetching && isNotDefined(data)}
                    resizableColumn
                />
            )}
        </Container>
    );
}

export default Deployments;
