import admin from 'firebase-admin';
import { IDeviceTokenRepository } from '../modules/device-tokens/domain/device-token.repository';
import { IPushNotificationService } from '../modules/device-tokens/domain/push-notification-service';

let initialized = false;

function loadServiceAccount(): Record<string, unknown> | null {
  // 1. Intentar desde variable de entorno (Dokploy/producción)
  const envJson = process.env['FIREBASE_SERVICE_ACCOUNT_JSON'];
  if (envJson) {
    try {
      return JSON.parse(envJson);
    } catch (e) {
      console.error('[Firebase] Error parseando FIREBASE_SERVICE_ACCOUNT_JSON:', e);
      return null;
    }
  }

  // 2. Intentar desde archivo local (desarrollo)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('./firebase-service-account.json');
  } catch {
    console.warn('[Firebase] Sin credenciales — notificaciones push deshabilitadas');
    return null;
  }
}

function ensureInitialized(): void {
  if (!initialized) {
    const serviceAccount = loadServiceAccount();
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
    }
    initialized = true;
  }
}

export class FirebaseAdminService implements IPushNotificationService {
  constructor(private readonly tokenRepo: IDeviceTokenRepository) {}

  async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    ensureInitialized();

    if (admin.apps.length === 0) {
      console.log('[Firebase] Sin inicializar — omitiendo push');
      return;
    }

    const deviceTokens = await this.tokenRepo.findByUser(userId);

    if (deviceTokens.length === 0) {
      return;
    }

    const message: admin.messaging.MulticastMessage = {
      tokens: deviceTokens.map((t) => t.token),
      notification: { title, body },
      ...(data !== undefined ? { data } : {}),
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);

      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];

        response.responses.forEach((resp, index) => {
          if (
            !resp.success &&
            resp.error &&
            isUnregisteredError(resp.error)
          ) {
            const token = deviceTokens[index];
            if (token) {
              invalidTokens.push(token.id);
            }
          }
        });

        if (invalidTokens.length > 0) {
          console.log(`[FirebaseAdmin] Limpiando ${invalidTokens.length} tokens inválidos`);
          await Promise.all(invalidTokens.map((id) => this.tokenRepo.delete(id)));
        }
      }

      console.log(`[FirebaseAdmin] Push enviado: ${response.successCount} éxitos, ${response.failureCount} fallos`);
    } catch (err) {
      console.error('[FirebaseAdmin] Error al enviar push:', err);
    }
  }
}

function isUnregisteredError(error: admin.FirebaseError): boolean {
  return (
    error.code === 'messaging/invalid-registration-token' ||
    error.code === 'messaging/registration-token-not-registered'
  );
}
