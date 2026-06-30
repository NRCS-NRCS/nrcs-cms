/* eslint-disable @typescript-eslint/no-unused-vars, import/prefer-default-export */
import { gql } from 'urql';

export const DEPARTMENT_QUERY = gql`
    query Departments($pagination: OffsetPaginationInput, $filters: DepartmentFilter) {
        departments(pagination: $pagination, filters: $filters) {
            pageInfo {
                limit
                offset
            }
            totalCount
            results {
                contactPersonName
                contactPersonEmail
                title
                id
                strategicDirective {
                    id
                    title
                }
            }
        }
    }
`;

const DEPARTMENT_DETAIL = gql`
    query DepartmentDetail($id: ID!) {
        department(id: $id) {
            contactPersonEmail
            contactPersonName
            id
            description
            slug
            title
            strategicDirectiveId
            createdBy {
                firstName
                lastName
                id
            }
            modifiedBy {
                id
                firstName
                lastName
            }
        }
    }
`;

const DIRECTIVE = gql`
    query Directive {
        strategicDirectives {
            results {
                id
                title
            }
        }
    }
`;

const CREATE_DEPARTMENT_MUTATION = gql`
    mutation CreateDepartment($data: DepartmentCreateInput!) {
        createDepartment(data: $data) {
            ... on DepartmentTypeMutationResponseType {
                __typename
                errors
                ok
            }
        }
    }
`;

const UPDATE_DEPARTMENT_MUTATION = gql`
    mutation UpdateDepartment($pk: ID!, $data: DepartmentUpdateInput!) {
        updateDepartment(pk: $pk, data: $data) {
            ... on DepartmentTypeMutationResponseType {
                __typename
                errors
                ok
            }
        }
    }
`;

const DELETE_DEPARTMENT = gql`
    mutation DeleteDepartment($id: ID!) {
        deleteDepartment(data: { id: $id }) {
            ... on OperationInfo {
                __typename
                messages {
                    message
                }
            }
            ... on DepartmentType {
                id
                title
            }
        }
    }
`;
