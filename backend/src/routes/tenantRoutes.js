import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorizeTenantView } from '../middleware/authorizeTenant.js';
import { getTenantDetails } from '../controllers/tenantController.js';
import { updateTenant } from '../controllers/tenantController.js';
import { authorizeTenantUpdate } from '../middleware/authorizeTenant.js';
import { authorize } from '../middleware/authorize.js';
import { listTenants } from '../controllers/tenantController.js';
import { addUserToTenant } from '../controllers/userController.js';
import { authorizeTenantAdmin } from '../middleware/authorizeTenant.js';
import { listTenantUsers } from '../controllers/userController.js';

const router = express.Router();

router.get('/:tenantId', authenticate, authorizeTenantView, getTenantDetails);
router.put('/:tenantId', authenticate, authorizeTenantUpdate, updateTenant);
router.get('/', authenticate, authorize('super_admin'), listTenants);

router.post('/:tenantId/users',
  authenticate,
  authorizeTenantAdmin,
  addUserToTenant
);

router.get('/:tenantId/users',
  authenticate,
  authorizeTenantView,
  listTenantUsers
);

export default router;
