import Accordion from "components/box/Accordion/Accordion";
import styled from "styled-components";
import TitleTextInput from "components/content/TitleTextInput/TitleTextInput";
import {useCallback, useEffect, useRef, useState} from "react";
import useTimer from "hooks/client/useTimer";
import Modal from "components/box/Modal/Modal";
import useModal from "hooks/client/useModal";
import Confirm from "components/content/Confirm/Confirm";
import BottomBar from "components/box/BottomBar/BottomBar";
import TimerTemplate from "components/box/BottomBar/TimerTemplate";
import Button from "components/content/Button/Button";
import formatTime from "utils/formatTime";
import {ReactComponent as ClockIcon} from "assets/image/clock.svg";
import {ReactComponent as QuestionIcon} from "assets/image/question.svg";
import {ReactComponent as CompleteIcon} from "assets/image/complete.svg";
import {useNavigate, useParams} from "react-router-dom";
import ROUTES from "constants/routes";
import useToast from "hooks/useToast";
import WorkoutConfigDetailProgressAccordion from "../workout-config/WorkoutConfigDetailProgressAccordion";
import useGetRoutineConfigOneQuery from "hooks/server/useGetRoutineConfigOneQuery";
import {SetConfig, WorkoutConfig} from "types/model";
import useCreateRoutineRecordOneMutation from "hooks/server/useCreateRoutineRecordOneMutation";
import Box from "components/box/Box/Box";
import useUpdateRoutineRecordWorkoutEndAtMutation from "hooks/server/useUpdateRoutineRecordWorkoutEndAtMutation";
import moment from "moment";

import useNativeMessage from "hooks/client/useNativeMessage";
import useHardwareBackPress from "hooks/client/useHardwareBackPress";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const TimerText = styled.div<{seconds: number}>`
    font-size: 40px;
    font-weight: ${({theme}) => theme.fontWeight.semibold};
    color: ${({theme, seconds}) =>
        seconds <= 9 && seconds >= 1
            ? theme.color.warning
            : theme.color.text.black};
`;

