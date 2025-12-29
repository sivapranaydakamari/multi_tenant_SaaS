import { registerTenantService, loginUserService, getCurrentUserService, logoutUserService } from '../services/authService.js';

export const loginUser = async (req, res, next) => {
  try {
    const data = await loginUserService(req.body);

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

export const registerTenant = async (req, res, next) => {
  try {
    const data = await registerTenantService(req.body);

    return res.status(201).json({
      success: true,
      message: "Tenant registered successfully",
      data
    });
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const data = await getCurrentUserService(req.user);

    return res.status(200).json({
      success: true,
      data
    });

  } catch (err) {
    next(err);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    await logoutUserService(req.user, req.ip);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (err) {
    next(err);
  }
};
