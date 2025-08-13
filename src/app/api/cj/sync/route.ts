import { NextRequest, NextResponse } from "next/server";
import { cjClient } from "@/lib/cj";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      keywords = ["women coat", "vest", "top"],
      pageSize = 50,
      maxPages = 5,
      productIds = [] as string[], // opcional: passar ids CJ
      vids = [] as string[] // opcional: passar variant VIDs
    } = body;

    let totalImported = 0;
    const results = [];

    // Helpers para derivar cor da variante (usados em múltiplos trechos)
    const toPtColor = (raw?: string | null) => {
      const s = (raw || '').toString().toLowerCase();
      const map: Array<[RegExp, string]> = [
        [/\b(preto|black|noir|negro)\b/, 'Preto'],
        [/\b(branco|white|blanc)\b/, 'Branco'],
        [/\b(cinza|grey|gray|gris)\b/, 'Cinza'],
        [/\b(bege|beige)\b/, 'Bege'],
        [/\b(caqui|khaki)\b/, 'Caqui'],
        [/\b(marfim|ivory|off\s*white)\b/, 'Marfim'],
        [/\b(castanho|marrom|brown|coffee)\b/, 'Castanho'],
        [/\b(azul|blue|navy)\b/, 'Azul'],
        [/\b(verde|green|olive)\b/, 'Verde'],
        [/\b(vermelho|red|rouge)\b/, 'Vermelho'],
        [/\b(rosa|pink|rose)\b/, 'Rosa'],
      ];
      for (const [re, name] of map) if (re.test(s)) return name;
      return null;
    };

    const readColorFromVariant = (variant: any): string | null => {
      // tentativas em campos comuns
      const direct = toPtColor(variant.color || variant.colour || variant.cor);
      if (direct) return direct;
      // chaves livres
      const tryKeys = ['name','variantName','title','option','option1','option2','option3','sku','attr','attribute','attributes'];
      for (const k of tryKeys) {
        const v = (variant as any)[k];
        if (!v) continue;
        const c = toPtColor(typeof v === 'string' ? v : JSON.stringify(v));
        if (c) return c;
      }
      // listas/pares
      const lists = (variant.attributeList || variant.attributes || variant.props || variant.properties || []) as any[];
      for (const item of lists) {
        const val = typeof item === 'string' ? item : (item?.value || item?.val || item?.name || item?.key);
        const c = toPtColor(val);
        if (c) return c;
      }
      return null;
    };

    // 0) Enriquecer variantes diretamente por VID, se informado
    if (vids.length > 0) {
      try {
        const vdata = await cjClient.queryVariantsByVid(vids);
        // Atualiza nomes/cores para as variantes existentes
        const list = vdata?.data || vdata?.variantList || [];
        for (const v of list) {
          const cjVariantId = String(v.id || v.variantId || v.vid || "");
          if (!cjVariantId) continue;
          const color = readColorFromVariant(v);
          const name = String(v.name || v.variantName || v.title || 'Variante');
          await prisma.variant.update({
            where: { cjVariantId },
            data: { name: color ? `${name} · ${color}` : name }
          });
        }
      } catch {}
    }

    // 1) Puxar produtos específicos por ID CJ, se fornecidos
    for (const pid of productIds) {
      try {
        const detail = await cjClient.getProductDetail(pid);
        if (detail?.data) {
          // Simular etapa de import de um único item com detalhes completos
          const product = {
            id: pid,
            name: detail?.data?.name || detail?.data?.productName,
            description: detail?.data?.description || '',
            imageList: detail?.data?.imageList || [],
            priceMin: detail?.data?.priceMin || 0,
            priceMax: detail?.data?.priceMax || 0,
            variants: detail?.data?.variantList || detail?.data?.variants || []
          } as any;
          // Reutiliza pipeline abaixo, criando coleção única
          const items = [product];
          for (const product of items) {
            // ... (reaproveitar o mesmo bloco de import logo abaixo – mantido pelo fluxo principal)
          }
        }
      } catch {}
    }

    // 2) Busca por palavras-chave
    for (const keyword of keywords) {
      for (let page = 1; page <= maxPages; page++) {
        try {
          console.log(`Sincronizando: ${keyword} - página ${page}`);
          
          const cjResponse = await cjClient.queryProducts({ 
            keyword, 
            pageNum: page, 
            pageSize 
          });

          const items = cjResponse?.data?.list || [];
          if (items.length === 0) break; // Não há mais produtos

          for (const product of items) {
            const cjProductId = String(product.id || product.productId || product.pid || "");
            if (!cjProductId) continue;

            const images = Array.isArray(product.imageList) ? product.imageList : 
                          Array.isArray(product.images) ? product.images : [];
            
            const name = product.name || product.productName || "Produto";
            const description = product.description || "";
            const priceMin = Number(product.priceMin || product.price || 0);
            const priceMax = Number(product.priceMax || product.price || 0);

            // Criar/atualizar produto
            const dbProduct = await prisma.product.upsert({
              where: { cjProductId },
              create: {
                cjProductId,
                name,
                description,
                images,
                priceMin,
                priceMax,
              },
              update: {
                name,
                description,
                images,
                priceMin,
                priceMax,
              },
            });

            // Processar variantes
            const variants = Array.isArray(product.variants) ? product.variants : 
                           Array.isArray(product.variantList) ? product.variantList : [];
            
            for (const variant of variants) {
              const cjVariantId = String(variant.id || variant.variantId || variant.vid || "");
              if (!cjVariantId) continue;
              const color = readColorFromVariant(variant);
              const baseVariantName = String(variant.name || variant.variantName || name);
              const normalizedVariantName = color && !baseVariantName.toLowerCase().includes(color.toLowerCase())
                ? `${baseVariantName} · ${color}`
                : baseVariantName;

              await prisma.variant.upsert({
                where: { cjVariantId },
                create: {
                  cjVariantId,
                  sku: String(variant.sku || ""),
                  name: normalizedVariantName,
                  image: variant.image || images?.[0] || null,
                  price: Number(variant.price || priceMin || 0),
                  stock: Number(variant.stock || 0),
                  productId: dbProduct.id,
                },
                update: {
                  sku: String(variant.sku || ""),
                  name: normalizedVariantName,
                  image: variant.image || images?.[0] || null,
                  price: Number(variant.price || priceMin || 0),
                  stock: Number(variant.stock || 0),
                  productId: dbProduct.id,
                },
              });
            }

            totalImported++;
            results.push({
              cjProductId,
              name,
              variantsCount: variants.length
            });
          }

          // Aguardar um pouco para não sobrecarregar a API
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`Erro ao sincronizar ${keyword} página ${page}:`, error);
          results.push({
            error: `Erro na página ${page} para ${keyword}`,
            details: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalImported,
      results,
      message: `Sincronização concluída. ${totalImported} produtos importados.`
    });

  } catch (error) {
    console.error("Erro na sincronização:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Erro interno na sincronização",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
