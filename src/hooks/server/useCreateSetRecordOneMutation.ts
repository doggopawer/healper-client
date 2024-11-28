import { useMutation, useQueryClient } from "@tanstack/react-query";
import queryKey from "constants/queryKeys";
import { SetConfig } from "types/model";
import { createSetRecordOne } from "services/set-record";

const useCreateSetRecordOneMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            routineRecordId,
            workoutRecordId,
            setConfig,
        }: {
            routineRecordId: string;
            workoutRecordId: string;
            setConfig: SetConfig;
        }) =>
            createSetRecordOne({ routineRecordId, workoutRecordId, setConfig }),
        onSettled: () => {
            // queryClient.invalidateQueries({
            //     queryKey: [queryKey.getRoutineConfigOne],
            // });
        },
    });
};

export default useCreateSetRecordOneMutation;