const RoutineConfigOneProgressView = () => {
    const navigate = useNavigate();
    const {showToast} = useToast();
    const {sendNativeMessage} = useNativeMessage();
    const {routineConfigId} = useParams();
    const workoutStartTime = useRef(moment());

    const {
        isOpen: isTimerModalOpen,
        handleOpenModal: handleOpenTimerModal,
        handleCloseModal: handleCloseTimerModal,
    } = useModal();
    const {
        isOpen: isCompletedModalOpen,
        handleOpenModal: handleOpenCompletedModal,
        handleCloseModal: handleCloseCompletedModal,
    } = useModal();
    const {
        isOpen: isUncompletedModalOpen,
        handleOpenModal: handleOpenUncompletedModal,
        handleCloseModal: handleCloseUncompletedModal,
    } = useModal();

    useHardwareBackPress({
        onNativeBackButtonClick: () => {
            if (isTimerModalOpen) {
                handleCloseTimerModal();
                return;
            }
            if (isCompletedModalOpen) {
                handleCloseTimerModal();
                return;
            }
            if (isUncompletedModalOpen) {
                handleCloseTimerModal();
                return;
            }
            navigate(-1);
        },
        dependencies: [
            isTimerModalOpen,
            isCompletedModalOpen,
            isUncompletedModalOpen,
        ],
    });

    const {endTime, startTimer, isActive, skipTimer, remainingTime} = useTimer(
        useCallback(() => {
            handleCloseTimerModal();
            sendNativeMessage({type: "vibrate"});
        }, []),
    );

    const {data: routineConfigDetailData} = useGetRoutineConfigOneQuery(
        routineConfigId as string,
    );

    const {mutateAsync: createRoutineRecordOneMutate} =
        useCreateRoutineRecordOneMutation();
    const {mutateAsync: updateRoutineRecordOneMutate} =
        useUpdateRoutineRecordWorkoutEndAtMutation();

    const routineConfigDetail = routineConfigDetailData!;

    const [currentWorkoutId, setCurrentWorkoutId] = useState(
        routineConfigDetail.workoutConfigs[0]._id,
    );

    const [routineConfigState, setRoutineConfigState] =
        useState(routineConfigDetail);
    const [totalCompletedSetIds, setTotalCompletdSetIds] = useState(new Set());
    const [routineRecordId, setRoutineRecordId] = useState("");

    useEffect(() => {
        (async () => {
            const response = await createRoutineRecordOneMutate({
                name: routineConfigState.name,
                color: routineConfigState.color,
                userId: routineConfigState.userId,
            });

            response && setRoutineRecordId(response._id);
        })();
    }, [createRoutineRecordOneMutate]);

    const handleSetCreate = (
        workoutConfigId: string,
        setConfigs: SetConfig[],
    ) => {
        const newRoutineConfigState = structuredClone(routineConfigState);
        const selectedWorkoutConfig = newRoutineConfigState.workoutConfigs.find(
            (workoutConfig: WorkoutConfig) =>
                workoutConfig._id === workoutConfigId,
        );
        if (selectedWorkoutConfig) {
            selectedWorkoutConfig.setConfigs = setConfigs;
        }
        setRoutineConfigState(newRoutineConfigState);
    };

    const handleSetDelete = (
        workoutConfigId: string,
        setConfigs: SetConfig[],
    ) => {
        const newRoutineConfigState = structuredClone(routineConfigState);
        const selectedWorkoutConfig = newRoutineConfigState.workoutConfigs.find(
            (workoutConfig: WorkoutConfig) =>
                workoutConfig._id === workoutConfigId,
        );
        if (selectedWorkoutConfig) {
            selectedWorkoutConfig.setConfigs = setConfigs;
        }
        setRoutineConfigState(newRoutineConfigState);
    };

    const handleSetComplete = (restSec: number, isLastSet: boolean) => {
        if (isLastSet) {
            const nextWorkoutConfigIndex =
                routineConfigDetail.workoutConfigs.findIndex(
                    item => item._id === currentWorkoutId,
                );
            // 다음 인덱스가 존재한다면
            if (
                nextWorkoutConfigIndex + 1 <
                routineConfigDetail.workoutConfigs.length
            ) {
                setCurrentWorkoutId(
                    routineConfigDetail.workoutConfigs[
                        nextWorkoutConfigIndex + 1
                    ]._id,
                );
            }
        }

        const totalSetIds = new Set();

        // 모든 세트 ID를 routineConfigState에서 수집
        routineConfigState.workoutConfigs.forEach(workoutConfig => {
            workoutConfig.setConfigs.forEach(setConfig => {
                totalSetIds.add(setConfig._id); // 세트 _id 추가
            });
        });

        // totalCompletedSetIds와 totalSetIds 비교
        const isAllCompleted =
            totalSetIds.size === totalCompletedSetIds.size + 1;

        if (isAllCompleted) {
            handleOpenCompletedModal();
        } else {
            startTimer(restSec);
            handleOpenTimerModal();
        }
    };

    const handleSetUpdate = (
        workoutConfigId: string,
        setConfigs: SetConfig[],
    ) => {
        const newRoutineConfigState = structuredClone(routineConfigState);
        const selectedWorkoutConfig = newRoutineConfigState.workoutConfigs.find(
            (workoutConfig: WorkoutConfig) =>
                workoutConfig._id === workoutConfigId,
        );

        if (selectedWorkoutConfig) {
            selectedWorkoutConfig.setConfigs = setConfigs;
        }

        setRoutineConfigState(newRoutineConfigState);
    };

    const handleWorkoutDelete = (workoutConfigId: string) => {
        const newRoutineConfigState = structuredClone(routineConfigState);
        const newTotalCompletedSetIds = structuredClone(totalCompletedSetIds);
        const workoutConfigOne = newRoutineConfigState.workoutConfigs.find(
            (workoutConfig: WorkoutConfig) =>
                workoutConfig._id === workoutConfigId,
        );

        newRoutineConfigState.workoutConfigs =
            newRoutineConfigState.workoutConfigs.filter(
                (workoutConfig: WorkoutConfig) =>
                    workoutConfig._id !== workoutConfigId,
            );

        workoutConfigOne?.setConfigs.forEach((setConfig: SetConfig) => {
            // setConfig의 id가 completedIds에 존재하는 경우 삭제합니다.
            if (newTotalCompletedSetIds.has(setConfig._id)) {
                newTotalCompletedSetIds.delete(setConfig._id);
            }
        });
        console.log(newTotalCompletedSetIds);

        setTotalCompletdSetIds(newTotalCompletedSetIds);
        setRoutineConfigState(newRoutineConfigState);
    };

    const handleCompletedSetIdsMutate = (completedSetIds: string[]) => {
        setTotalCompletdSetIds(prevState => {
            const newSet = new Set(prevState);
            completedSetIds.forEach(value => newSet.add(value));
            return newSet;
        });
    };

    const handleTimerClick = () => {
        if (remainingTime === 0) {
            return;
        }
        handleOpenTimerModal();
    };

    const handleRoutineCompleteButtonClick = () => {
        const totalSetIds = new Set();

        // 모든 세트 ID를 routineConfigState에서 수집
        routineConfigState.workoutConfigs.forEach(workoutConfig => {
            workoutConfig.setConfigs.forEach(setConfig => {
                totalSetIds.add(setConfig._id); // 세트 _id 추가
            });
        });

        // totalCompletedSetIds와 totalSetIds 비교
        const isAllCompleted = totalSetIds.size === totalCompletedSetIds.size;

        if (isAllCompleted) {
            handleOpenCompletedModal();
        } else {
            handleOpenUncompletedModal();
        }
    };

    return (
        <Container>
            <Box>
                <TitleTextInput
                    disabled={true}
                    value={routineConfigState.name}
                />
            </Box>

            <Accordion.List<WorkoutConfig>
                data={routineConfigState.workoutConfigs}
                render={item => (
                    <WorkoutConfigDetailProgressAccordion
                        key={item._id}
                        data={item}
                        isCurrentWorkoutConfig={item._id === currentWorkoutId}
                        remainingTime={remainingTime}
                        routineRecordId={routineRecordId}
                        onSetCreate={handleSetCreate}
                        onSetDelete={handleSetDelete}
                        onSetComplete={handleSetComplete}
                        onSetUpdate={handleSetUpdate}
                        onCompletedSetIdsMutate={handleCompletedSetIdsMutate}
                        onWorkoutDelete={handleWorkoutDelete}
                    />
                )}
            />

            <BottomBar>
                <TimerTemplate>
                    <TimerTemplate.Timer
                        value={remainingTime}
                        onTimerClick={handleTimerClick}
                    />
                    <TimerTemplate.ButtonWrapper>
                        <Button onClick={handleRoutineCompleteButtonClick}>
                            루틴 완료
                        </Button>
                    </TimerTemplate.ButtonWrapper>
                </TimerTemplate>
            </BottomBar>

            {isTimerModalOpen && (
                <TimerModal
                    seconds={remainingTime}
                    isOpen={isTimerModalOpen}
                    onBackdropClick={() => handleCloseTimerModal}
                    onCancelButtonClick={() => {
                        handleCloseTimerModal();
                    }}
                    onConfirmButtonClick={() => {
                        skipTimer();
                    }}
                />
            )}

            {isCompletedModalOpen && (
                <CompletedModal
                    isOpen={isCompletedModalOpen}
                    onBackdropClick={() => handleCloseCompletedModal}
                    onCancelButtonClick={async () => {
                        handleCloseCompletedModal();
                    }}
                    onConfirmButtonClick={async () => {
                        const workoutEndTime = moment();
                        const workoutTime = moment
                            .duration(
                                workoutEndTime.diff(workoutStartTime.current),
                            )
                            .asSeconds();
                        await updateRoutineRecordOneMutate({
                            routineRecordId,
                            workoutTime,
                        });
                        handleCloseCompletedModal();
                        showToast("루틴이 완료되었습니다.", "success");
                        navigate(ROUTES.RECORD.LIST.PATH, {
                            replace: true,
                        });
                        sendNativeMessage({type: "vibrate"});
                    }}
                />
            )}

            {isUncompletedModalOpen && (
                <UncompletedModal
                    isOpen={isUncompletedModalOpen}
                    onBackdropClick={() => handleCloseUncompletedModal}
                    onCancelButtonClick={() => {
                        handleCloseUncompletedModal();
                    }}
                    onConfirmButtonClick={async () => {
                        const workoutEndTime = moment();
                        const workoutTime = moment
                            .duration(
                                workoutEndTime.diff(workoutStartTime.current),
                            )
                            .asSeconds();
                        await updateRoutineRecordOneMutate({
                            routineRecordId,
                            workoutTime,
                        });
                        handleCloseCompletedModal();
                        showToast("루틴이 완료되었습니다.", "success");
                        navigate(ROUTES.RECORD.LIST.PATH, {
                            replace: true,
                        });
                        sendNativeMessage({type: "vibrate"});
                    }}
                />
            )}
        </Container>
    );
};

