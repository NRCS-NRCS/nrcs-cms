/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql } from 'urql';

const RADIO_PROGRAM_QUERY = gql`
    query RadioProgram($pagination: OffsetPaginationInput, $filter: RadioProgramFilter) {
        radioProgram(pagination: $pagination, filters: $filter) {
            pageInfo {
                limit
                offset
            }
            totalCount
            results {
                type
                title
                publishedDate
                id
                audioFile {
                    name
                    size
                    url
                }
                createdBy {
                    lastName
                    firstName
                }
                modifiedBy {
                    lastName
                    firstName
                }
            }
        }
    }
`;

const CREATE_RADIO_PROGRAM_MUTATION = gql`
    mutation CreateRadioProgram($data: RadioProgramCreateInput!) {
        createRadioProgram(data: $data) {
            ... on RadioProgramTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const UPDATE_RADIO_PROGRAM_MUTATION = gql`
    mutation UpdateRadioProgram($pk: ID!, $data: RadioProgramUpdateInput!) {
        updateRadioProgram(pk: $pk, data: $data) {
            ... on RadioProgramTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const DELETE_RADIO_PROGRAM = gql`
    mutation DeleteRadioProgram($id: ID!) {
        deleteRadioProgram(data: { id: $id }) {
            ... on RadioProgramType {
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
