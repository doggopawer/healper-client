import { useSuspenseQuery } from "@tanstack/react-query";
import queryKey from "constants/queryKeys";
import { getWorkoutRecordSumAll } from "services/workout-record";
import { Period } from "types/enum";

const useGetWorkoutRecordSumAllQuery = ({
    workoutLibraryId,
    period,
}: {
    workoutLibraryId: string;
    period: Period;
}) => {
    return useSuspenseQuery({
        queryKey: [queryKey.getWorkoutRecordSumAll, workoutLibraryId, period],
        queryFn: async () => {
            const data = await getWorkoutRecordSumAll({
                workoutLibraryId,
                period,
            });
            return data;
        },
    });
};

export default useGetWorkoutRecordSumAllQuery;
