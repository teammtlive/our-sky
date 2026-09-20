export type StarStatus = "active" | "hidden";

export interface Star {
  id: string;
  name: string;
  wish: string;
  ownerUid: string;
  createdAt: unknown;
  x: number;
  y: number;
  shineCount: number;
  status: StarStatus;
}
