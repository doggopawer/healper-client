import NavigationBottomBar from "components/business/NavigationBottomBar";
import Logo from "components/content/Logo/Logo";
import UnderlineBox from "components/content/UnderlineBox/UnderlineBox";
import ROUTES from "constants/routes";
import styled from "styled-components";
import { ReactComponent as MoonIcon } from "assets/image/moon.svg";
import { ReactComponent as HumanIcon } from "assets/image/human2.svg";
import Toggle from "components/content/Toggle/Toggle";
import { Suspense, useContext, useState } from "react";
import { ThemeContext, ThemeContextType } from "context/ThemeContext";
import useToast from "hooks/useToast";
import syncData from "utils/syncData";
import useGetUserOneQuery from "hooks/server/useGetUserOneQuery";
import useModal from "hooks/client/useModal";
import DataSyncModal from "components/business/DataSyncModal";
import { ReactComponent as SyncIcon } from "assets/image/sync.svg";
import PageHeader from "components/content/PageHeader/PageHeader";
import ErrorBoundary from "components/box/ErrorBoundary/ErrorBounday";
import CommonLoading from "components/content/CommonLoading/CommonLoading";
import { CustomError } from "types/error";
import { AxiosError } from "axios";
import Dexie from "dexie";
import DefferredComponent from "components/box/DefferedComponent/DefferedComponent";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const ProfileBox = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
`;
const UserName = styled.div`
    font-size: ${({ theme }) => theme.fontSize.md};
    font-weight: ${({ theme }) => theme.fontWeight.regular};
`;

const ProfileImage = styled.img`
    width: 100px;
    height: 100px;
    border-radius: 50%;
`;
const LogoutButton = styled.button`
    width: 102px;
    height: 26px;
    box-sizing: border-box;
    border-radius: 24px;
    background-color: ${({ theme }) => theme.color.background.box};
    border: 1px solid ${({ theme }) => theme.color.gray.light};
    color: ${({ theme }) => theme.color.text.black};
`;

const SyncButton = styled.button`
    background-color: ${({ theme }) => theme.color.primary};
    width: 44px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: none;
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.xl};
`;

const UnderlineBoxWrapper = styled.div``;

const MyPageContentView = () => {
    const { themeMode, setThemeMode } = useContext(
        ThemeContext
    ) as ThemeContextType;
    const { showToast } = useToast();

    const {
        isOpen: isDataSyncModalOpen,
        handleOpenModal: openDataSyncModal,
        handleCloseModal: closeDataSyncModal,
    } = useModal();
    const { data: userOneData } = useGetUserOneQuery();

    const userOne = userOneData!;

    const [syncMode, setSyncMode] = useState(
        localStorage.getItem("syncMode") &&
            localStorage.getItem("syncMode") === "on"
            ? true
            : false
    );

    const handleDarkModeToggleClick = () => {
        setThemeMode(themeMode === "dark" ? "light" : "dark");
    };

    const handleSyncModeToggleClick = () => {
        localStorage.setItem("syncMode", syncMode ? "off" : "on");
        setSyncMode(!syncMode);
    };

    const handleSyncButtonClick = async () => {
        let modalOpenTimeout;
        try {
            // 데이터 동기화 작업을 비동기로 시작합니다.
            const syncPromise = syncData();

            // 1초 후에 모달을 열도록 설정합니다.
            modalOpenTimeout = setTimeout(() => {
                openDataSyncModal();
            }, 1000);

            // 데이터 동기화가 완료될 때까지 기다립니다.
            await syncPromise;
            showToast("데이터를 동기화했습니다.", "success");
        } catch (e) {
            if (
                e instanceof Error ||
                e instanceof CustomError ||
                e instanceof AxiosError ||
                e instanceof Dexie.DexieError
            )
                showToast(e.message, "error");
        } finally {
            // 데이터 동기화 후 모달을 닫습니다.
            clearTimeout(modalOpenTimeout); // 모달 열기 타이머를 클리어
            closeDataSyncModal(); // 모달 닫기
        }
    };

    const handleLogoutButtonClick = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userId");
        window.dispatchEvent(new Event("accessTokenChanged"));
    };

    return (
        <Container>
            <ProfileBox>
                <ProfileImage src={userOne.profileImage} />
                <UserName>{userOne.name}</UserName>
                <LogoutButton onClick={handleLogoutButtonClick}>
                    로그아웃
                </LogoutButton>
            </ProfileBox>
            <UnderlineBoxWrapper>
                <UnderlineBox>
                    <UnderlineBox.TitleWrapper>
                        <MoonIcon />
                        다크모드 설정
                    </UnderlineBox.TitleWrapper>
                    <Toggle
                        defaultValue={themeMode === "dark"}
                        onToggleChange={handleDarkModeToggleClick}
                    />
                </UnderlineBox>
                <UnderlineBox>
                    <UnderlineBox.TitleWrapper>
                        <HumanIcon />
                        문의 사항
                    </UnderlineBox.TitleWrapper>
                </UnderlineBox>
                <UnderlineBox>
                    <UnderlineBox.TitleWrapper>
                        <MoonIcon />
                        동기화
                    </UnderlineBox.TitleWrapper>
                    <SyncButton onClick={handleSyncButtonClick}>
                        <SyncIcon />
                    </SyncButton>
                </UnderlineBox>
                <UnderlineBox>
                    <UnderlineBox.TitleWrapper>
                        <MoonIcon />
                        자동 동기화 설정
                    </UnderlineBox.TitleWrapper>
                    <Toggle
                        defaultValue={syncMode}
                        onToggleChange={handleSyncModeToggleClick}
                    />
                </UnderlineBox>
            </UnderlineBoxWrapper>

            {isDataSyncModalOpen && (
                <DataSyncModal isOpen={isDataSyncModalOpen} />
            )}
        </Container>
    );
};

const MyPage = () => {
    return (
        <>
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
                    <MyPageContentView />
                </Suspense>
            </ErrorBoundary>
            <NavigationBottomBar defaultValue={ROUTES.MY.PATH} />
        </>
    );
};

export default MyPage;
