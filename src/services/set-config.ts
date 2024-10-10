import { db, SetConfig } from "db";
import { v4 as uuidv4 } from "uuid";

export const getSetConfigAll = async () => {};

export const createSetConfigOne = async (
    workoutConfigId: string
): Promise<SetConfig | null> => {
    const currentSetConfigs = await db.setConfigs.toArray(); // 모든 SetConfig를 가져옵니다.
    const order = currentSetConfigs.length;

    const newSetConfig: SetConfig = {
        id: uuidv4(),
        workoutConfigId,
        order, // <= setConfigs의 길이보다 1 큰값을 order로 set하기
        rep: 0,
        weight: 0,
        restSec: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    try {
        await db.setConfigs.add(newSetConfig);
        console.log("SetConfig created:", newSetConfig);
        return newSetConfig;
    } catch (error) {
        console.error("Error creating SetConfig:", error);
        return null;
    }
};

export const updateSetConfigField = async (
    setConfigId: string,
    key: string, // SetConfig의 키로 제한
    value: string // value는 string 또는 number로 받을 수 있음
): Promise<SetConfig | null> => {
    try {
        // 데이터베이스에서 SetConfig 가져오기
        const setConfig = await db.setConfigs.get(setConfigId);

        if (!setConfig) {
            console.error("SetConfig not found");
            return null; // 해당 ID의 SetConfig가 존재하지 않을 경우
        }

        // 필드 업데이트
        setConfig[key] = parseInt(value); // key에 해당하는 필드 업데이트

        // 업데이트된 세트 구성 저장
        await db.setConfigs.put(setConfig);
        console.log("SetConfig updated:", setConfig);
        return setConfig; // 업데이트된 SetConfig 반환
    } catch (error) {
        console.error("Error updating SetConfig:", error);
        return null; // 오류 발생 시 null 반환
    }
};