import BN from "bignumber.js";
import axios, { Method } from "axios";
import Web3 from "web3";
import { TransactionReceipt } from "web3-core";
import { Contract } from "web3-eth-contract";

const sleep = (timeout: number) =>
  new Promise((resolve) => setTimeout(resolve, timeout));

export interface WiseWolvesOptions {
  url: string;
  login: string;
  password: string;
  code: string;
  client: string;
  deny: string[];
}

export interface WiseWolvesConfig {
  type: "WiseWolves";
  options: WiseWolvesOptions;
}

export function isWiseWolvesConfig(config: any): config is WiseWolvesConfig {
  return (
    typeof config === "object" &&
    config.type === "WiseWolves" &&
    config.options !== undefined &&
    typeof config.options.url === "string" &&
    typeof config.options.login === "string" &&
    typeof config.options.password === "string" &&
    typeof config.options.code === "string" &&
    typeof config.options.client === "string" &&
    Array.isArray(config.options.deny)
  );
}

export interface AuthKey {
  userKey: string;
  needToSetup: boolean;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
}

export interface SignedData {
  data: string;
  signature: string;
}

export interface MoneyAmount {
  currency: string;
  amount: number;
  signedData: SignedData;
}

export interface GeneralInfoClient {
  id: string;
  name: string;
  balanceTotals: MoneyAmount[];
  profitTotals: MoneyAmount[];
  profitPercent: number;
  moneyTotals: MoneyAmount[];
  moneyDetails: MoneyAmount[];
  portfolioTotals: MoneyAmount[];
  portfolioDetails: MoneyAmount[];
}

export enum AssetType {
  Bond = 1,
  Equity = 2,
  DepositaryReceipt = 99,
}

export interface Portfolio {
  assetId: string;
  isin: string;
  assetName: string;
  ticker: string;
  amount: number;
  baseValue: number;
  currentPrice: number;
  currentValue: number;
  profit: number;
  purchasePrice: number;
  deltaPricePercent: number;
  deltaPriceAbsolute: number;
  couponPaymentYear: number;
  issuer: string;
  assetType: AssetType;
  assetTypeName: string;
  country: string;
  currency: string;
  redemptionDate: string;
  currentValueTotals: MoneyAmount[];
  signedData: SignedData;
}

export interface ClientData {
  id: string;
  name: string;
  balanceTotals: MoneyAmount[];
  profitTotals: MoneyAmount[];
  profitPercent: number;
  moneyTotals: MoneyAmount[];
  moneyDetails: MoneyAmount[];
  portfolioTotals: MoneyAmount[];
  portfolioDetails: MoneyAmount[];
  portfolio: Portfolio[];
}

export interface GeneralInfo {
  date: string;
  userName: string;
  clients: GeneralInfoClient[];
  indicativeExchangeCrossRates: Array<{
    currencyFrom: string;
    currencyTo: string;
    rate: number;
    ratePercent: number;
  }>;
  switchCurrencies: string[];
}

export interface MarketAsset {
  id: string;
  isin: string;
  name: string;
  ticker: string;
  currency: string;
  issuer: string;
  country: string;
  currentPrice: number;
  assetType: number;
  assetTypeName: string;
  redemptionDate: string;
  nkd: number;
}

export interface RealAssetInfo {
  id: string;
  amount: string;
  price: string;
  updatedAt: number;
  proofData: string;
  proofSignature: string;
  error: string | null;
}

export interface BlockchainAssetInfo {
  id: string;
  amount: number;
  price: number;
}

export class WiseWolves {
  private accessToken: string | undefined;

  constructor(public readonly options: WiseWolvesOptions = options) {}

  prepareHeaders(headers: any) {
    const preparedHeaders = {
      accept: "application/json",
      "content-type": "application/json-patch+json",
      ...headers,
    };
    if (typeof this.accessToken === "string") {
      preparedHeaders.Authorization = `Bearer ${this.accessToken}`;
    }

    return preparedHeaders;
  }

  async request<T>(method: Method, url: string, headers: Object, data: string) {
    const res = await axios.request({
      method,
      headers: this.prepareHeaders(headers),
      url: `${this.options.url}${url}`,
      data,
    });
    if (res.status !== 200) {
      throw new Error(
        `Request "${url}" error: ${res.status} ${res.data.errMessage}`
      );
    }

    return res.data as T;
  }

  async get<T>(url: string, headers: Object, data: string) {
    return this.request<T>("GET", url, headers, data);
  }

  async post<T>(url: string, headers: Object, data: string) {
    return this.request<T>("POST", url, headers, data);
  }

  async loginstep1(login: string, password: string) {
    return this.post<AuthKey>(
      "/auth/loginstep1",
      {},
      JSON.stringify({ login, password })
    );
  }

  async loginstep2(code: string, userKey: string) {
    return this.post<AuthToken>(
      "/auth/loginstep2",
      {},
      JSON.stringify({ code, userKey })
    );
  }

  async getBrokerageGeneralInfo() {
    return this.get<GeneralInfo>("/brokerage/GetGeneralInfo", {}, "");
  }

