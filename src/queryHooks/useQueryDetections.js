import { getDetections } from '../queryApi/detectionsApi';
import { useQuery } from '@tanstack/react-query'

export const useQueryDetections = (queryDate, queryFilters) => {
    const { isPending, isError, data: detections, refetch } = useQuery({
      queryKey: ['detections', queryDate, queryFilters],
      queryFn: getDetections,
      // enabled: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      initialData: null, // isPending will be set to false by default even if enabled is false
      refetchInterval: false, // set to time in millisecond if you want to refetch polling
    })

    return { isPending, isError, detections, refetch };
}