import { create } from "zustand";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,
  error: null,

  setProducts: (products) => set({ products }),

  // Accepts FormData (with file) instead of plain JSON
  createProduct: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        // Do NOT set Content-Type — browser sets multipart/form-data with boundary automatically
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to create product");

      const data = await res.json();
      set((state) => ({ products: [...state.products, data.data] }));
      return { success: true, message: "Product created successfully" };
    } catch (error) {
      console.error(error);
      set({ error: error.message || "An error occurred." });
      return { success: false, message: error.message || "An error occurred." };
    } finally {
      set({ loading: false });
    }
  },

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      set({ products: data.data });
    } catch (error) {
      console.error(error);
      set({ error: error.message || "An error occurred." });
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (pid) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/products/${pid}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete product");

      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };

      set((state) => ({
        products: state.products.filter((product) => product._id !== pid),
      }));

      return { success: true, message: data.message };
    } catch (error) {
      console.error(error);
      set({ error: error.message || "An error occurred." });
      return { success: false, message: error.message || "An error occurred." };
    } finally {
      set({ loading: false });
    }
  },

  // Accepts FormData (with optional new image file)
  updateProduct: async (pid, formData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/products/${pid}`, {
        method: "PUT",
        // No Content-Type header — let browser handle multipart boundary
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to update product");

      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };

      set((state) => ({
        products: state.products.map((product) =>
          product._id === pid ? { ...product, ...data.data } : product
        ),
      }));

      return { success: true, message: "Product updated successfully" };
    } catch (error) {
      console.error(error);
      set({ error: error.message || "An error occurred." });
      return { success: false, message: error.message || "An error occurred." };
    } finally {
      set({ loading: false });
    }
  },
}));
