import { ServerRespond } from './DataStreamer';

export interface Row {
  /** Price (average) for stock ABC */
  price_abc: number,
  /** Price (average) for stock DEF */
  price_def: number,
  /** Ratio between "price_abc" and "price_def" */
  ratio: number,
  /** Ratio upper bound*/
  upper_bound: number,
  /** Ratio lower bound */
  lower_bound: number,
  /** Keep track of data point that crosses either the upper or lower bounds
   * if the data point does not crosses, nothing is registered and represented by "undefined"
   */
  trigger_alert: number | undefined, 
  /** Maximum timestamp between stock ABC and stock DEF */
  timestamp: Date,
}


export class DataManipulator {
  static generateRow(serverResponds: ServerRespond[]): Row {
    const priceABC: number = (serverResponds[0].top_ask.price + serverResponds[0].top_bid.price ) / 2.0;
    const priceDEF: number = (serverResponds[1].top_ask.price + serverResponds[1].top_bid.price ) / 2.0;
    const ratio: number = priceABC / priceDEF;
    const [upperBound, lowerBound]: [number, number] = [1 + 0.05, 1 - 0.05];
    const triggerAlert: number | undefined = (ratio < lowerBound || ratio > upperBound) ?  
      ratio : undefined;
    const timeStamp: Date = serverResponds[0].timestamp > serverResponds[1].timestamp ?
      serverResponds[0].timestamp : serverResponds[1].timestamp;
    
    return {
      price_abc: priceABC,
      price_def: priceDEF,
      ratio: ratio,
      upper_bound: upperBound,
      lower_bound: lowerBound,
      trigger_alert: triggerAlert,
      timestamp: timeStamp,
    }
  }
}
