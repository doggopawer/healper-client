import { useSuspenseQuery } from "@tanstack/react-query";
import queryKey from "constants/queryKeys";
import { getWorkoutLibraryAll } from "services/workout-library";

const useGetWorkoutLibraryAllQuery = (name?: string, category?: string) => {
    return useSuspenseQuery({
        queryKey: [queryKey.getWorkoutLibraryAll, category, name],
        queryFn: async () => {
            const data = await getWorkoutLibraryAll({
                name,
                category,
            });
            return data;
        },
    });
};

export default useGetWorkoutLibraryAllQuery;
