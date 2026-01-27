export async function getUserActiveAdsCount(userId: string): Promise<number> {
    try {
        if (!isSupabaseConfigured) return 0 // or handle fallback if needed, but we removed it for creation

        const { count, error } = await supabase
            .from('ads')
            .select('*', { count: 'exact', head: true }) // head: true means no data returned, only count
            .eq('user_id', userId)
            .eq('status', 'active')

        if (error) {
            console.error("[v0] Error counting user ads:", error)
            return 0
        }

        return count || 0
    } catch (error) {
        console.error("[v0] Unexpected error counting user ads:", error)
        return 0
    }
}
