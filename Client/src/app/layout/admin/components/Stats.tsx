import { UserCheck2Icon, Users2, UserX2Icon } from "lucide-react";
import type { UserCounts } from "../../../../lib/types";
import Card from "./Card";

type Props = {
    userCounts: UserCounts
}

/**
 * Stats component for displaying user statistics.
 * @component
 * @param props - The properties for the stats component.
 * @returns The rendered stats component.
 */
export default function Stats(props: Props): React.ReactNode {
    const { userCounts } = props;

    return (
        <div id="stats">
            <Card
                title="Total Users"
                icon={<Users2 />}
                number={userCounts.totalUsers}
            />
            <Card
                title="Active Users"
                icon={<UserCheck2Icon />}
                number={userCounts.activeUsers}
                numberColor="success"
                info={`${((userCounts.activeUsers / userCounts.totalUsers) * 100).toFixed(0)}% of users`}
            />
            <Card
                title="Inactive Users"
                icon={<UserX2Icon />}
                number={userCounts.inactiveUsers}
                numberColor="error"
                info={`${((userCounts.inactiveUsers / userCounts.totalUsers) * 100).toFixed(0)}% of users`}
            />
        </div>
    )
}