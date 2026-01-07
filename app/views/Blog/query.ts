/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql } from 'urql';

const BLOG_QUERY = gql`
    query BlogQuery {
        blogs {
            totalCount
            results {
                author
                content
                createdAt
                departmentId
                directiveId
                featured
                id
                modifiedAt
                coverImage {
                    name
                    size
                    url
                }
                createdBy {
                    firstName
                    lastName
                }
                publishedDate
                slug
                status
                title
            }
        }
    }
`;

const BLOG_DETAIL_QUERY = gql`
    query BlogDetailQuery($id: ID!) {
        blog(id: $id) {
            author
            content
            coverImage {
                name
                size
                url
            }
            departmentId
            directiveId
            featured
            id
            modifiedBy {
                firstName
                lastName
            }
            publishedDate
            slug
            status
            title
            createdBy {
                firstName
                lastName
            }
        }
    }
`;

const DEPARTMENT_AND_DIRECTIVE = gql`
    query DepartmentAndDirective {
        departments {
            results {
                id
                description
                title
                strategicDirectiveId
            }
        }
        strategicDirectives {
            results {
                id
                title
            }
        }
    }
`;

const CREATE_BLOG_MUTATION = gql`
    mutation CreateBlog($data: BlogCreateInput!) {
        createBlog(data: $data) {
            ... on BlogTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const UPDATE_BLOG_MUTATION = gql`
    mutation UpdateBlog($pk: ID!, $data: BlogUpdateInput!) {
        updateBlog(pk: $pk, data: $data) {
            ... on BlogTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const DELETE_BLOG = gql`
    mutation DeleteBlog($id: ID!) {
        deleteBlog(data: { id: $id }) {
            ... on BlogType {
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
