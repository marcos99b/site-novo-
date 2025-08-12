// Sistema de Carrinho de Compras
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

class CartManager {
  private storageKey = 'techstore_cart';

  // Obter carrinho do localStorage
  getCart(): Cart {
    if (typeof window === 'undefined') {
      return { items: [], total: 0, itemCount: 0 };
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const cart = JSON.parse(stored);
        return {
          ...cart,
          total: this.calculateTotal(cart.items),
          itemCount: this.calculateItemCount(cart.items)
        };
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    }

    return { items: [], total: 0, itemCount: 0 };
  }

  // Adicionar item ao carrinho
  addItem(product: {
    id: number;
    name: string;
    price: number;
    images: Array<{ src: string; alt: string }>;
    slug: string;
  }, quantity: number = 1): Cart {
    const cart = this.getCart();
    const existingItem = cart.items.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.images[0]?.src || '/placeholder.svg',
        slug: product.slug
      });
    }

    const updatedCart = {
      ...cart,
      total: this.calculateTotal(cart.items),
      itemCount: this.calculateItemCount(cart.items)
    };

    this.saveCart(updatedCart);
    return updatedCart;
  }

  // Remover item do carrinho
  removeItem(productId: number): Cart {
    const cart = this.getCart();
    cart.items = cart.items.filter(item => item.id !== productId);

    const updatedCart = {
      ...cart,
      total: this.calculateTotal(cart.items),
      itemCount: this.calculateItemCount(cart.items)
    };

    this.saveCart(updatedCart);
    return updatedCart;
  }

  // Atualizar quantidade de um item
  updateQuantity(productId: number, quantity: number): Cart {
    const cart = this.getCart();
    const item = cart.items.find(item => item.id === productId);

    if (item) {
      if (quantity <= 0) {
        return this.removeItem(productId);
      }
      item.quantity = quantity;
    }

    const updatedCart = {
      ...cart,
      total: this.calculateTotal(cart.items),
      itemCount: this.calculateItemCount(cart.items)
    };

    this.saveCart(updatedCart);
    return updatedCart;
  }

  // Limpar carrinho
  clearCart(): Cart {
    const emptyCart = { items: [], total: 0, itemCount: 0 };
    this.saveCart(emptyCart);
    return emptyCart;
  }

  // Calcular total
  private calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Calcular quantidade total de itens
  private calculateItemCount(items: CartItem[]): number {
    return items.reduce((count, item) => count + item.quantity, 0);
  }

  // Salvar carrinho no localStorage
  private saveCart(cart: Cart): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(cart));
    } catch (error) {
      console.error('Erro ao salvar carrinho:', error);
    }
  }
}

export const cartManager = new CartManager();
