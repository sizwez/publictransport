
export enum TransportType {
  BUS = 'BUS',
  TAXI = 'TAXI', // Minibus Taxi
  TRAIN = 'TRAIN'
}

export interface RouteOption {
  id: string;
  type: TransportType;
  provider: string;
  departureTime: string;
  duration: string;
  price: number;
  stops: string[];
  reliability: number;
  isSponsored?: boolean;
}

export interface Ticket {
  id: string;
  routeId: string;
  provider: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  type: TransportType;
  qrCode: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Reward {
  id: string;
  partner: string;
  deal: string;
  expiry: string;
  icon: string;
}
