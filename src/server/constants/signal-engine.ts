export interface SignalEngineWeights {
  trendConfirmation: number;
  marketStructure: number;
  supportResistance: number;
  momentum: number;
  priceAction: number;
  riskReward: number;
}

export interface SignalEngineLabels {
  strongSetup: number;
  validSetup: number;
  weakSetup: number;
}

export interface SignalEngineSettings {
  minimumQualityScore: number;
  minimumRiskReward: number;
  maximumAtrPercentile: number;
  requireHigherTimeframeAlignment: boolean;
  allowedSessions: string[];
  weights: SignalEngineWeights;
  labels: SignalEngineLabels;
}

export const defaultSignalEngineSettings: SignalEngineSettings = {
  minimumQualityScore: 70,
  minimumRiskReward: 1.5,
  maximumAtrPercentile: 85,
  requireHigherTimeframeAlignment: true,
  allowedSessions: ["LONDON", "NEW_YORK", "LONDON_NY_OVERLAP"],
  weights: {
    trendConfirmation: 20,
    marketStructure: 20,
    supportResistance: 15,
    momentum: 15,
    priceAction: 15,
    riskReward: 15,
  },
  labels: {
    strongSetup: 85,
    validSetup: 70,
    weakSetup: 55,
  },
};