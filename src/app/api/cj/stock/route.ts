import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateStockByVariantIds } from "@/lib/cjStock";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { variantIds } = body;

    if (!variantIds || !Array.isArray(variantIds)) {
      return NextResponse.json(
        { success: false, error: "variantIds é obrigatório e deve ser um array" },
        { status: 400 }
      );
    }

    const { updated, results } = await updateStockByVariantIds(variantIds);
    return NextResponse.json({ success: true, updated, results, message: `Estoque atualizado para ${updated} variantes` });

  } catch (error) {
    console.error("Erro na sincronização de estoque:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Erro interno na sincronização de estoque",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "productId é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar variantes do produto
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    type VariantRow = { cjVariantId: string } & Record<string, unknown>;
    const variantIds = (product.variants as VariantRow[]).map((v) => v.cjVariantId);

    if (variantIds.length === 0) {
      return NextResponse.json({
        success: true,
        product,
        message: "Produto não possui variantes"
      });
    }

    // Buscar estoque atualizado da CJ
    const stockResponse = await cjClient.queryStockByVid(variantIds);
    const stockData = stockResponse?.data?.list || [];

    // Mapear dados de estoque para as variantes
    const updatedVariants = product.variants.map((variant: any) => {
      const stockItem = stockData.find((s: any) => String((s.vid || s.variantId)) === variant.cjVariantId);
      return {
        ...variant,
        currentStock: stockItem ? Number(stockItem.stock || 0) : variant.stock
      };
    });

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        variants: updatedVariants
      },
      message: "Estoque atualizado com sucesso"
    });

  } catch (error) {
    console.error("Erro ao buscar estoque:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Erro interno ao buscar estoque",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
