import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalSales: number;
  pendingOrders: number;
  lowStockProducts: number;
  loading: boolean;
  error: string | null;
}

export function useAdminStats(): AdminStats {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalSales: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        // Obtener número de usuarios
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (usersError) throw new Error(`Error obteniendo usuarios: ${usersError.message}`);

        // Obtener número de productos
        const { count: productsCount, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        if (productsError) throw new Error(`Error obteniendo productos: ${productsError.message}`);

        // Obtener número de pedidos
        const { count: ordersCount, error: ordersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });

        if (ordersError) throw new Error(`Error obteniendo pedidos: ${ordersError.message}`);

        // Obtener total de ventas
        const { data: salesData, error: salesError } = await supabase
          .from('orders')
          .select('total_amount')
          .not('status', 'eq', 'cancelled');

        if (salesError) throw new Error(`Error obteniendo ventas: ${salesError.message}`);

        const totalSales = salesData?.reduce((sum: number, order: { total_amount: number }) => {
          return sum + (order.total_amount || 0);
        }, 0) || 0;

        // Obtener pedidos pendientes
        const { count: pendingOrdersCount, error: pendingOrdersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (pendingOrdersError) throw new Error(`Error obteniendo pedidos pendientes: ${pendingOrdersError.message}`);

        // Obtener productos con stock bajo (menos de 5 unidades)
        const { count: lowStockCount, error: lowStockError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .lt('stock', 5);

        if (lowStockError) throw new Error(`Error obteniendo productos con stock bajo: ${lowStockError.message}`);

        setStats({
          totalUsers: usersCount || 0,
          totalProducts: productsCount || 0,
          totalOrders: ordersCount || 0,
          totalSales: Number(totalSales),
          pendingOrders: pendingOrdersCount || 0,
          lowStockProducts: lowStockCount || 0,
          loading: false,
          error: null,
        });

      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        }));
      }
    };

    fetchStats();
  }, []);

  return stats;
}
