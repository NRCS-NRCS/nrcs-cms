import { Outlet } from 'react-router';

function PrivateLayout() {
    return (
        <div>
            <h1>Private</h1>
            <Outlet />
        </div>
    );
}

export default PrivateLayout;
