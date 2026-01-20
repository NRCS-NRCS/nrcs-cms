/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql } from 'urql';

const COUNTS = gql`
  query Counts {
    blogs(filters: { status: PUBLISHED }) {
      totalCount
    }
    departments {
      totalCount
    }
    faqs {
      totalCount
    }
    jobVacancies {
      totalCount
    }
    highlights(filters: { isActive: true }) {
      totalCount
    }
    majorResponsibilities {
      totalCount
    }
    news {
      totalCount
    }
    partners {
      totalCount
    }
    procurements {
      totalCount
    }
    projects {
      totalCount
    }
    radioProgram {
      totalCount
    }
    resources {
      totalCount
    }
    strategicDirectives {
      totalCount
    }
  }
`;
