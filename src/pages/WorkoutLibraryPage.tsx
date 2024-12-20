import DefferredComponent from "components/box/DefferedComponent/DefferedComponent";
import ErrorBoundary from "components/box/ErrorBoundary/ErrorBounday";
import NavigationBottomBar from "components/business/NavigationBottomBar";
import WorkoutLibraryListView from "components/business/workout-library/WorkoutLibraryListView";
import CommonLoading from "components/content/CommonLoading/CommonLoading";
import Logo from "components/content/Logo/Logo";
import PageHeader from "components/content/PageHeader/PageHeader";
import ROUTES from "constants/routes";
import { Suspense } from "react";
import styled from "styled-components";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const WorkoutLibraryPage = () => {
    return (
        <Container>
            <PageHeader>
                <Logo />
            </PageHeader>
            <ErrorBoundary>
                <Suspense
                    fallback={
                        <DefferredComponent>
                            <CommonLoading />
                        </DefferredComponent>
                    }
                >
                    <WorkoutLibraryListView />
                </Suspense>
            </ErrorBoundary>

            <NavigationBottomBar defaultValue={ROUTES.LIBRARY.PATH} />
        </Container>
    );
};

export default WorkoutLibraryPage;
