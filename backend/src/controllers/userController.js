import { addUserToTenantService, listTenantUsersService, updateUserService, deleteUserService} from '../services/userService.js';

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


export const listTenantUsers = async (req, res, next) => {
  try {
    const data = await listTenantUsersService(
      req.params.tenantId,
      req.query
    );

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};


export const updateUser = async (req, res, next) => {
  try {
    const data = await updateUserService(
      req.user,
      req.params.userId,
      req.body,
      req.ip
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data
    });

  } catch (err) {
    next(err);
  }
};


export const deleteUser = async (req, res, next) => {
  try {
    await deleteUserService(
      req.user,
      req.params.userId,
      req.ip
    );

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (err) {
    next(err);
  }
};

// export const listUsers = async (req, res, next) => {
//   try {
//     const users = await listUsersService(req.user);

//     res.status(200).json({
//       success: true,
//       data: users
//     });
//   } catch (err) {
//     next(err);
//   }
// };
