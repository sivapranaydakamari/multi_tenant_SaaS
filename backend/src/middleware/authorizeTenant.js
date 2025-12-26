export const authorizeTenantView = (req, res, next) => {
  const { role, tenantId } = req.user;
  const requestedTenantId = req.params.tenantId;

  // super admin can view any tenant
  if (role === 'super_admin') {
    return next();
  }

  // tenant user must belong to the same tenant
  if (tenantId !== requestedTenantId) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: unauthorized tenant access"
    });
  }

  next();
};

export const authorizeTenantUpdate = (req, res, next) => {
  const { role, tenantId } = req.user;
  const target = req.params.tenantId;

  // super_admin → full access
  if (role === 'super_admin') return next();

  // tenant admin can ONLY update their own tenant
  if (role === 'tenant_admin' && tenantId === target) return next();

  return res.status(403).json({
    success: false,
    message: "Forbidden: insufficient permissions to update tenant"
  });
};

export const authorizeTenantAdmin = (req, res, next) => {
  const { role, tenantId } = req.user;
  const target = req.params.tenantId;

  if (role === 'tenant_admin' && tenantId === target) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Only tenant admins can manage users"
  });
};
