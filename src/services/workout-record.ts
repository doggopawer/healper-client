import { v4 as uuidv4 } from "uuid"; // UUID 생성을 위한 라이브러리
import { db, WorkoutRecord, WorkoutLibrary } from "db"; // WorkoutRecord 타입의 경로를 설정하세요.
import moment from "moment";
import { Period } from "type/Period";

type CreateWorkoutRecordOneParams = {
    routineRecordId: string;
    workoutLibrary: WorkoutLibrary; // 연결된 ����� 구성
};
// 확인: 완료
export const createWorkoutRecordOne = async ({
    routineRecordId,
    workoutLibrary,
}: CreateWorkoutRecordOneParams): Promise<WorkoutRecord | null> => {
    const newWorkoutRecordOne: WorkoutRecord = {
        id: uuidv4(), // UUID로 ID 생성
        routineRecordId, // 연결된 루틴 기록 ID
        createdAt: new Date(), // 현재 날짜
        updatedAt: new Date(), // 현재 날짜
        setRecords: [],
        workoutLibrary: workoutLibrary, // 연결된 운동 라이브러리
    };

    try {
        // 트랜잭션을 사용하여 데이터베이스 작업 수행
        await db.transaction("rw", db.routineRecords, async () => {
            // routineRecordId로 해당하는 routineRecord 가져오기
            const routineRecordOne =
                await db.routineRecords.get(routineRecordId);
            console.log("트랜잭션 적용", routineRecordOne);
            console.log("운동기록 생성 함수 호출");

            if (routineRecordOne) {
                const newWorkoutRecords = structuredClone(
                    routineRecordOne.workoutRecords
                );
                newWorkoutRecords.push(newWorkoutRecordOne);
                await db.routineRecords.update(routineRecordId, {
                    workoutRecords: newWorkoutRecords,
                });
            }
        });

        return newWorkoutRecordOne;
    } catch (error) {
        console.error("Error creating WorkoutRecord:", error);
        throw error;
    }
};
// 확인: 완료
export const deleteWorkoutRecordOne = async ({
    routineRecordId,
    workoutRecordId,
}: {
    routineRecordId: string;
    workoutRecordId: string;
}): Promise<boolean> => {
    try {
        const routineRecordOne = await db.routineRecords.get(routineRecordId);

        if (routineRecordOne) {
            const newWorkoutRecords = routineRecordOne.workoutRecords.filter(
                (workoutRecord) => workoutRecord.id !== workoutRecordId
            );
            routineRecordOne.workoutRecords = newWorkoutRecords;
            await db.routineRecords.put(routineRecordOne);
        }

        return true; // 삭제 성공
    } catch (error) {
        console.error("Error deleting WorkoutConfig:", error);
        return false; // 오류 발생
    }
};
// 확인: 완료
export const getWorkoutRecordSumAll = async ({
    workoutLibraryId,
    period,
}: {
    workoutLibraryId: string;
    period: Period;
}): Promise<{ key: string; value: number }[]> => {
    let startDate: moment.Moment;
    const endDate = moment(); // 현재 날짜

    switch (period) {
        case Period.Month:
            startDate = endDate.clone().subtract(1, "months").startOf("month"); // 최근 1달
            break;
        case Period.Quarter:
            startDate = endDate.clone().subtract(3, "months").startOf("month"); // 최근 3달
            break;
        case Period.Half:
            startDate = endDate.clone().subtract(6, "months").startOf("month"); // 최근 3달
            break;

        case Period.Year:
            startDate = endDate.clone().subtract(1, "years").startOf("year"); // 최근 1년
            break;
        case Period.All:
            startDate = moment(0); // Unix epoch 시작일
            break;
        default:
            throw new Error("Invalid type");
    }

    try {
        const routineRecords = await db.routineRecords.toArray();

        // workoutRecords를 가져오고, workoutLibrary.id로 필터링
        const workoutRecords = routineRecords.flatMap((routineRecord) =>
            routineRecord.workoutRecords.filter(
                (workoutRecord) =>
                    workoutRecord.workoutLibrary.id === workoutLibraryId
            )
        );

        // 결과 데이터 형식으로 변환
        const workoutRecordByDateList: { key: string; value: number }[] = [];

        // 데이터 집계
        const groupedData: { [key: string]: number } = {};

        workoutRecords.forEach((record) => {
            const recordDate = moment(record.createdAt);
            if (recordDate.isBetween(startDate, endDate, null, "[]")) {
                const dateKey = recordDate.format("MM.DD"); // 날짜 형식 설정
                const setValue = record.setRecords.reduce(
                    (setSum, set) => setSum + set.weight * set.rep,
                    0
                );

                if (!groupedData[dateKey]) {
                    groupedData[dateKey] = 0;
                }
                groupedData[dateKey] += setValue; // 값 집계
            }
        });

        // 결과를 배열로 변환 및 정렬
        Object.keys(groupedData).forEach((date) => {
            workoutRecordByDateList.push({
                key: date,
                value: groupedData[date],
            });
        });

        // 날짜 기준으로 정렬
        workoutRecordByDateList.sort((a, b) => {
            const dateA = moment(a.key, "MM.DD");
            const dateB = moment(b.key, "MM.DD");
            return dateA.diff(dateB);
        });

        console.log("결과 물", workoutRecordByDateList);
        return workoutRecordByDateList;
    } catch (error) {
        console.error("Error fetching workout records:", error);
        return []; // 오류 발생 시 빈 배열 반환
    }
};
