export type CategoryStatus = "ACTIVE" | "INACTIVE";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  sortOrder: number;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
  parent?: Category | null;
  children?: Category[];
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder?: number;
  status?: CategoryStatus;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder?: number;
  status?: CategoryStatus;
}