export default RoutineConfigOneProgressView;

type TimerModalProps = {
    seconds: number;
    isOpen: boolean;
    onBackdropClick: () => void;
    onCancelButtonClick: () => void;
    onConfirmButtonClick: () => void;
};

const TimerModal = ({
    seconds,
    isOpen,
    onBackdropClick,
    onCancelButtonClick,
    onConfirmButtonClick,
}: TimerModalProps) => {
    return (
        <Modal>
            <Modal.Backdrop isOpen={isOpen} onBackdropClick={onBackdropClick} />
            <Modal.Content isOpen={isOpen}>
                <Confirm>
                    <Confirm.ContentBox>
                        <Confirm.IconBox>
                            <ClockIcon />
                        </Confirm.IconBox>
                        <Confirm.Title>휴식 타이머</Confirm.Title>
                        <Confirm.Description>
                            <TimerText seconds={seconds}>
                                {formatTime(seconds)}
                            </TimerText>
                        </Confirm.Description>
                    </Confirm.ContentBox>
                    <Confirm.ButtonBox
                        cancelLabel="잠시 닫기"
                        confirmLabel="휴식 건너띄기"
                        onCancelButtonClick={onCancelButtonClick}
                        onConfirmButtonClick={onConfirmButtonClick}
                    />
                </Confirm>
            </Modal.Content>
        </Modal>
    );
};

