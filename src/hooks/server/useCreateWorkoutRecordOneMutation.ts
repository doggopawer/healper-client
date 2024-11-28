import { useMutation } from "@tanstack/react-query";
import { WorkoutLibrary } from "types/model";
import { createWorkoutRecordOne } from "services/workout-record";

const useCreateWorkoutRecordOneMutation = () => {
    return useMutation({
        mutationFn: ({
            routineRecordId,
            workoutLibrary,
        }: {
            routineRecordId: string;
            workoutLibrary: WorkoutLibrary;
        }) => createWorkoutRecordOne({ routineRecordId, workoutLibrary }),
        onSettled: () => {},
    });
};

export default useCreateWorkoutRecordOneMutation;
