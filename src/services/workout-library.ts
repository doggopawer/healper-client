import { db, WorkoutLibrary } from "db";
import { v4 as uuidv4 } from "uuid";

export const getWorkoutLibraryAll = async (
    name?: string,
    category?: string
): Promise<WorkoutLibrary[]> => {
    try {
        // 데이터베이스에서 모든 운동 가져오기
        const workoutsLibraries = await db.workoutLibraries.toArray();

        // 생성 시간(createdAt) 기준으로 정렬 (오름차순)
        workoutsLibraries.sort((a, b) => {
            return (
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
        });

        // 카테고리에 따라 필터링
        const filteredWorkouts = workoutsLibraries.filter((workout) => {
            const categoryMatch = category
                ? workout.category === category
                : true;
            const nameMatch = name ? workout.name.includes(name) : true; // name 포함 여부 체크
            return categoryMatch && nameMatch;
        });

        return filteredWorkouts; // 필터링된 운동 배열 반환
    } catch (error) {
        console.error("Error fetching workout library:", error);
        throw new Error("Failed to fetch workout library"); // 오류 발생 시 예외 던짐
    }
};

export const getWorkoutLibraryOne = async (
    workoutLibraryId: string
): Promise<WorkoutLibrary | null> => {
    try {
        // 데이터베이스에서 특정 운동 라이브러리 가져오기
        const workoutLibrary = await db.workoutLibraries.get(workoutLibraryId);
        return workoutLibrary || null; // 운동 라이브러리 반환
    } catch (error) {
        console.error("Error fetching workout library:", error);
        throw new Error("Failed to fetch workout library"); // 오류 발생 시 예외 던짐
    }
};

export const createWorkoutLibraryOne = async (
    workoutData: Omit<WorkoutLibrary, "id" | "createdAt" | "updatedAt">
): Promise<WorkoutLibrary | null> => {
    const newWorkoutLibraryOne: WorkoutLibrary = {
        id: uuidv4(), // UUID로 ID 생성
        name: workoutData.name,
        image: workoutData.image,
        category: workoutData.category,
        type: workoutData.type,
        isEditable: workoutData.isEditable,
        createdAt: new Date(), // 현재 날짜
        updatedAt: new Date(), // 현재 날짜
        userId: workoutData.userId, // 사용자 ID
    };

    try {
        await db.workoutLibraries.add(newWorkoutLibraryOne); // 데이터베이스에 추가
        console.log("WorkoutConfig created:", newWorkoutLibraryOne);
        return newWorkoutLibraryOne; // 생성된 운동 구성 반환
    } catch (error) {
        console.error("Error creating WorkoutConfig:", error);
        return null; // 오류 발생 시 null 반환
    }
};

export const updateWorkoutLibraryField = async (
    workoutLibraryId: string,
    key: string, // WorkoutLibrary의 키로 제한
    value: string | number // value는 string 또는 number로 받을 수 있음
): Promise<WorkoutLibrary | null> => {
    try {
        // 데이터베이스에서 WorkoutLibrary 가져오기
        const workoutLibrary = await db.workoutLibraries.get(workoutLibraryId);

        if (!workoutLibrary) {
            console.error("WorkoutLibrary not found");
            return null; // 해당 ID의 WorkoutLibrary가 존재하지 않을 경우
        }

        // 필드 업데이트
        workoutLibrary[key] = value; // key에 해당하는 필드 업데이트

        // 업데이트된 운동 라이브러리 저장
        await db.workoutLibraries.put(workoutLibrary);
        console.log("WorkoutLibrary updated:", workoutLibrary);
        return workoutLibrary; // 업데이트된 WorkoutLibrary 반환
    } catch (error) {
        console.error("Error updating WorkoutLibrary:", error);
        return null; // 오류 발생 시 null 반환
    }
};

export const updateWorkoutLibraryOne = async (
    workoutLibraryId: string,
    updatedData: Partial<WorkoutLibrary> // 업데이트할 데이터
): Promise<boolean> => {
    try {
        // 해당 워크아웃 라이브러리 항목을 가져옵니다.
        const workoutLibrary = await db.workoutLibraries.get(workoutLibraryId);

        if (!workoutLibrary) {
            console.error("WorkoutLibrary not found for ID:", workoutLibraryId);
            return false; // 항목이 존재하지 않음
        }

        // 업데이트할 데이터로 항목을 수정합니다.
        const newData = { ...workoutLibrary, ...updatedData };

        // 데이터 저장
        await db.workoutLibraries.put(newData);

        console.log("WorkoutLibrary updated:", newData);
        return true; // 업데이트 성공
    } catch (error) {
        console.error("Error updating WorkoutLibrary:", error);
        return false; // 오류 발생
    }
};

export const deleteWorkoutLibraryOne = async (
    workoutLibraryId: string
): Promise<boolean> => {
    try {
        // 해당 워크아웃 라이브러리 항목을 삭제합니다.
        await db.workoutLibraries.delete(workoutLibraryId);

        console.log(
            `WorkoutLibrary with ID ${workoutLibraryId} has been deleted.`
        );
        return true; // 삭제 성공
    } catch (error) {
        console.error("Error deleting WorkoutLibrary:", error);
        return false; // 오류 발생
    }
};
