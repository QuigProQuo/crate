import { env } from '../env';
import * as alerts from '../db/queries/alerts';
import * as notifications from '../db/queries/notifications';
import { fetchReleasePrice } from '../services/discogs';

const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 1000;
const STALE_THRESHOLD_S = 6 * 60 * 60; // 6 hours

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkAlerts() {
  const now = Math.floor(Date.now() / 1000);
  const active = alerts.findActive();

  // Filter to alerts not checked in 6h
  const stale = active.filter(
    (a: any) => !a.last_checked || now - a.last_checked > STALE_THRESHOLD_S
  );

  if (stale.length === 0) {
    return;
  }

  console.log(`[price-alerts] checking ${stale.length} alerts`);

  for (let i = 0; i < stale.length; i += BATCH_SIZE) {
    const batch = stale.slice(i, i + BATCH_SIZE);

    for (const alert of batch) {
      try {
        const price = await fetchReleasePrice(alert.discogs_id);

        if (price == null) {
          console.log(`[price-alerts] no price | alertId=${alert.id} | discogsId=${alert.discogs_id}`);
          continue;
        }

        alerts.updatePrice(alert.id, price);

        if (price <= alert.threshold) {
          console.log(
            `[price-alerts] triggered | alertId=${alert.id} | price=${price} | threshold=${alert.threshold} | ${alert.artist} - ${alert.title}`
          );
          alerts.trigger(alert.id);
          notifications.create({
            user_id: alert.user_id,
            type: 'price_alert',
            payload: JSON.stringify({
              alertId: alert.id,
              discogsId: alert.discogs_id,
              title: alert.title,
              artist: alert.artist,
              price,
              threshold: alert.threshold,
            }),
          });
        }
      } catch (err: any) {
        console.error(`[price-alerts] error | alertId=${alert.id} | ${err.message}`);
      }
    }

    // Rate limit between batches
    if (i + BATCH_SIZE < stale.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log(`[price-alerts] done | checked=${stale.length}`);
}

export function startPriceAlertCron() {
  console.log(`[price-alerts] cron started | interval=${env.PRICE_CHECK_INTERVAL_MS}ms`);
  setInterval(checkAlerts, env.PRICE_CHECK_INTERVAL_MS);
  // Run once on startup after a short delay
  setTimeout(checkAlerts, 5000);
}
