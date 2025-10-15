export default function AdminStats() {
    return (
        <div className="bg-gray-50 pb-10 p-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Performance Summary Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-normal text-gray-900 mb-6">Performance Summary</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-light">Page Views</span>
                            <span className="text-gray-900 font-normal">45,234</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-light">Conversions</span>
                            <span className="text-gray-900 font-normal">1,847</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-light">Bounce Rate</span>
                            <span className="text-gray-900 font-normal">26.8%</span>
                        </div>
                    </div>
                </div>

                {/* User Stats Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-normal text-gray-900 mb-6">User Stats</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-light">New Signups</span>
                            <span className="text-gray-900 font-normal">847</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-light">Verified</span>
                            <span className="text-gray-900 font-normal">763</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-light">Active Today</span>
                            <span className="text-gray-900 font-normal">2,394</span>
                        </div>
                    </div>
                </div>

                {/* Content Status Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-normal text-gray-900 mb-6">Content Status</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-light">Published</span>
                            <span className="text-gray-900 font-normal">156</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-light">Drafts</span>
                            <span className="text-gray-900 font-normal">8</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-light">Scheduled</span>
                            <span className="text-gray-900 font-normal">3</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}