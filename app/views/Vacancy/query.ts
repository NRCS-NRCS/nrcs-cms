/* eslint-disable @typescript-eslint/no-unused-vars, import/prefer-default-export */
import { gql } from 'urql';

export const VACANCY_QUERY = gql`
    query Vacancy($pagination: OffsetPaginationInput, $filters: JobVacancyFilter) {
        jobVacancies(pagination: $pagination, filters: $filters) {
            pageInfo {
                limit
                offset
            }
            totalCount
            results {
                id
                title
                publishedAt
                numberOfVacancies
                isArchived
                expiryDate
                position
                department {
                    title
                }
            }
        }
    }
`;

const VACANCY_DETAIL_QUERY = gql`
    query VacancyDetail($id: ID!) {
        jobVacancy(id: $id) {
            id
            file {
                name
                size
                url
            }
            expiryDate
            description
            departmentId
            createdBy {
                firstName
                lastName
            }
            isArchived
            modifiedBy {
                firstName
                lastName
            }
            numberOfVacancies
            position
            publishedAt
            title
        }
    }
`;

const CREATE_VACANCY_MUTATION = gql`
    mutation CreateVacancy($data: JobVacancyCreateInput!) {
        createJobVacancy(data: $data) {
            ... on JobVacancyTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const UPDATE_VACANCY_MUTATION = gql`
    mutation UpdateVacancy($pk: ID!, $data: JobVacancyUpdateInput!) {
        updateJobVacancy(pk: $pk, data: $data) {
            ... on JobVacancyTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const DELETE_VACANCY = gql`
    mutation DeleteVacancy($id: ID!) {
        deleteJobVacancy(data: { id: $id }) {
            ... on JobVacancyType {
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
