export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  featured: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  price?: string;
}
