/* eslint-disable @typescript-eslint/no-unused-vars, import/prefer-default-export */
import { gql } from 'urql';

export const PROJECT_QUERY = gql`
    query Project($pagination: OffsetPaginationInput, $filters: ProjectFilter) {
        projects(pagination: $pagination, filters: $filters) {
            pageInfo {
                limit
                offset
            }
            totalCount
            results {
                id
                title
                department {
                    id
                    title
                }
            }
        }
    }
`;

const PROJECT_DETAIL_QUERY = gql`
    query ProjectDetail($id: ID!) {
        project(id: $id) {
            title
            modifiedBy {
                firstName
                lastName
            }
            id
            description
            createdBy {
                id
                firstName
                lastName
            }
            coverImage {
                name
                size
                url
            }
            department {
                id
            }
        }
    }
`;

const CREATE_PROJECT_MUTATION = gql`
    mutation CreateProject($data: ProjectCreateInput!) {
        createProject(data: $data) {
            ... on ProjectTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const UPDATE_PROJECT_MUTATION = gql`
    mutation UpdateProject($pk: ID!, $data: ProjectUpdateInput!) {
        updateProject(pk: $pk, data: $data) {
            ... on ProjectTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const DELETE_PROJECT = gql`
    mutation DeleteProject($id: ID!) {
        deleteProject(data: { id: $id }) {
            ... on ProjectType {
                title
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
