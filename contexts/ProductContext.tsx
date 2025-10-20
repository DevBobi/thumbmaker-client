import React, { createContext, useContext, useState, ReactNode } from "react";

export type Product = {
  id: string;
  name: string;
  overview: string;
  features: string;
  uvp: string;
  targetAudience: string;
  logo?: string | null;
  image?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type ProductContextType = {
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Sample initial products
const initialProducts: Product[] = [
  {
    id: "1",
    name: "EcoBoost Sneakers",
    overview: "Sustainable athletic footwear made from recycled materials.",
    features:
      "- Made from 85% recycled materials\n- Cloud comfort insoles\n- Durable outsole with superior grip\n- Available in 6 colors",
    uvp: "High-performance athletic footwear with minimal environmental impact.",
    targetAudience:
      "Environmentally conscious athletes and active individuals aged 18-35.",
    logo: "/ads/ad-1.jpg",
  },
  {
    id: "2",
    name: "LuminaGlow Skincare",
    overview:
      "Premium skincare line featuring natural ingredients and advanced formulations.",
    features:
      "- Paraben and sulfate free\n- Clinically tested\n- Vegan and cruelty-free\n- Anti-aging properties",
    uvp: "Science-backed skincare that delivers visible results without harmful chemicals.",
    targetAudience:
      "Beauty enthusiasts aged 25-45 concerned about skin health and aging.",
    logo: "/ads/ad-2.jpg",
  },
  {
    id: "3",
    name: "VitaBoost Supplements",
    overview:
      "Natural wellness supplements to enhance your daily health routine.",
    features:
      "- Organic ingredients\n- No artificial additives\n- Scientifically formulated\n- Easy-to-digest capsules",
    uvp: "Targeted nutritional support for optimal health and wellness.",
    targetAudience:
      "Health-conscious adults aged 30-60 seeking to improve overall wellbeing.",
    logo: "/ads/ad-3.jpg",
  },
];

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct = {
      ...product,
      id: Math.random().toString(36).substr(2, 9),
    };
    setProducts([...products, newProduct]);
    return newProduct;
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(
      products.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  const getProductById = (id: string) => {
    return products.find((product) => product.id === id);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};
