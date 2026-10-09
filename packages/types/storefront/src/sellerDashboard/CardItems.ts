import { ReactNode } from "react"

export interface IStatCardListProps {
  dtitle: string;
  description: string;
  items: IStatCardItem[];
  actionIcon?: React.ReactNode;
}

export interface IStatCardItem {
  id: number | string
  ctitle: string
  value: number | string
  status?: string
  badge?: string
  icon?: ReactNode
  color?: string // tailwind color class
  prefix?: string
  textColor?: string
  period?: string
}
export interface InfoCardProps<T> {
  title: string
  items: T[]
  variant: "require" | "recent"
}



export interface RequireAttentionItem {
  name: string
  status: string
  description: string
  bgColor: string
}

export interface RecentActivityItem {
  name: string
  info: string
  time: string
}

export interface ITopProductsProps {
  pTitle: string;
  pDescription: string;
  items: ITopProduct[];
  actionIcon?: React.ReactNode;
}


export interface ITopProduct {
  id: number;
  cTitle: string;
  value: string;
  prefix?: string;
  icon: ReactNode;
  color: string;
  textColor: string;
  period: string;
};



