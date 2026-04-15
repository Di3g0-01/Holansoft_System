export const en = {
  common: {
    dashboard: "Dashboard",
    inventory: "Products",
    sales: "Sales",
    purchases: "Purchases",
    reports: "Reports",
    users: "Users",
    settings: "Settings",
    logout: "Logout",
    search: "Search...",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    actions: "Actions",
    total: "Total",
    quantity: "Quantity",
    wholesale: "Wholesale",
    update: "Update",
    export: "Export",
    saveChanges: "Save Changes",
    loading: "Loading...",
    units: "Units",
    subtotal: "Subtotal",
    cost: "Cost",
    price: "Price",
    stock: "Stock",
    status: {
      active: "Active",
      inactive: "Inactive",
      lowStock: "Low Stock",
      normal: "Normal",
      optimal: "Optimal",
      outOfStock: "Out of Stock"
    },
    finalConsumer: "Final Consumer"
  },
  dashboard: {
    title: "Control Panel",
    subtitle: "Business operation summary",
    stats: {
      sales: "Total Sales",
      inventory: "Current Stock",
      lowStock: "Low Stock",
      purchases: "Monthly Purchases",
      products: "Total Products"
    },
    actions: {
      viewInventory: "VIEW INVENTORY",
      showList: "SHOW LIST",
      viewPurchases: "VIEW PURCHASES",
      viewReports: "VIEW REPORTS"
    },
    activity: {
      title: "Recent Activity",
      sale: "Sale Registered",
      purchase: "Purchase Registered",
      noMovement: "No movements registered"
    },
    systemStatus: {
      title: "HolanSoft Status",
      subtitle: "Cloud Services Active • SSL Secured",
      label: "OPERATING SYSTEM"
    },
    utility: {
      title: "Performance",
      subtitle: "Income vs Expense Balance",
      label: "PROFIT MARGIN"
    },
    stockAlertModal: {
      title: "Low Stock Alert",
      subtitle: "These products need restocking soon.",
      code: "Code",
      available: "AVAILABLE",
      optimal: "All inventory is at optimal levels.",
      understand: "Understood",
      goToPurchases: "Go to Purchases"
    },
    charts: {
      salesWeekly: "Weekly Sales",
      purchasesWeekly: "Weekly Expenses",
      categoryDist: "Category Distribution",
      lowStockAlert: "Low Stock Products",
      inventoryHealth: "Inventory Health",
      stockAlerts: "Stock Alerts",
      utilityMonth: "Monthly Utility (Income - Expenses)",
      optimal: "Optimal",
      periods: {
        day: "Day",
        week: "Week",
        month: "Month"
      },
      ranges: {
        day: "Last 7 Days",
        week: "Last 4 Weeks",
        month: "Last 12 Months"
      }
    }
  },
  inventory: {
    title: "Product Catalog",
    subtitle: "Centralized inventory management",
    newProduct: "New Product",
    filters: "Search Filters",
    quickCreate: "Quick Create",
    table: {
      code: "Code",
      name: "Product",
      category: "Category",
      stock: "Stock",
      status: "Status",
      prices: "Prices"
    },
    form: {
      newTitle: "Add New Product",
      editTitle: "Edit Product",
      subtitle: "Enter item details for inventory",
      editSubtitle: "Enter the new details for the item",
      code: "Product Code",
      name: "Name / Title",
      brand: "Brand / Manufacturer",
      size: "Size / Measurement",
      type: "Type / Series",
      category: "Category",
      priceSchema: "Price Schema",
      unit: "Unitary",
      dozen: "Dozen",
      wholesale: "Wholesale",
      initialStock: "Initial Stock",
      alertQuantity: "Alert Quantity",
      save: "Save Product",
      saveChanges: "Save Changes",
      updating: "Updating...",
      saving: "Saving...",
      units: "Units",
      errorCategory: "Error creating category",
      savingError: "Error saving product",
      placeholderCategory: "Type the new category...",
      selectCategory: "Select category...",
      success: "Successful operation"
    },
    details: {
      title: "Product Details"
    }
  },
  users: {
    title: "System Users",
    subtitle: "Role and access management",
    newUser: "New User",
    editUser: "Edit User",
    table: {
      username: "Username",
      name: "Full Name",
      role: "Role",
      createdAt: "Created At"
    },
    messages: {
      successCreate: "User created successfully",
      successUpdate: "User updated successfully",
      successDelete: "User deleted",
      errorCreate: "Error creating user",
      errorUpdate: "Error updating user",
      errorDelete: "Error deleting user"
    },
    confirm: {
      delete: "Are you sure you want to delete this user?"
    },
    form: {
      fullName: "Full Name",
      username: "Username",
      password: "Password",
      newPassword: "New Password",
      role: "Role",
      optional: "(Optional)",
      standardUser: "Standard User",
      admin: "Administrator"
    }
  },
  sales: {
    title: "Sales Record",
    subtitle: "Sales history and creation",
    newSale: "New Sale",
    searchPlaceholder: "Search by Receipt # or Customer...",
    table: {
      bill: "Receipt #",
      customer: "Customer",
      date: "Date",
      items: "Items",
      edit: "Edit Sale"
    },
    loading: "Loading sales...",
    noResults: "No results found",
    newSaleSubtitle: "Create a sale order easily and intuitively",
    searchBoxPlaceholder: "Scan code or type name...",
    customerLabel: "Customer Name (Optional)",
    customerPlaceholder: "e.g. John Doe",
    emptyCart: "Empty Cart",
    totalToPay: "Total to Pay",
    finishSale: "Finish Sale",
    processing: "Processing...",
    unitPriceShort: "Unit P.",
    inStock: "in stock",
    details: {
      title: "Sale Details",
      products: "Sold Products",
      itemsTitle: "Items in this movement"
    },
    confirmDelete: "Are you sure you want to delete this sale? Stock will be restored automatically.",
    edit: "Edit Sale",
    unitsTotal: "Total units",
    equivalentTo: "Equivalent to",
    lots: "lot(s)"
  },
  purchases: {
    title: "Purchases Record",
    subtitle: "Restocking history",
    newPurchase: "New Purchase",
    searchPlaceholder: "Search by PO Number or Provider...",
    table: {
      bill: "PO Number",
      provider: "Provider",
      date: "Date",
      items: "Items"
    },
    loading: "Loading purchases...",
    noResults: "No results found",
    newPurchaseSubtitle: "Restock inventory easily",
    searchProductTitle: "Search Product to Buy",
    providerLabel: "Provider / Company",
    providerPlaceholder: "Type provider name...",
    unitCost: "Unit Cost (Q)",
    updateSellingPrices: "Update Selling Prices",
    confirmPurchase: "Confirm Purchase Entry",
    quickCreateProduct: "Add New Product",
    enterDetails: "Enter catalog details",
    stockAlert: "Stock Alert",
    priceSchema: "Selling Price Schema",
    unitary: "Unitary",
    currentUnits: "Current units",
    emptyCart: "Empty Cart",
    providerError: "Enter provider name",
    invalidQuantity: "Load at least one product with valid quantity",
    success: "Purchase registered successfully!",
    error: "Error registering the purchase",
    confirmDelete: "Are you sure you want to delete this purchase? Stock will be adjusted automatically.",
    details: {
      title: "Purchase Details"
    },
    totalLabel: "Total for this purchase"
  },
  reports: {
    title: "Advanced Reports",
    subtitle: "Detailed analysis of movements and performance",
    exportPdf: "Export PDF",
    stats: {
      totalIncome: "Total Income",
      movements: "Movements",
      avgPerTrans: "Average / Trans.",
      registries: "registries"
    },
    filters: {
      title: "Quick Filter",
      day: "Day",
      week: "Week",
      range: "Range"
    },
    type: {
      title: "Type",
      sales: "Sales Performed",
      purchases: "Purchases Registered"
    },
    date: {
      from: "From",
      to: "To",
      title: "Date"
    },
    results: {
      title: "List of Movements"
    },
    noData: {
      title: "No records for this period",
      subtitle: "Try selecting a different date range"
    },
    searchInResults: "Search in Results",
    searchPlaceholder: "Product, Customer or Provider...",
    table: {
      products: "Product(s) and Code(s)",
      customer: "Customer",
      provider: "Provider",
      total: "Total Amount",
      multipleProducts: "Various Products"
    },
    details: {
      title: "Document Details",
      product: "Product",
      quantity: "Quantity",
      priceCost: "Price/Cost",
      subtotal: "Subtotal"
    }
  },
  settings: {
    title: "Business Settings",
    subtitle: "Information shown on tickets and reports",
    form: {
      name: "Business Name",
      phone: "Phone",
      address: "Address",
      email: "Email"
    }
  }
};
