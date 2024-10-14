import Accordion from "components/box/Accordion/Accordion";
import Card from "components/content/Card/Card";
import useAccordion from "hooks/client/useAccordion";
import { RoutineConfig, SetConfig, WorkoutConfig } from "db";
import { ReactComponent as ArrowIcon } from "assets/image/arrow.svg";
import Table from "components/content/Table/Table";
import IconTextBox from "components/content/IconTextBox/IconTextBox";
import PaddingY from "components/box/PaddingY/PaddingY";
import Button from "components/content/Button/Button";
import { ReactComponent as PenIcon } from "assets/image/pen.svg";
import { ReactComponent as RunIcon } from "assets/image/run.svg";
import { useEffect, useState } from "react";
import { useTheme } from "styled-components";
import useCreateWorkoutRecordOneMutation from "hooks/server/useCreateWorkoutRecordOneMutation";
import useCreateSetRecordOneMutation from "hooks/server/useCreateSetRecordOneMutation";
import useDeleteSetRecordOneMutation from "hooks/server/useDeleteSetRecordOneMutation";

type TypeMapper = {
    [key: string]: string;
};

const typeMapper: TypeMapper = {
    weight: "무게",
    rep: "횟수",
    workoutSec: "시간",
};

type WorkoutConfigDetailProgressAccordionProps = {
    data: WorkoutConfig;
    routineRecordId: string;
    onSetCreate: (
        workoutConfigId: string,
        newSetConfigs: WorkoutConfig["setConfigs"]
    ) => void;
    onSetDelete: (
        workoutConfigId: string,
        newSetConfigs: WorkoutConfig["setConfigs"]
    ) => void;
    onSetComplete: (restSec: number) => void;
    onSetUpdate: (
        workoutConfigId: string,
        newSetConfigs: WorkoutConfig["setConfigs"]
    ) => void;
    onCompletedSetIdsMutate: (completedSetIds: string[]) => void;
};

