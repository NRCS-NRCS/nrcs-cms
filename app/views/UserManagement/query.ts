/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql } from 'urql';

const USER_QUERY = gql`
    query Users($pagination: OffsetPaginationInput, $filters: UserFilter) {
        users(pagination: $pagination, filters: $filters) {
            pageInfo {
                limit
                offset
            }
            totalCount
            results {
                username
                lastName
                userType
                lastLogin
                isActive
                id
                firstName
                email
                createdAt
            }
        }
    }
`;

const CREATE_USER_MUTATION = gql`
    mutation CreateUser($data: UserCreateInput!) {
        createUser(data: $data) {
            ... on UserTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const UPDATE_USER_MUTATION = gql`
    mutation UpdateUser($data: UserUpdateInput!) {
        updateUser(data: $data) {
            ... on UserTypeMutationResponseType {
                errors
                ok
                result {
                    createdAt
                    email
                    firstName
                    id
                    isActive
                    lastLogin
                    lastName
                    userType
                    username
                }
            }
        }
    }
`;

const USER_DETAIL_QUERY = gql`
    query User($id: ID!) {
        user(id: $id) {
            createdAt
            email
            firstName
            id
            isActive
            lastLogin
            lastName
            userType
            username
        }
    }
`;

const RESET_USER_PASSWORD = gql`
    mutation ResetUserPassword($data: PasswordResetInput!, $newPassword: String!) {
        resetUserPassword(data: $data, newPassword: $newPassword) {
            ... on UserTypeMutationResponseType {
                ok
                errors
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

const DELETE_USER = gql`
    mutation DeleteUser($data: UserDeleteInput!) {
        deleteUser(data: $data) {
            ... on UserTypeMutationResponseType {
                errors
                ok
                result {
                    username
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
