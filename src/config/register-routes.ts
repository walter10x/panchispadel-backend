import { Express } from 'express';
import { AppDataSource } from './database';
import type { IWsGateway } from '../modules/websocket/domain/ws-gateway';

// Users
import { TypeOrmUserRepository } from '../modules/users/infrastructure/typeorm-user.repository';
import { RegisterUserUseCase } from '../modules/users/application/register-user.use-case';
import { LoginUserUseCase } from '../modules/users/application/login-user.use-case';
import { GetUserUseCase } from '../modules/users/application/get-user.use-case';
import { RefreshTokenUseCase } from '../modules/users/application/refresh-token.use-case';
import { UserController } from '../modules/users/http/user.controller';
import { createUserRoutes } from '../modules/users/http/user.routes';
import { UserOrmEntity } from '../modules/users/infrastructure/user-orm.entity';

// Matches
import { TypeOrmMatchRepository } from '../modules/matches/infrastructure/typeorm-match.repository';
import { CreateMatchUseCase } from '../modules/matches/application/create-match.use-case';
import { JoinMatchUseCase } from '../modules/matches/application/join-match.use-case';
import { LeaveMatchUseCase } from '../modules/matches/application/leave-match.use-case';
import { CancelMatchUseCase } from '../modules/matches/application/cancel-match.use-case';
import { ConfirmPlayerUseCase } from '../modules/matches/application/confirm-player.use-case';
import { RejectPlayerUseCase } from '../modules/matches/application/reject-player.use-case';
import { ListMatchesUseCase } from '../modules/matches/application/list-matches.use-case';
import { GetMatchUseCase } from '../modules/matches/application/get-match.use-case';
import { UpdateMatchUseCase } from '../modules/matches/application/update-match.use-case';
import { DeleteMatchUseCase } from '../modules/matches/application/delete-match.use-case';
import { MatchController } from '../modules/matches/http/match.controller';
import { createMatchRoutes } from '../modules/matches/http/match.routes';
import { MatchOrmEntity } from '../modules/matches/infrastructure/match-orm.entity';
import { CreateNotificationUseCase } from '../modules/notifications/application/create-notification.use-case';
import { NotificationServiceImpl } from '../modules/matches/infrastructure/notification-service.impl';

// Results
import { TypeOrmResultRepository } from '../modules/results/infrastructure/typeorm-result.repository';
import { RecordResultUseCase } from '../modules/results/application/record-result.use-case';
import { ConfirmResultUseCase } from '../modules/results/application/confirm-result.use-case';
import { GetResultUseCase } from '../modules/results/application/get-result.use-case';
import { GetMatchResultUseCase } from '../modules/results/application/get-match-result.use-case';
import { ResultController } from '../modules/results/http/result.controller';
import { createResultRoutes } from '../modules/results/http/result.routes';
import { ResultOrmEntity } from '../modules/results/infrastructure/result-orm.entity';

// Clubs
import { TypeOrmClubRepository } from '../modules/clubs/infrastructure/typeorm-club.repository';
import { ListClubsUseCase } from '../modules/clubs/application/list-clubs.use-case';
import { GetClubUseCase } from '../modules/clubs/application/get-club.use-case';
import { CreateClubUseCase } from '../modules/clubs/application/create-club.use-case';
import { UpdateClubUseCase } from '../modules/clubs/application/update-club.use-case';
import { DeleteClubUseCase } from '../modules/clubs/application/delete-club.use-case';
import { ClubController } from '../modules/clubs/http/club.controller';
import { createClubRoutes } from '../modules/clubs/http/club.routes';
import { ClubOrmEntity } from '../modules/clubs/infrastructure/club-orm.entity';
import { ListUsersUseCase } from '../modules/users/application/list-users.use-case';
import { UpdateUserRoleUseCase } from '../modules/users/application/update-user-role.use-case';
import { AdminController } from '../modules/admin/http/admin.controller';
import { createAdminRoutes } from '../modules/admin/http/admin.routes';

// Notifications
import { TypeOrmNotificationRepository } from '../modules/notifications/infrastructure/typeorm-notification.repository';
import { GetUserNotificationsUseCase } from '../modules/notifications/application/get-user-notifications.use-case';
import { MarkAsReadUseCase } from '../modules/notifications/application/mark-as-read.use-case';
import { GetUnreadCountUseCase } from '../modules/notifications/application/get-unread-count.use-case';
import { NotificationController } from '../modules/notifications/http/notification.controller';
import { createNotificationRoutes } from '../modules/notifications/http/notification.routes';
import { NotificationOrmEntity } from '../modules/notifications/infrastructure/notification-orm.entity';

// Device Tokens
import { TypeOrmDeviceTokenRepository } from '../modules/device-tokens/infrastructure/typeorm-device-token.repository';
import { RegisterDeviceTokenUseCase } from '../modules/device-tokens/application/register-device-token.use-case';
import { DeviceTokenController } from '../modules/device-tokens/http/device-token.controller';
import { createDeviceTokenRoutes } from '../modules/device-tokens/http/device-token.routes';
import { DeviceTokenOrmEntity } from '../modules/device-tokens/infrastructure/device-token-orm.entity';
import { FirebaseAdminService } from './firebase-admin';

// Shared middleware
import { authMiddleware } from '../shared/infrastructure/http/auth-middleware';
import { validateBody } from '../shared/infrastructure/http/validate-middleware';
import { authRateLimiter } from '../shared/infrastructure/http/auth-rate-limit.middleware';
import { requireAdmin } from '../shared/infrastructure/http/require-admin.middleware';
import { errorHandler } from '../shared/infrastructure/http/error-handler';