const WorkoutConfigDetailProgressAccordion = ({
    data,
    routineRecordId,
    onSetCreate,
    onSetDelete,
    onSetComplete,
    onSetUpdate,
    onCompletedSetIdsMutate,
}: WorkoutConfigDetailProgressAccordionProps) => {
    const { color } = useTheme();
    const { isOpen, handleToggleAccordion, handleDragEnd, opacity, x } =
        useAccordion();

    const [currentSetId, setCurrentSetId] = useState(data.setConfigs[0]?.id);
    const [completedSetIds, setCompletedSetIds] = useState<string[]>([]);
    const [currentWorkoutId, setCurrentWorkoutId] = useState("");

    const { mutateAsync: createWorkoutRecordOneMutate } =
        useCreateWorkoutRecordOneMutation();

    const { mutateAsync: createSetRecordOneMutate } =
        useCreateSetRecordOneMutation();

    const { mutateAsync: deleteSetRecordOneMutate } =
        useDeleteSetRecordOneMutation();

    useEffect(() => {
        // 컴포넌트가 마운트 될때 운동 기록 데이터를 생성  및 setCurrentWorkoutId하기
        if (routineRecordId && data) {
            (async () => {
                const newWorkoutRecordOne = await createWorkoutRecordOneMutate({
                    routineRecordId,
                    workoutLibrary: data.workoutLibrary,
                });
                if (newWorkoutRecordOne) {
                    setCurrentWorkoutId(newWorkoutRecordOne.id);
                }
            })();
        }
    }, [createWorkoutRecordOneMutate, routineRecordId]);

    const isCurrentSet = (setId: string) => setId === currentSetId;
    const isCompletedSet = (setId: string) => completedSetIds.includes(setId);
    const isWorkoutCompleted =
        completedSetIds.length === data.setConfigs.length;

    const handleCompleteSetButtonClick = async () => {
        const newCompletedSetIds = structuredClone(completedSetIds);
        newCompletedSetIds.push(currentSetId);
        setCompletedSetIds(newCompletedSetIds);
        setCurrentSetId(data.setConfigs[newCompletedSetIds.length]?.id);

        const currentSetConfig = data.setConfigs.find(
            (setConfig) => setConfig.id === currentSetId
        );

        if (currentSetConfig) {
            onSetComplete(currentSetConfig.restSec);
            await createSetRecordOneMutate({
                workoutRecordId: currentWorkoutId,
                setConfig: currentSetConfig,
            });
        }
    };

    const handleDeleteSetButtonClick = async () => {
        const newSetConfigs = structuredClone(data.setConfigs);
        const poppedSetConfig = newSetConfigs.pop();
        const filteredCompletedSetIds = completedSetIds.filter(
            (id) => id !== poppedSetConfig?.id
        );
        setCompletedSetIds(filteredCompletedSetIds);
        onSetDelete(data.id, newSetConfigs);
        // currentWorkoutId에 세트 데이터 삭제하기 (삭제할때, 생성 순으로 가져온 후 마지막요소 삭제후 put 하기)

        if (completedSetIds.includes(poppedSetConfig?.id as string)) {
            await deleteSetRecordOneMutate({
                workoutRecordId: currentWorkoutId,
            });
        }
    };

    const handleCreateSetButtonClick = () => {
        const newSetConfigs = structuredClone(data.setConfigs);
        newSetConfigs.push({
            id: (newSetConfigs.length + 1).toString(),
            weight: 50,
            rep: 10,
            restSec: 10,
            createdAt: new Date(),
            updatedAt: new Date(),
            workoutConfigId: "1",
        });
        setCurrentSetId(newSetConfigs[completedSetIds.length].id);
        onSetCreate(data.id, newSetConfigs);
    };

    const handleUpdateSetInputChange = (
        index: number,
        key: string,
        value: string
    ) => {
        const newSetConfigs = structuredClone(data.setConfigs);
        newSetConfigs[index][key] = value;

        onSetUpdate(data.id, newSetConfigs);
    };

    useEffect(() => {
        onCompletedSetIdsMutate(completedSetIds);
    }, [completedSetIds]);

    return (
        <Accordion>
            <Accordion.Motion x={x} onDragEnd={handleDragEnd}>
                <Accordion.Header>
                    <Card>
                        <Card.ImageBox>
                            <img
                                width={"100%"}
                                src={data.workoutLibrary.image}
                                alt={"운동 이미지"}
                            />
                        </Card.ImageBox>
                        <Card.Column>
                            <Card.Title>{data.workoutLibrary.name}</Card.Title>
                            <Card.Description>
                                {data.setConfigs.length}종목
                            </Card.Description>
                            <Card.ProgressBar
                                fullLength={data.setConfigs.length}
                                portionLength={completedSetIds.length}
                            />
                        </Card.Column>
                    </Card>
                    <Accordion.Trigger
                        onToggleAccordion={handleToggleAccordion}
                    >
                        <ArrowIcon />
                    </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Body isOpen={isOpen}>
                    <Table>
                        <Table.Column
                            data={data.setConfigs}
                            header={
                                <Table.Row>
                                    <Table.TitleText>세트</Table.TitleText>
                                    {data.workoutLibrary.type.map((key) => (
                                        <Table.TitleText>
                                            {typeMapper[key]}
                                        </Table.TitleText>
                                    ))}
                                    <Table.TitleText>휴식</Table.TitleText>
                                </Table.Row>
                            }
                            render={(setConfig: SetConfig, index) => (
                                <Table.Row
                                    isGrayLine={isCompletedSet(setConfig.id)}
                                    isPrimaryLine={isCurrentSet(setConfig.id)}
                                >
                                    <Table.Input
                                        value={index.toString()}
                                        disabled={true}
                                    />
                                    {data.workoutLibrary.type.map((key) => (
                                        <Table.Input
                                            value={setConfig[key].toString()}
                                            onInputChange={(value) =>
                                                handleUpdateSetInputChange(
                                                    index,
                                                    key,
                                                    value
                                                )
                                            }
                                            disabled={isCompletedSet(
                                                setConfig.id
                                            )}
                                        />
                                    ))}

                                    <Table.Input
                                        value={setConfig.restSec.toString()}
                                        onInputChange={(value) =>
                                            handleUpdateSetInputChange(
                                                index,
                                                "restSec",
                                                value
                                            )
                                        }
                                        disabled={isCompletedSet(setConfig.id)}
                                    />
                                </Table.Row>
                            )}
                        />
                    </Table>
                    <IconTextBox>
                        <IconTextBox.IconText
                            color={color.gray.dark}
                            onIconTextClick={handleDeleteSetButtonClick}
                        >
                            <PenIcon />
                            세트 삭제하기
                        </IconTextBox.IconText>
                        <IconTextBox.IconText
                            color={color.primary}
                            onIconTextClick={handleCreateSetButtonClick}
                        >
                            <RunIcon />
                            세트 추가하기
                        </IconTextBox.IconText>
                    </IconTextBox>
                    <PaddingY>
                        <Button
                            onClick={handleCompleteSetButtonClick}
                            disabled={isWorkoutCompleted}
                        >
                            세트완료
                        </Button>
                    </PaddingY>
                </Accordion.Body>
                <Accordion.DeleteButton opacity={opacity} />
            </Accordion.Motion>
        </Accordion>
    );
};

export default WorkoutConfigDetailProgressAccordion;
