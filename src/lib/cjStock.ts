import { prisma } from '@/lib/db';
import { cjClient } from '@/lib/cj';

export async function updateStockByVariantIds(variantIds: string[]) {
  if (!Array.isArray(variantIds) || variantIds.length === 0) {
    return { updated: 0, results: [] as Array<{ cjVariantId: string; stock: number; updated?: boolean; error?: string }> };
  }

  const stockResp = await cjClient.queryStockByVid(variantIds);
  const stockData: any[] = stockResp?.data?.list || stockResp?.data || [];

  const results: Array<{ cjVariantId: string; stock: number; updated?: boolean; error?: string }> = [];
  let updated = 0;

  for (const stockItem of stockData) {
    const cjVariantId = String(stockItem.vid || stockItem.variantId || '');
    if (!cjVariantId) continue;
    const stock = Number(stockItem.stock || 0);
    try {
      const res = await prisma.variant.updateMany({ where: { cjVariantId }, data: { stock } });
      if (res.count > 0) {
        updated += res.count;
        results.push({ cjVariantId, stock, updated: true });
      } else {
        results.push({ cjVariantId, stock, updated: false });
      }
    } catch (e: any) {
      results.push({ cjVariantId, stock, error: e?.message || 'Erro ao atualizar no banco local' });
    }
  }

  return { updated, results };
}


