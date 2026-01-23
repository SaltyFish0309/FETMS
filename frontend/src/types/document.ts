export interface AdHocDocument {
  _id: string;
  name: string;
  filePath: string;
  boxId?: string;
  uploadDate?: string;
}

export interface DocumentBox {
  _id: string;
  name: string;
  order: number;
}
