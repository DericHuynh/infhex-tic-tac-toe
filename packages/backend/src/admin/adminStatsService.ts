import { inject, injectable } from 'tsyringe';
import {
    type AdminLeaderboard,
    type AdminLeaderboardPlayer,
    type AdminStatsResponse,
    type AdminStatsWindow,
    zAdminStatsResponse,
} from '@ih3t/shared';
import { AuthRepository } from '../auth/authRepository';
import { SocketServerGateway } from '../network/createSocketServer';
import { GameHistoryRepository } from '../persistence/gameHistoryRepository';
import { MetricsRepository } from '../persistence/metricsRepository';
import { SessionManager } from '../session/sessionManager';

interface AdminStatsInterval {
    startAt: number;
    endAt: number;
}

const LEADERBOARD_REFRESH_INTERVAL_MS = 10 * 60 * 1000;

@injectable()
export class AdminStatsService {
    private leaderboardCache: AdminLeaderboard | null = null;

    constructor(
        @inject(SessionManager) private readonly sessionManager: SessionManager,
        @inject(SocketServerGateway) private readonly socketServerGateway: SocketServerGateway,
        @inject(MetricsRepository) private readonly metricsRepository: MetricsRepository,
        @inject(GameHistoryRepository) private readonly gameHistoryRepository: GameHistoryRepository,
        @inject(AuthRepository) private readonly authRepository: AuthRepository
    ) { }

    async getStats(now = new Date(), timezoneOffsetMinutes = now.getTimezoneOffset()): Promise<AdminStatsResponse> {
        const generatedAt = now.getTime();
        const intervals = this.createIntervals(generatedAt, timezoneOffsetMinutes);
        const leaderboard = await this.getLeaderboardSnapshot(generatedAt);

        const [sinceMidnight, last24Hours, last7Days] = await Promise.all([
            this.getIntervalStats(intervals.sinceMidnight),
            this.getIntervalStats(intervals.last24Hours),
            this.getIntervalStats(intervals.last7Days)
        ]);

        return zAdminStatsResponse.parse({
            generatedAt,
            activeGames: this.sessionManager.getActiveSessionCounts(),
            connectedClients: this.socketServerGateway.getConnectedClientCount(),
            leaderboard,
            intervals: {
                sinceMidnight,
                last24Hours,
                last7Days
            }
        } satisfies AdminStatsResponse);
    }

    async getLeaderboardSnapshot(nowMs = Date.now()): Promise<AdminLeaderboard> {
        const currentWindowStart = Math.floor(nowMs / LEADERBOARD_REFRESH_INTERVAL_MS) * LEADERBOARD_REFRESH_INTERVAL_MS;
        const nextRefreshAt = currentWindowStart + LEADERBOARD_REFRESH_INTERVAL_MS;

        if (this.leaderboardCache && this.leaderboardCache.generatedAt >= currentWindowStart) {
            return {
                ...this.leaderboardCache,
                nextRefreshAt
            };
        }

        const playerStats = await this.gameHistoryRepository.getTopPlayerStats(10);
        const profiles = await this.authRepository.getUserProfilesByIds(playerStats.map((player) => player.profileId));
        const players: AdminLeaderboardPlayer[] = playerStats.map((player) => {
            const profile = profiles.get(player.profileId);

            return {
                profileId: player.profileId,
                displayName: profile?.username?.trim() || player.displayName,
                image: profile?.image ?? null,
                gamesPlayed: player.gamesPlayed,
                gamesWon: player.gamesWon,
                winRatio: player.winRatio
            };
        });

        this.leaderboardCache = {
            generatedAt: nowMs,
            nextRefreshAt,
            refreshIntervalMs: LEADERBOARD_REFRESH_INTERVAL_MS,
            players
        };

        return this.leaderboardCache;
    }

    private async getIntervalStats(interval: AdminStatsInterval): Promise<AdminStatsWindow> {
        const [siteVisits, gameStats] = await Promise.all([
            this.metricsRepository.countByEventBetween(
                'site-visited',
                new Date(interval.startAt).toISOString(),
                new Date(interval.endAt).toISOString()
            ),
            this.gameHistoryRepository.getAdminWindowStats(interval.startAt, interval.endAt)
        ]);

        return {
            startAt: interval.startAt,
            endAt: interval.endAt,
            siteVisits,
            gamesPlayed: gameStats.gamesPlayed,
            longestGameInMoves: gameStats.longestGameInMoves,
            longestGameInDuration: gameStats.longestGameInDuration
        };
    }

    private createIntervals(nowMs: number, timezoneOffsetMinutes: number) {
        return {
            sinceMidnight: {
                startAt: this.getMidnightTimestamp(nowMs, timezoneOffsetMinutes),
                endAt: nowMs
            },
            last24Hours: {
                startAt: nowMs - 24 * 60 * 60 * 1000,
                endAt: nowMs
            },
            last7Days: {
                startAt: nowMs - 7 * 24 * 60 * 60 * 1000,
                endAt: nowMs
            }
        };
    }

    private getMidnightTimestamp(nowMs: number, timezoneOffsetMinutes: number): number {
        const shiftedNow = new Date(nowMs - timezoneOffsetMinutes * 60 * 1000);
        shiftedNow.setUTCHours(0, 0, 0, 0);
        return shiftedNow.getTime() + timezoneOffsetMinutes * 60 * 1000;
    }
}
