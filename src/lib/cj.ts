import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import https from 'https';
import Bottleneck from "bottleneck";

const CJ_API_BASE = process.env.CJ_API_BASE || "https://api.cjdropshipping.com";
const CJ_API_KEY = process.env.CJ_API_KEY || "";
// Fallback por IP para ambientes com DNS bloqueado
const CJ_API_IP = process.env.CJ_API_IP || ""; // ex.: 104.26.6.51
const CJ_API_HOST = process.env.CJ_API_HOST || "api.cjdropshipping.com";
const CJ_TIMEOUT_MS = Number(process.env.CJ_TIMEOUT_MS || 20000);

type AccessTokenResponse = {
  data: { accessToken: string; refreshToken: string; expiresIn: number };
};

class CJClient {
  private http: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private limiter: Bottleneck;

  constructor() {
    // Suporte a fallback por IP mantendo SNI/Host corretos para TLS
    const useIpFallback = Boolean(CJ_API_IP);
    const baseURL = useIpFallback ? `https://${CJ_API_IP}` : CJ_API_BASE;

    const agent = useIpFallback
      ? new https.Agent({ servername: CJ_API_HOST, keepAlive: true })
      : new https.Agent({ keepAlive: true });

    this.http = axios.create({
      baseURL,
      timeout: CJ_TIMEOUT_MS,
      httpsAgent: agent,
      // Evitar que axios tente usar proxy do ambiente que pode quebrar o IP fallback
      proxy: false
    });
    this.limiter = new Bottleneck({
      // 1000/h (renova a cada hora)
      reservoir: 1000,
      reservoirRefreshAmount: 1000,
      reservoirRefreshInterval: 60 * 60 * 1000,
      minTime: 50,
    });

    this.http.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers = config.headers || {};
        // De acordo com a API v2 da CJ, o header recomendado é CJ-Access-Token
        (config.headers as any)["CJ-Access-Token"] = this.accessToken;
      }
      // Se estivermos usando IP, precisamos setar o Host correto para o backend da CJ
      if (CJ_API_IP) {
        config.headers = config.headers || {};
        (config.headers as any)["Host"] = CJ_API_HOST;
      }
      return config;
    });

    this.http.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original: any = error.config;
        if (error.response?.status === 401 && !original.__retried) {
          original.__retried = true;
          await this.refreshAccessToken();
          return this.http(original);
        }
        throw error;
      }
    );
  }

  private async run<T>(fn: () => Promise<T>): Promise<T> {
    return this.limiter.schedule(fn);
  }

  async authenticate(): Promise<void> {
    const resp = await this.run(() =>
      this.http.post<AccessTokenResponse>("/authentication/getAccessToken", null, {
        headers: { "CJ-API-KEY": CJ_API_KEY },
      })
    );
    this.accessToken = resp.data.data.accessToken;
    this.refreshToken = resp.data.data.refreshToken;
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      await this.authenticate();
      return;
    }
    const resp = await this.run(() =>
      this.http.post<AccessTokenResponse>(
        "/authentication/refreshAccessToken",
        { refreshToken: this.refreshToken },
        { headers: { "CJ-API-KEY": CJ_API_KEY } }
      )
    );
    this.accessToken = resp.data.data.accessToken;
    this.refreshToken = resp.data.data.refreshToken;
  }

  async queryProducts(payload: any) {
    await this.ensureAuth();
    const { data } = await this.run(() => this.http.post("/product/query", payload));
    return data;
  }

  async getProduct(productId: string) {
    await this.ensureAuth();
    const { data } = await this.run(() => 
      this.http.post("/product/getProduct", { productId })
    );
    return data;
  }

  async getProductDetail(productId: string) {
    await this.ensureAuth();
    const { data } = await this.run(() => 
      this.http.post("/product/getProductDetail", { productId })
    );
    return data;
  }

  async queryVariantsByVid(vids: string[]) {
    await this.ensureAuth();
    const { data } = await this.run(() =>
      this.http.post("/product/variant/queryByVid", { vidList: vids })
    );
    return data;
  }

  async queryStockByVid(vids: string[]) {
    await this.ensureAuth();
    const { data } = await this.run(() =>
      this.http.post("/product/stock/queryByVid", { vidList: vids })
    );
    return data;
  }

  async createOrderV2(payload: any) {
    await this.ensureAuth();
    const { data } = await this.run(() =>
      this.http.post("/shopping/order/createOrderV2", payload)
    );
    return data;
  }

  async listOrders(payload: any) {
    await this.ensureAuth();
    const { data } = await this.run(() => this.http.post("/shopping/order/list", payload));
    return data;
  }

  async getOrderDetail(payload: any) {
    await this.ensureAuth();
    const { data } = await this.run(() =>
      this.http.post("/shopping/order/getOrderDetail", payload)
    );
    return data;
  }

  async getTrackInfo(payload: any) {
    await this.ensureAuth();
    const { data } = await this.run(() => this.http.post("/logistic/getTrackInfo", payload));
    return data;
  }

  async trackInfo(payload: any) {
    await this.ensureAuth();
    const { data } = await this.run(() => this.http.post("/logistic/trackInfo", payload));
    return data;
  }

  async freightCalculate(payload: any) {
    await this.ensureAuth();
    const { data } = await this.run(() =>
      this.http.post("/logistic/freightCalculate", payload)
    );
    return data;
  }

  private async ensureAuth() {
    if (!this.accessToken) {
      await this.authenticate();
    }
  }
}

export const cjClient = new CJClient();


