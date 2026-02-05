export enum AnalysisStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  GENERATING_VIDEO = 'GENERATING_VIDEO',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface AnalysisResultData {
  plantName: string;
  isHealthy: boolean;
  diseaseName: string;
  diagnosis: string;
  treatment: string[];
  preventativeMeasures: string[];
}

export interface ImagePreview {
  url: string;
  file: File;
}

export interface ReviewData {
  id: number;
  customerName: string;
  reviewText: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  summary: string;
  keywords: string[];
  date: string;
}

export interface KeywordStat {
  keyword: string;
  count: number;
}
