export class DashboardService {
    /**
     * Returns the basic identity for the High Command landing page
     */
    public getLandingData(user: any) {
        return {
            user: {
                id: user?.id,
                name: user?.name ?? 'Commander',
                level: user?.level ?? 1,
                email: user?.email
            },
            title: 'High Command Entry Point'
        };
    }
}