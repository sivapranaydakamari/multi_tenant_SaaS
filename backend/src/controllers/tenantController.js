import { getTenantDetailsService } from '../services/tenantService.js';

export const getTenantDetails = async (req, res, next) => {
  try {
    const data = await getTenantDetailsService(req.params.tenantId);

    return res.status(200).json({
      success: true,
      data
    });

  } catch (err) {
    next(err);
  }
};


import { updateTenantService } from '../services/tenantService.js';

export const updateTenant = async (req, res, next) => {
  try {
    const data = await updateTenantService(req.user, req.params.tenantId, req.body, req.ip);

    return res.status(200).json({
      success: true,
      message: "Tenant updated successfully",
      data
    });
  } catch (err) {
    next(err);
  }
};


import { listTenantsService } from '../services/tenantService.js';

export const listTenants = async (req, res, next) => {
  try {
    const data = await listTenantsService(req.query);

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

import { addUserToTenantService } from '../services/userService.js';

export const addUserToTenant = async (req, res, next) => {
  try {
    const data = await addUserToTenantService(
      req.user,
      req.params.tenantId,
      req.body,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data
    });

  } catch (err) {
    next(err);
  }
};
