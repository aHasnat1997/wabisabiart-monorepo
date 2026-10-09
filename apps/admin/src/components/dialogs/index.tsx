export { DialogManager } from './DialogManager';
export { AddSubcategoryDialog } from './contents/AddSubcategoryDialog';

import { AddSubcategoryDialog } from './contents/AddSubcategoryDialog';
import ApproveOrRejectDialog from './contents/ApproveOrRejectDialog';
import CreateCategoryDialog from './contents/CreateCategoryDialog';
import { DeleteConfirmForCategory } from './contents/DeleteConfirmForCategory';
import { DeleteConfirmForSubCategory } from './contents/DeleteConfirmForSubCategory';
import ProductVariantDetailDialog from './contents/ProductVariantDetailDialog';
import OrderCancelApprovalDialog from './contents/OrderCancelApprovalDialog';
import OrderCancelRejectionDialog from './contents/OrderCancelRejectionDialog';
import OrderDisputeResolutionDialog from './contents/OrderDisputeResolutionDialog';

export const dialogRegistry = {
  'create-category': CreateCategoryDialog,
  'delete-confirm-category': DeleteConfirmForCategory,
  'add-subcategory': AddSubcategoryDialog,
  'delete-confirm-subcategory': DeleteConfirmForSubCategory,
  'view-product-variant-detail': ProductVariantDetailDialog,
  'approve-or-reject-dialog': ApproveOrRejectDialog,
  'order-cancel-approval': OrderCancelApprovalDialog,
  'order-cancel-rejection': OrderCancelRejectionDialog,
  'order-dispute-resolution': OrderDisputeResolutionDialog,
};
