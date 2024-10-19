import { useMutation, useQueryClient } from "@tanstack/react-query";
import queryKey from "constants/queryKeys";
import { WorkoutLibrary } from "db";
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
        }: Omit<WorkoutLibrary, "id" | "createdAt" | "updatedAt">) =>
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
