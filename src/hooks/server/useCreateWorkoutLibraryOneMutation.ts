import { useMutation, useQueryClient } from "@tanstack/react-query";
import queryKey from "constants/queryKeys";
import { WorkoutLibrary } from "types/model";
import { createWorkoutLibraryOne } from "services/workout-library";

const useCreateWorkoutLibraryOneMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            name,
            image,
            category,
            type,
            isEditable,
            userId,
        }: Omit<WorkoutLibrary, "_id" | "createdAt" | "updatedAt">) =>
            createWorkoutLibraryOne({
                name,
                image,
                category,
                type,
                isEditable,
                userId,
            }),
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: [queryKey.getWorkoutLibraryAll],
            });
        },
    });
};

export default useCreateWorkoutLibraryOneMutation;
