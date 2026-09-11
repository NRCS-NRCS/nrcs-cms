import { use } from 'react';

import UserContext from '#contexts/UserContext';
import { UserTypeEnum } from '#generated/types/graphql';

function usePermissions() {
    const { user } = use(UserContext);
    const isAdmin = user?.userType === UserTypeEnum.Admin;
    const isStaff = user?.userType === UserTypeEnum.Staff;

    return {
        canEditContent: isAdmin || isStaff,
        canEditUsers: isAdmin,
        canTriggerDeployment: isAdmin || isStaff,
    };
}

export default usePermissions;
