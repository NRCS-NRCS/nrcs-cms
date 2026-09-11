/* eslint-disable @typescript-eslint/no-unused-vars, import/prefer-default-export */
import { gql } from 'urql';

export const DEPLOYMENTS_QUERY = gql`
    query Deployments {
        deployments {
            hasActiveRun
            workflowUrl
            results {
                id
                runNumber
                title
                branch
                event
                status
                url
                actor
                createdAt
                startedAt
                updatedAt
            }
        }
    }
`;

const TRIGGER_DEPLOYMENT_MUTATION = gql`
    mutation TriggerDeployment {
        triggerDeployment {
            ... on DeploymentTriggerTypeMutationResponseType {
                __typename
                ok
                errors
                result {
                    ref
                    workflowUrl
                }
            }
            ... on OperationInfo {
                __typename
                messages {
                    message
                }
            }
        }
    }
`;