  async getBrokerageClientData(clientId: string) {
    return this.get<ClientData>(
      `/brokerage/GetClientDataSigned?clientId=${clientId}`,
      {},
      ""
    );
  }

  getMoneyAssets(moneyList: MoneyAmount[]): RealAssetInfo[] {
    const money = moneyList.filter(
      ({ currency }) =>
        ["USD", "EUR"].includes(currency) &&
        !this.options.deny.includes(currency)
    );
    const getCurrencyPrice = (currency: string) => {
      if (currency === "USD") return "1";
      else if (currency === "EUR") return "1.18583";

      return "0";
    };

    return money.reduce(
      (result: RealAssetInfo[], { currency, amount, signedData }) => {
        const info = {
          id: currency,
          amount: amount >= 0 ? new BN(amount).toFixed(0) : "0",
          price: new BN(getCurrencyPrice(currency))
            .multipliedBy(1e6)
            .toFixed(0),
          updatedAt: 0,
          proofData: signedData.data,
          proofSignature: signedData.signature,
        };

        const updatedAt = parseInt(signedData.data.split("|")[2], 10); // Update timestamp from signed data
        if (isNaN(updatedAt)) {
          return [
            ...result,
            {
              ...info,
              error: `Invalid updated at "${signedData.data}"`,
            },
          ];
        }

        return [
          ...result,
          {
            ...info,
            updatedAt,
            error: null,
          },
        ];
      },
      []
    );
  }

  getBondAssets(portfolio: Portfolio[]): RealAssetInfo[] {
    const bonds = portfolio.filter(
      ({ isin, assetType, currency, amount, baseValue }) =>
        !this.options.deny.includes(isin) &&
        assetType === AssetType.Bond &&
        currency === "USD" &&
        amount > 0 &&
        baseValue > 0
    );

    return bonds.reduce(
      (
        result: RealAssetInfo[],
        { isin, amount, purchasePrice, signedData }
      ) => {
        const info = {
          id: isin,
          amount: amount.toString(),
          price: new BN(purchasePrice).multipliedBy("1000000").toFixed(0), // 6 decimals to USD
          updatedAt: 0,
          proofData: signedData.data,
          proofSignature: signedData.signature,
        };

        const updatedAt = parseInt(signedData.data.split("|")[2], 10); // Update timestamp from signed data
        if (isNaN(updatedAt)) {
          return [
            ...result,
            {
              ...info,
              error: `Invalid updated at "${signedData.data}"`,
            },
          ];
        }

        return [
          ...result,
          {
            ...info,
            updatedAt,
            error: null,
          },
        ];
      },
      []
    );
  }

  logTx({ transactionHash, blockNumber, gasUsed }: TransactionReceipt) {
    console.log(`Transaction: ${transactionHash}
Block number: ${blockNumber}
Gas used: ${gasUsed}
`);
  }

  async run(web3: Web3, depositary: Contract) {
    const { login, password, code, client } = this.options;
    const { userKey } = await this.loginstep1(login, password);
    const { accessToken } = await this.loginstep2(code, userKey);
    this.accessToken = accessToken;

    const generalInfo = await this.getBrokerageGeneralInfo();
    const clientGeneralInfo = generalInfo.clients.find(
      ({ id }) => id === client
    );
    if (clientGeneralInfo === undefined) {
      throw new Error(`General info to client "${client}" not found`);
    }
    const { portfolio, moneyDetails } = await this.getBrokerageClientData(
      clientGeneralInfo.id
    );
    const realAssets = [
      ...this.getMoneyAssets(moneyDetails),
      ...this.getBondAssets(portfolio),
    ];
    const blockchainAssets = (await depositary.methods
      .assets()
      .call()) as BlockchainAssetInfo[];
    const removeAssets = blockchainAssets.filter(
      ({ id }) => realAssets.find((asset) => asset.id === id) === undefined
    );

    await removeAssets.reduce(async (prevTx, { id }) => {
      await prevTx;

      console.log(`Remove asset ${id}`);
      const gas = await depositary.methods
        .remove(id)
        .estimateGas({ from: web3.eth.defaultAccount });
      const tx = await depositary.methods
        .remove(id)
        .send({ from: web3.eth.defaultAccount, gas });
      this.logTx(tx);
      await sleep(15000);
    }, Promise.resolve());
    await realAssets.reduce(
      async (
        prevTx,
        { id, amount, price, updatedAt, proofData, proofSignature, error }
      ) => {
        await prevTx;

        console.log(`Update asset ${id}:`);
        if (error !== null) return console.warn(error); // Continue invalid asset

        console.log(`amount: ${amount}
price: ${price}
updatedAt: ${updatedAt}
proofData: ${proofData}
proofSignature: ${proofSignature}`);
        const gas = await depositary.methods
          .put(id, amount, price, updatedAt, proofData, proofSignature)
          .estimateGas({ from: web3.eth.defaultAccount });
        const tx = await depositary.methods
          .put(id, amount, price, updatedAt, proofData, proofSignature)
          .send({ from: web3.eth.defaultAccount, gas });
        this.logTx(tx);
        await sleep(15000);
      },
      Promise.resolve()
    );
  }
}
