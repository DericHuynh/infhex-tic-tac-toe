import { inject, injectable } from 'tsyringe';
import {
    type Leaderboard,
    type LeaderboardPlacement,
    type LeaderboardPlayer,
} from '@ih3t/shared';
import { AuthRepository, type AccountUserProfile } from '../auth/authRepository';
import { GameHistoryRepository, type PlayerLeaderboardStats } from '../persistence/gameHistoryRepository';

const LEADERBOARD_REFRESH_INTERVAL_MS = 10 * 60 * 1000;

interface LeaderboardPlacementCache {
    generatedAt: number;
    nextRefreshAt: number;
    refreshIntervalMs: number;
    profileIds: string[];
    topPlayerStats: PlayerLeaderboardStats[];
    topPlayerProfiles: Map<string, AccountUserProfile>
}

@injectable()
export class LeaderboardService {
    private leaderboardCache: LeaderboardPlacementCache | null = null;

    constructor(
        @inject(GameHistoryRepository) private readonly gameHistoryRepository: GameHistoryRepository,
        @inject(AuthRepository) private readonly authRepository: AuthRepository
    ) { }

    async getLeaderboardSnapshot(targetProfileId: string | null = null, nowMs = Date.now()): Promise<Leaderboard> {
        const placementCache = await this.getPlacementCache(nowMs);
        const players = placementCache.topPlayerStats.map((player) => this.mapLeaderboardPlayer(player, placementCache.topPlayerProfiles));

        return {
            generatedAt: placementCache.generatedAt,
            nextRefreshAt: placementCache.nextRefreshAt,
            refreshIntervalMs: placementCache.refreshIntervalMs,
            players,

            ownPlacement: await this.getTargetLeaderboardPlayer(targetProfileId, placementCache.profileIds)
        };
    }

    private async getPlacementCache(nowMs: number): Promise<LeaderboardPlacementCache> {
        const currentWindowStart = Math.floor(nowMs / LEADERBOARD_REFRESH_INTERVAL_MS) * LEADERBOARD_REFRESH_INTERVAL_MS;
        const nextRefreshAt = currentWindowStart + LEADERBOARD_REFRESH_INTERVAL_MS;

        if (this.leaderboardCache && this.leaderboardCache.generatedAt >= currentWindowStart) {
            return {
                ...this.leaderboardCache,
                nextRefreshAt
            };
        }

        const profileIds = await this.gameHistoryRepository.getLeaderboardProfileIds();
        const topProfileIds = profileIds.slice(0, 10);
        const topPlayerStatsByProfileId = await this.gameHistoryRepository.getLeaderboardStatsForPlayers(topProfileIds);
        const topPlayerProfiles = await this.authRepository.getUserProfilesByIds(topProfileIds);

        this.leaderboardCache = {
            generatedAt: nowMs,
            nextRefreshAt,
            refreshIntervalMs: LEADERBOARD_REFRESH_INTERVAL_MS,
            profileIds,

            topPlayerStats: topProfileIds.flatMap((profileId) => {
                const player = topPlayerStatsByProfileId.get(profileId);
                return player ? [player] : [];
            }),
            topPlayerProfiles
        };

        return this.leaderboardCache;
    }

    private async getTargetLeaderboardPlayer(
        profileId: string | null,
        placementProfileIds: string[],
    ): Promise<LeaderboardPlacement | null> {
        if (!profileId) {
            return null;
        }

        const [players, profiles] = await Promise.all([
            this.gameHistoryRepository.getLeaderboardStatsForPlayers([profileId]),
            this.authRepository.getUserProfilesByIds([profileId])
        ]);

        const statistics = players.get(profileId) ?? null;
        if (!statistics) {
            return null;
        }

        const rank = placementProfileIds.indexOf(profileId) + 1;
        if (rank <= 0) {
            return null;
        }

        return this.mapLeaderboardPlacement(statistics, rank, profiles);
    }

    private mapLeaderboardPlayer(
        player: PlayerLeaderboardStats,
        profiles: Map<string, AccountUserProfile>
    ): LeaderboardPlayer {
        const profile = profiles.get(player.profileId);

        return {
            profileId: player.profileId,
            displayName: profile?.username?.trim() || player.displayName,
            image: profile?.image ?? null,
            gamesPlayed: player.gamesPlayed,
            gamesWon: player.gamesWon,
            winRatio: player.winRatio
        };
    }

    private mapLeaderboardPlacement(
        player: PlayerLeaderboardStats,
        rank: number,
        profiles: Map<string, AccountUserProfile>
    ): LeaderboardPlacement {
        return {
            ...this.mapLeaderboardPlayer(player, profiles),
            rank
        };
    }
}
