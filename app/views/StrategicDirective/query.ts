/* eslint-disable @typescript-eslint/no-unused-vars, import/prefer-default-export */
import { gql } from 'urql';

export const STRATEGIC_DIRECTIVE_QUERY = gql`
    query StrategicDirective($pagination: OffsetPaginationInput, $filters: StrategicDirectivesFilter) {
        strategicDirectives(pagination: $pagination, filters: $filters) {
            pageInfo {
                limit
                offset
            }
            totalCount
            results {
                id
                title
            }
        }
    }
`;

const STRATEGIC_DIRECTIVE_DETAIL_QUERY = gql`
    query StrategicDirectiveDetail($id: ID!) {
        strategicDirective(id: $id) {
            createdBy {
                lastName
                firstName
            }
            coverImage {
                name
                size
                url
            }
            description
            id
            title
            slug
            modifiedBy {
                firstName
                lastName
            }
            majorResponsibilities {
                id
                title
                description
            }
        }
    }
`;

const CREATE_STRATEGIC_DIRECTIVE_MUTATION = gql`
    mutation CreateStrategicDirective($data: StrategicDirectivesCreateInput!) {
        createStrategicDirectives(data: $data) {
            ... on StrategicDirectivesTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const UPDATE_STRATEGIC_DIRECTIVE_MUTATION = gql`
    mutation UpdateStrategicDirective(
        $pk: ID!
        $data: StrategicDirectivesUpdateInput!
    ) {
        updateStrategicDirectives(pk: $pk, data: $data) {
            ... on StrategicDirectivesTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const DELETE_STRATEGIC_DIRECTIVE = gql`
    mutation DeleteStrategicDirective($id: ID!) {
        deleteStrategicDirectives(data: { id: $id }) {
            ... on StrategicDirectivesType {
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

const MAJOR_RESPONSIBILITIES_QUERY = gql`
    query MajorResponsibilities($pagination: OffsetPaginationInput) {
        majorResponsibilities(pagination: $pagination) {
            pageInfo {
                limit
                offset
            }
            totalCount
            results {
                title
                id
                directive {
                    pk
                }
            }
        }
    }
`;

const MAJOR_RESPONSIBILITIES_DETAIL_QUERY = gql`
    query MajorResponsibilityDetail($id: ID!) {
        majorResponsibility(id: $id) {
            title
            slug
            modifiedBy {
                firstName
                lastName
            }
            id
            directive {
                pk
            }
            description
            createdBy {
                firstName
                lastName
            }
        }
    }
`;
