import { NextRequest, NextResponse } from "next/server";
import { monitoring } from "@/lib/monitoring";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    switch (type) {
      case 'errors':
        const errors = monitoring.getErrors(limit);
        return NextResponse.json({ errors });

      case 'metrics':
        const metricName = searchParams.get('metric') || undefined as string | undefined;
        const metrics = monitoring.getMetrics(metricName, limit);
        return NextResponse.json({ metrics });

      case 'stats':
        const stats = monitoring.getStats();
        return NextResponse.json({ stats });

      case 'health':
        const health = monitoring.getHealth();
        return NextResponse.json({ health });

      default:
        // Retornar tudo
        const allData = {
          errors: monitoring.getErrors(10),
          stats: monitoring.getStats(),
          health: monitoring.getHealth(),
          recentMetrics: monitoring.getMetrics(undefined, 20)
        };
        return NextResponse.json(allData);
    }
  } catch (error) {
    monitoring.logError(error as Error, { endpoint: '/api/monitoring' });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, message, context } = body;

    switch (type) {
      case 'error':
        monitoring.logError(message, context);
        break;
      case 'warning':
        monitoring.logWarning(message, context);
        break;
      case 'metric':
        const { name, value, tags } = body;
        monitoring.addMetric(name, value, tags);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    monitoring.logError(error as Error, { endpoint: '/api/monitoring' });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
