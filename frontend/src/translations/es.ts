export const es = {
  common: {
    dashboard: "Dashboard",
    inventory: "Productos",
    sales: "Ventas",
    purchases: "Compras",
    reports: "Reportes",
    users: "Usuarios",
    settings: "Configuración",
    logout: "Cerrar Sesión",
    search: "Buscar...",
    add: "Agregar",
    edit: "Editar",
    delete: "Eliminar",
    save: "Guardar",
    cancel: "Cancelar",
    actions: "Acciones",
    total: "Total",
    quantity: "Cantidad",
    wholesale: "Mayoreo",
    update: "Actualizar",
    export: "Exportar",
    saveChanges: "Guardar Cambios",
    loading: "Cargando...",
    units: "Unidades",
    subtotal: "Subtotal",
    cost: "Costo",
    price: "Precio",
    stock: "Existencia",
    status: {
      active: "Activo",
      inactive: "Inactivo",
      lowStock: "Stock Bajo",
      normal: "Normal",
      optimal: "Óptimo",
      outOfStock: "Agotado"
    }
  },
  dashboard: {
    title: "Panel de Control",
    subtitle: "Resumen operativo del negocio",
    stats: {
      sales: "Ventas Totales",
      inventory: "Stock Actual",
      lowStock: "Stock Bajo",
      purchases: "Compras Mes",
      products: "Total Productos"
    },
    actions: {
      viewInventory: "VER INVENTARIO",
      showList: "MOSTRAR LISTA",
      viewPurchases: "VER COMPRAS",
      viewReports: "VER REPORTES"
    },
    activity: {
      title: "Actividad Reciente",
      sale: "Venta Registrada",
      purchase: "Compra Registrada",
      noMovement: "Sin movimientos registrados"
    },
    systemStatus: {
      title: "Estado HolanSoft",
      subtitle: "Servicios Cloud Activos • SSL Seguro",
      label: "SISTEMA OPERATIVO"
    },
    stockAlertModal: {
      title: "Alerta de Stock Bajo",
      subtitle: "Estos productos necesitan reabastecimiento pronto.",
      code: "Código",
      available: "DISPONIBLE",
      optimal: "Todo el inventario está en niveles óptimos.",
      understand: "Entendido",
      goToPurchases: "Ir a Compras"
    },
    charts: {
      salesWeekly: "Ventas de la Semana",
      purchasesWeekly: "Gastos de la Semana",
      categoryDist: "Distribución por Categoría",
      lowStockAlert: "Productos con Stock Bajo",
      inventoryHealth: "Salud del Inventario",
      stockAlerts: "Alertas de Stock",
      optimal: "Óptimo",
      periods: {
        day: "Día",
        week: "Semana",
        month: "Mes"
      },
      ranges: {
        day: "Últimos 7 Días",
        week: "Últimas 4 Semanas",
        month: "Últimos 12 Meses"
      }
    }
  },
  inventory: {
    title: "Catálogo de Productos",
    subtitle: "Gestión centralizada de inventario",
    newProduct: "Nuevo Producto",
    filters: "Filtros de Búsqueda",
    quickCreate: "Creación Rápida",
    table: {
      code: "Código",
      name: "Producto",
      category: "Categoría",
      stock: "Stock",
      status: "Estado",
      prices: "Precios"
    },
    form: {
      newTitle: "Agregar Nuevo Producto",
      editTitle: "Editar Producto",
      subtitle: "Ingrese los detalles del artículo para el inventario",
      editSubtitle: "Ingrese los nuevos detalles del artículo",
      code: "Código del Producto",
      name: "Nombre / Título",
      brand: "Marca / Fabricante",
      size: "Tamaño / Medida",
      type: "Tipo / Serie",
      category: "Categoría",
      priceSchema: "Esquema de Precios",
      unit: "Unitario",
      dozen: "Docena",
      wholesale: "Por Mayor",
      initialStock: "Existencia Inicial",
      alertQuantity: "Cantidad de Alerta",
      save: "Guardar Producto",
      saveChanges: "Guardar Cambios",
      updating: "Actualizando...",
      saving: "Guardando...",
      units: "Unid.",
      errorCategory: "Error al crear la categoría",
      savingError: "Error al guardar el producto",
      placeholderCategory: "Escriba la nueva categoría...",
      selectCategory: "Seleccionar categoría..."
    }
  },
  users: {
    title: "Usuarios del Sistema",
    subtitle: "Gestión de roles y accesos",
    newUser: "Nuevo Usuario",
    editUser: "Editar Usuario",
    table: {
      username: "Usuario",
      name: "Nombre Completo",
      role: "Rol",
      createdAt: "Fecha de Creación"
    },
    messages: {
      successCreate: "Usuario creado correctamente",
      successUpdate: "Usuario actualizado correctamente",
      successDelete: "Usuario eliminado",
      errorCreate: "Error al crear usuario",
      errorUpdate: "Error al actualizar usuario",
      errorDelete: "Error al eliminar usuario"
    },
    confirm: {
      delete: "¿Está seguro de eliminar este usuario?"
    },
    form: {
      fullName: "Nombre Completo",
      username: "Nombre de Usuario",
      password: "Contraseña",
      newPassword: "Nueva Contraseña",
      role: "Rol",
      optional: "(Opcional)",
      standardUser: "Usuario Estándar",
      admin: "Administrador"
    }
  },
  sales: {
    title: "Registro de Ventas",
    subtitle: "Historial y creación de ventas",
    newSale: "Nueva Venta",
    searchPlaceholder: "Buscar por Recibo # o Cliente...",
    table: {
      bill: "Recibo #",
      customer: "Cliente",
      date: "Fecha",
      items: "Items"
    },
    loading: "Cargando ventas...",
    noResults: "No se encontraron resultados",
    newSaleSubtitle: "Cree una orden de venta de forma fácil e intuitiva",
    searchBoxPlaceholder: "Escanee código o escriba nombre...",
    customerLabel: "Nombre del Cliente (Opcional)",
    customerPlaceholder: "Ej: Juan Pérez",
    emptyCart: "Carrito Vacío",
    totalToPay: "Total a Pagar",
    finishSale: "Finalizar Venta",
    processing: "Procesando...",
    unitPriceShort: "P. Unidad",
    inStock: "en stock"
  },
  purchases: {
    title: "Registro de Compras",
    subtitle: "Historial de reabastecimiento",
    newPurchase: "Nueva Compra",
    searchPlaceholder: "Buscar por PO Number o Proveedor...",
    table: {
      bill: "PO Number",
      provider: "Proveedor",
      date: "Fecha",
      items: "Items"
    },
    loading: "Cargando compras...",
    noResults: "No se encontraron resultados",
    newPurchaseSubtitle: "Abastezca el inventario de forma rápida y sencilla",
    searchProductTitle: "Buscar Producto para Comprar",
    providerLabel: "Proveedor / Empresa",
    providerPlaceholder: "Escriba el nombre del proveedor...",
    unitCost: "Costo Unitario (Q)",
    updateSellingPrices: "Actualizar Precios de Venta",
    confirmPurchase: "Confirmar Ingreso de Compra",
    quickCreateProduct: "Agregar Nuevo Producto",
    enterDetails: "Ingrese los detalles para el catálogo",
    stockAlert: "Alerta de Stock",
    priceSchema: "Esquema de Precios de Venta",
    unitary: "Unitario"
  },
  reports: {
    title: "Reportes Avanzados",
    subtitle: "Análisis detallado de movimientos y rendimiento",
    exportPdf: "Exportar PDF",
    stats: {
      totalIncome: "Ingresos Totales",
      movements: "Movimientos",
      avgPerTrans: "Promedio / Trans.",
      registries: "registros"
    },
    filters: {
      title: "Filtro Rápido",
      day: "Día",
      week: "Semana",
      range: "Rango"
    },
    type: {
      title: "Tipo",
      sales: "Ventas Realizadas",
      purchases: "Compras Registradas"
    },
    date: {
      from: "Desde",
      to: "Hasta"
    },
    results: {
      title: "Listado de Movimientos"
    },
    noData: {
      title: "No hay registros para este periodo",
      subtitle: "Pruebe seleccionando un rango de fechas diferente"
    },
    searchInResults: "Buscar en Resultados",
    searchPlaceholder: "Producto, Cliente o Proveedor...",
    table: {
      products: "Producto(s) y Código(s)",
      customer: "Cliente",
      provider: "Proveedor",
      total: "Monto Total"
    },
    details: {
      title: "Detalles del Documento",
      product: "Producto",
      quantity: "Cantidad",
      priceCost: "Precio/Costo",
      subtotal: "Subtotal"
    }
  },
  settings: {
    title: "Configuración del Negocio",
    subtitle: "Información que aparece en tickets y reportes",
    form: {
      name: "Nombre del Negocio",
      phone: "Teléfono",
      address: "Dirección",
      email: "Correo Electrónico"
    }
  }
};
