export const tenantMiddleware = (req, res, next) => {
  const subdomain = req.headers['x-tenant-subdomain'];

  if (!subdomain) {
    return res.status(400).json({
      success: false,
      message: "Tenant subdomain missing"
    });
  }

  req.subdomain = subdomain;
  next();
};
