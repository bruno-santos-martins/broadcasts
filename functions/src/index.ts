import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onRequest } from 'firebase-functions/v2/https';
import { processPendingBroadcasts } from './use-cases/processPendingBroadcasts';

/**
 * Trigger Agendado Oficial (Cloud Scheduler via Firebase Functions v2)
 * 
 * Configurações de Engenharia:
 * - schedule: 'every 1 minutes' -> Gatilho executado a cada minuto para processar a fila.
 * - timeZone: 'America/Sao_Paulo' -> Alinha o agendamento ao horário comercial do Brasil.
 * - region: 'us-central1' -> Data center de baixo custo e alta disponibilidade da Google.
 * - maxInstances: 1 -> Garante singleton de execução: impede que duas funções paralelas 
 *   processem a mesma mensagem simultaneamente (evitando envios duplicados no WhatsApp).
 * - memory: '256MiB' -> Alocação enxuta, suficiente para processamento de filas e baixo custo.
 */
export const processScheduledBroadcasts = onSchedule(
  {
    schedule: 'every 1 minutes',
    timeZone: 'America/Sao_Paulo',
    region: 'us-central1',
    maxInstances: 1,
    memory: '256MiB',
  },
  async () => {
    await processPendingBroadcasts();
  }
);

/**
 * Endpoint HTTP Auxiliar para Disparo Sob Demanda (v2 HTTPS)
 * 
 * Por que este endpoint existe?
 * Em ambientes de desenvolvimento com Firebase Emulators, o Cloud Scheduler 
 * não emula o cron de relógio automaticamente em background.
 * 
 * Este endpoint permite que desenvolvedores e avaliadores técnicos testem o 
 * processamento das mensagens agendadas com um simples clique no navegador ou cURL:
 * GET http://localhost:5001/desafio-gcp-zap/us-central1/triggerProcessScheduledBroadcasts
 */
export const triggerProcessScheduledBroadcasts = onRequest(
  {
    region: 'us-central1',
    cors: true,
  },
  async (_req, res) => {
    try {
      const result = await processPendingBroadcasts();
      res.status(200).json({
        success: true,
        message: 'Disparos processados com sucesso!',
        ...result,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Erro interno';
      res.status(500).json({
        success: false,
        error: errorMsg,
      });
    }
  }
);
