import React from 'react';
import { MenuItem } from '../../../types';
import { ProductCard } from '../ProductCard';

interface MenuItemCardProps {
  item: MenuItem;
  isLiked: boolean;
  onToggleLike: (e: React.MouseEvent, id: string) => void;
  onQuickAdd: (e: React.MouseEvent, item: MenuItem) => void;
  onOpenProduct: (id: string) => void;
  restaurantSlug: string;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  isLiked,
  onToggleLike,
  onQuickAdd,
  onOpenProduct,
  restaurantSlug,
}) => {
  return (
    <ProductCard
      item={item}
      restaurant={{ id: item.restaurantId, slug: restaurantSlug, name: '' } as any}
      isLiked={isLiked}
      onToggleLike={onToggleLike}
      onQuickAdd={onQuickAdd}
      onOpenProduct={onOpenProduct}
    />
  );
};
