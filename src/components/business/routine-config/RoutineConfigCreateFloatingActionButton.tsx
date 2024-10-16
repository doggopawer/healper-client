import FloatingActionButton from "components/content/FloatingActionButton/FloatingActionButton";
import ROUTES from "constants/routes";
import { useNavigate } from "react-router-dom";
import EmptyBoundary from "../EmptyBoundary";
import useToast from "hooks/useToast";
import { RoutineConfig } from "db";
import useCreateRoutineConfigMutation from "hooks/server/useCreateRoutineConfigOneMutation";

const RoutineConfigCreateFloatingActionButton = () => {
    // TODO : 데이터 페칭
    const data: RoutineConfig[] | {} = [{}];

    const navigate = useNavigate();
    const { showToast } = useToast();
    const { mutateAsync: createRoutineConfigOneMutate } =
        useCreateRoutineConfigMutation();

    const handleButtonClick = async () => {
        try {
            const newRoutineConfig = await createRoutineConfigOneMutate({
                name: "새 루틴",
                color: "#855CF8",
                userId: "doggopawer",
            });

            showToast("루틴이 생성되었습니다.");

            navigate(ROUTES.CONFIG.DETAIL.PATH(newRoutineConfig?.id as string));
        } catch (e) {
            showToast("루틴을 생성하던 중 오류가 발생했습니다.");
        }
    };

    return (
        <EmptyBoundary
            data={data}
            fallback={
                <FloatingActionButton
                    onButtonClick={handleButtonClick}
                    text={
                        <>
                            본인 만의 루틴이 있나요? <br /> 루틴을 생성해보세요!
                        </>
                    }
                />
            }
        >
            <FloatingActionButton onButtonClick={handleButtonClick} />
        </EmptyBoundary>
    );
};

export default RoutineConfigCreateFloatingActionButton;
