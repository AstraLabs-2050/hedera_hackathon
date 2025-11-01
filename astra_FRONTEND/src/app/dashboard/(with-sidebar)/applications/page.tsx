import ApplicationAnalytics from '../../../components/ApplicationAnalytics';
import { Analytics, getApplications } from "../../../../lib/applications";
import JobApplications from "../../../components/JobApplications";

interface AnalyticsCardsProps {
    analytics: Analytics;
}

export default async function page() {
    const { jobs, analytics } = await getApplications();
    return (
        <div>
            {/* <div className='p-8'> */}
                {/* <ApplicationAnalytics analytics={analytics} /> */}
            {/* </div> */}
            <div className='p-8'>
                <JobApplications jobs={jobs} />
            </div>
        </div>
    )
}