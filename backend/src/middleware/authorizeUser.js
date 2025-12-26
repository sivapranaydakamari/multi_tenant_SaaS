export const authorizeUserUpdate = (req, res, next) => {
  const { userId, role, tenantId } = req.user;
  const targetUserId = req.params.userId;

  // tenant_admin cannot update themselves
  if (role === "tenant_admin" && userId === targetUserId) {
    return res.status(403).json({
      success: false,
      message: "Tenant admin cannot update themselves"
    });
  }

  // self update allowed (fullName only)
  if (userId === targetUserId) {
    return next();
  }

  // tenant admin can update users in same tenant
  if (role === 'tenant_admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Not authorized to update this user"
  });
};

export const authorizeUserDelete = (req, res, next) => {
  const { role, userId, tenantId } = req.user;
  const targetUserId = req.params.userId;

  // must be tenant admin
  if (role !== "tenant_admin") {
    return res.status(403).json({
      success: false,
      message: "Only tenant admins can delete users"
    });
  }

  // cannot delete themselves
  if (userId === targetUserId) {
    return res.status(403).json({
      success: false,
      message: "Tenant admin cannot delete themselves"
    });
  }

  return next();
};