export function registerRoutes(app: Express, wsGateway?: IWsGateway): void {
  // ─── Users ──────────────────────────────────────────────────────────
  const userRepo = new TypeOrmUserRepository(
    AppDataSource.getRepository(UserOrmEntity),
  );
  const registerUserUseCase = new RegisterUserUseCase(userRepo);
  const loginUserUseCase = new LoginUserUseCase(userRepo);
  const getUserUseCase = new GetUserUseCase(userRepo);
  const refreshTokenUseCase = new RefreshTokenUseCase(userRepo);
  const userController = new UserController(
    registerUserUseCase,
    loginUserUseCase,
    getUserUseCase,
    refreshTokenUseCase,
  );
  app.use(
    '/api/users',
    createUserRoutes(userController, {
      validateBody,
      authMiddleware,
      authRateLimiter,
    }),
  );

  // ─── Matches ────────────────────────────────────────────────────────
  const notifRepo = new TypeOrmNotificationRepository(
    AppDataSource.getRepository(NotificationOrmEntity),
  );
  const matchRepo = new TypeOrmMatchRepository(
    AppDataSource.getRepository(MatchOrmEntity),
  );
  const deviceTokenRepo = new TypeOrmDeviceTokenRepository(
    AppDataSource.getRepository(DeviceTokenOrmEntity),
  );
  const firebaseService = new FirebaseAdminService(deviceTokenRepo);
  const createNotifUseCase = new CreateNotificationUseCase(notifRepo, firebaseService, wsGateway);
  const notifService = new NotificationServiceImpl(createNotifUseCase);
  const createMatchUseCase = new CreateMatchUseCase(matchRepo, notifService, wsGateway);
  const joinMatchUseCase = new JoinMatchUseCase(matchRepo, notifService, wsGateway);
  const leaveMatchUseCase = new LeaveMatchUseCase(matchRepo, notifService, wsGateway);
  const cancelMatchUseCase = new CancelMatchUseCase(matchRepo, notifService, wsGateway);
  const confirmPlayerUseCase = new ConfirmPlayerUseCase(matchRepo, notifService, wsGateway);
  const rejectPlayerUseCase = new RejectPlayerUseCase(matchRepo, notifService, wsGateway);
  const listMatchesUseCase = new ListMatchesUseCase(matchRepo);
  const getMatchUseCase = new GetMatchUseCase(matchRepo);
  const updateMatchUseCase = new UpdateMatchUseCase(matchRepo);
  const deleteMatchUseCase = new DeleteMatchUseCase(matchRepo);
  const matchController = new MatchController(
    createMatchUseCase,
    joinMatchUseCase,
    leaveMatchUseCase,
    cancelMatchUseCase,
    listMatchesUseCase,
    confirmPlayerUseCase,
    rejectPlayerUseCase,
    getMatchUseCase,
    updateMatchUseCase,
    deleteMatchUseCase,
  );
  app.use('/api/matches', createMatchRoutes(matchController));

  // ─── Results ────────────────────────────────────────────────────────
  const resultRepo = new TypeOrmResultRepository(
    AppDataSource.getRepository(ResultOrmEntity),
  );
  const recordResultUseCase = new RecordResultUseCase(resultRepo, wsGateway);
  const confirmResultUseCase = new ConfirmResultUseCase(resultRepo, wsGateway);
  const getResultUseCase = new GetResultUseCase(resultRepo);
  const getMatchResultUseCase = new GetMatchResultUseCase(resultRepo);
  const resultController = new ResultController(
    recordResultUseCase,
    confirmResultUseCase,
    getResultUseCase,
    getMatchResultUseCase,
  );
  app.use('/api/results', createResultRoutes(resultController));

  // ─── Clubs ──────────────────────────────────────────────────────────
  const clubRepo = new TypeOrmClubRepository(
    AppDataSource.getRepository(ClubOrmEntity),
  );
  const listClubsUseCase = new ListClubsUseCase(clubRepo);
  const getClubUseCase = new GetClubUseCase(clubRepo);
  const createClubUseCase = new CreateClubUseCase(clubRepo);
  const updateClubUseCase = new UpdateClubUseCase(clubRepo);
  const deleteClubUseCase = new DeleteClubUseCase(clubRepo);
  const clubController = new ClubController(listClubsUseCase, getClubUseCase);
  app.use('/api/clubs', createClubRoutes({ clubController }));

  // ─── Admin ──────────────────────────────────────────────────────────
  const listUsersUseCase = new ListUsersUseCase(userRepo);
  const updateUserRoleUseCase = new UpdateUserRoleUseCase(userRepo);
  const adminController = new AdminController(
    createClubUseCase,
    updateClubUseCase,
    deleteClubUseCase,
    listUsersUseCase,
    updateUserRoleUseCase,
  );
  app.use(
    '/api/admin',
    createAdminRoutes(adminController, {
      authMiddleware,
      requireAdmin,
      validateBody,
    }),
  );

  // ─── Notifications ──────────────────────────────────────────────────
  const getUserNotificationsUseCase = new GetUserNotificationsUseCase(notifRepo);
  const markAsReadUseCase = new MarkAsReadUseCase(notifRepo);
  const getUnreadCountUseCase = new GetUnreadCountUseCase(notifRepo);
  const notifController = new NotificationController(
    getUserNotificationsUseCase,
    markAsReadUseCase,
    getUnreadCountUseCase,
  );
  app.use('/api/notifications', createNotificationRoutes(notifController));

  // ─── Device Tokens ──────────────────────────────────────────────────
  const registerTokenUseCase = new RegisterDeviceTokenUseCase(deviceTokenRepo);
  const deviceTokenController = new DeviceTokenController(registerTokenUseCase);
  app.use('/api/devices', createDeviceTokenRoutes(deviceTokenController));

  // Global error handler (must be last middleware)
  app.use(errorHandler);

  console.log('All routes registered');
}
