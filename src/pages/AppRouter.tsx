import DefferredComponent from "components/box/DefferedComponent/DefferedComponent";
import PageTemplate from "components/box/PageTemplate/PageTemplate";
import PublicRoute from "components/box/PublicRoute/PublicRoute";
import CommonLoading from "components/content/CommonLoading/CommonLoading";
import ROUTES from "constants/routes";
import { Suspense } from "react";
import {
    createBrowserRouter,
    Navigate,
    RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
    {
        path: ROUTES.LOGIN.PATH,
        element: <ROUTES.LOGIN.COMPONENT />,
    },
    {
        element: <PageTemplate />,
        children: [
            {
                path: ROUTES.CONFIG.LIST.PATH,
                element: <ROUTES.CONFIG.LIST.COMPONENT />,
            },
            {
                path: ROUTES.CONFIG.DETAIL.PATH(":routineConfigId"),
                element: <ROUTES.CONFIG.DETAIL.COMPONENT />,
            },
            {
                path: ROUTES.RECORD.LIST.PATH,
                element: <ROUTES.RECORD.LIST.COMPONENT />,
            },
            {
                path: ROUTES.RECORD.DETAIL.PATH(":routineRecordId"),
                element: <ROUTES.RECORD.DETAIL.COMPONENT />,
            },
            {
                path: ROUTES.PROGRESS.PATH(":routineConfigId"),
                element: <ROUTES.PROGRESS.COMPONENT />,
            },
            {
                path: ROUTES.LIBRARY.PATH,
                element: <ROUTES.LIBRARY.COMPONENT />,
            },
            {
                path: ROUTES.MY.PATH,
                element: <ROUTES.MY.COMPONENT />,
            },
            {
                path: "*", // 모든 경로에 대해 처리
                element: <Navigate to={ROUTES.CONFIG.LIST.PATH} replace />, // 원하는 페이지로 리디렉션
            },
        ],
    },
]);

const AppRouter = () => {
    return (
        <Suspense
            fallback={
                <DefferredComponent>
                    <CommonLoading />
                </DefferredComponent>
            }
        >
            <RouterProvider router={router} />
        </Suspense>
    );
};

export default AppRouter;