type CompletedModalProps = {
    isOpen: boolean;
    onBackdropClick: () => void;
    onCancelButtonClick: () => void;
    onConfirmButtonClick: () => void;
};

const CompletedModal = ({
    isOpen,
    onBackdropClick,
    onCancelButtonClick,
    onConfirmButtonClick,
}: CompletedModalProps) => {
    return (
        <Modal>
            <Modal.Backdrop isOpen={isOpen} onBackdropClick={onBackdropClick} />
            <Modal.Content isOpen={isOpen}>
                <Confirm>
                    <Confirm.ContentBox>
                        <Confirm.IconBox>
                            <CompleteIcon />
                        </Confirm.IconBox>
                        <Confirm.Title>루틴 완료</Confirm.Title>
                        <Confirm.Description>
                            설정한 루틴이 모두 완료되었습니다. <br />
                            운동 기록을 확인하려면 기록 페이지로 이동해 주세요.
                            남아서 운동을 계속하려면 '계속하기'를 눌러주세요.
                        </Confirm.Description>
                    </Confirm.ContentBox>
                    <Confirm.ButtonBox
                        cancelLabel="계속하기"
                        confirmLabel="기록 페이지로 가기"
                        onCancelButtonClick={onCancelButtonClick}
                        onConfirmButtonClick={onConfirmButtonClick}
                    />
                </Confirm>
            </Modal.Content>
        </Modal>
    );
};

type UnCompletedModalProps = {
    isOpen: boolean;
    onBackdropClick: () => void;
    onCancelButtonClick: () => void;
    onConfirmButtonClick: () => void;
};

const UncompletedModal = ({
    isOpen,
    onBackdropClick,
    onCancelButtonClick,
    onConfirmButtonClick,
}: UnCompletedModalProps) => {
    return (
        <Modal>
            <Modal.Backdrop isOpen={isOpen} onBackdropClick={onBackdropClick} />
            <Modal.Content isOpen={isOpen}>
                <Confirm>
                    <Confirm.ContentBox>
                        <Confirm.IconBox>
                            <QuestionIcon />
                        </Confirm.IconBox>
                        <Confirm.Title>루틴 미완료</Confirm.Title>
                        <Confirm.Description>
                            이 페이지를 벗어나면 지금까지 진행한 운동만 캘린더에
                            저장됩니다.
                            <br /> 운동을 종료하시겠습니까?
                        </Confirm.Description>
                    </Confirm.ContentBox>
                    <Confirm.ButtonBox
                        cancelLabel="취소"
                        confirmLabel="운동 종료"
                        onCancelButtonClick={onCancelButtonClick}
                        onConfirmButtonClick={onConfirmButtonClick}
                    />
                </Confirm>
            </Modal.Content>
        </Modal>
    );
};
