export interface SettingDetail {
  value: number;
  label: string;
  description: string;
  unit: string;
  lastUpdatedBy?: string | null;
  updatedAt?: string;
}

export interface PlatformSettingsSummary {
  platformFeePercent: SettingDetail;
  sellerPayoutHoldDays: SettingDetail;
  minimumPayoutAmount: SettingDetail;
}

export interface UpdatePlatformFeeDto {
  feePercent: number;
}

export interface UpdateHoldDaysDto {
  holdDays: number;
}

export interface UpdateMinimumPayoutDto {
  minimumAmount: number;
}
