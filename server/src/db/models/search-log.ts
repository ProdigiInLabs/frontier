import { Schema, model } from 'mongoose';

export interface SearchLogDoc {
  query: string;
  category?: string;
  resultCount: number;
  tookMs: number;
  createdAt: Date;
}

const searchLogSchema = new Schema<SearchLogDoc>(
  {
    query: { type: String, required: true, maxlength: 500 },
    category: { type: String },
    resultCount: { type: Number, required: true },
    tookMs: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Logs are operational telemetry, not permanent records — auto-expire after 90 days.
searchLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export const SearchLog = model<SearchLogDoc>('SearchLog', searchLogSchema);
