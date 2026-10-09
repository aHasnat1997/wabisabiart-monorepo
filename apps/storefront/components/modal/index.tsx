"use client";
import Modal from "./Modal";
import SignInPage from "./component/sign-in";
import SellerSignUp from "./component/seller-sign-up";
import UserSignUp from "./component/user-sign-up";
import ResetPassword from "./component/reset-password";
import AddFavCollection from "./component/addFavCollection";
import ViewFavCollection from "./component/viewFavCollection";
import AddAddress from "./component/add-address";
import ActionModal from "@/app/seller-dashboard/orders/components/ActionModal";
import ChatModal from "@/app/seller-dashboard/orders/components/ChatModal";
import OrderDetailsModal from "@/app/seller-dashboard/orders/components/OrderDetailsModal";
import AddProduct from "@/app/seller-dashboard/products/components/AddProduct";
import ProductDetailsModal from "@/app/seller-dashboard/products/components/ProductDetailsModal";
import DeleteProductModal from "@/app/seller-dashboard/products/components/DeleteProductModal";
import CouponsDialog from "@/app/seller-dashboard/marketing/coupons/components/CouponsDialog";
import PaymentSuccess from "./component/payment-success";
import PaymentFailed from "./component/payment-failed";
import ShippingRulesDialog from "@/app/seller-dashboard/marketing/free-shipping-rules/components/ShippingRulesDialog";
import CreatePostDialog from "@/app/seller-dashboard/journals/components/CreatePostDialog";
import { PreviewDialog } from "@/app/seller-dashboard/marketing/components/PreviewDialog";
import PromotionDialog from "@/app/seller-dashboard/marketing/components/PromotionDialog";
import EditProduct from "@/app/seller-dashboard/products/components/EditProduct";
import NotificationPanel from "@/app/seller-dashboard/components/NotificationPanel";
import ReportProduct from "./component/ReportProduct";
import JournalPreviewWrapper from "@/app/seller-dashboard/journals/components/JournalPreviewWrapper";
import Commentsmodalwrapper from "@/app/seller-dashboard/journals/components/Commentsmodalwrapper";
import JournalEditWrapper from "@/app/seller-dashboard/journals/components/JournalEditWrapper";
import ShippingEditWrapper from "@/app/seller-dashboard/marketing/free-shipping-rules/components/ShippingEditWrapper";
import SellerSetup from "./component/seller-setup";
import OnboardingSuccess from "./component/onboarding-success";
import OnboardingRefresh from "./component/onboarding-refreash";
import UpdateFavCollection from "./component/updateFavCollection";
import AddReview from "./component/AddReview";
import CheckoutModal from "@/app/profile/cart/component/CheckoutModal";

export default function Modals() {
  return (
    <>
      <Modal modalId="signin-modal" openId="signin">
        <SignInPage />
      </Modal>

      <Modal modalId="seller-signup-modal" openId="seller-signup">
        <SellerSignUp />
      </Modal>

      <Modal modalId="seller-setup-modal" openId="seller-setup">
        <SellerSetup />
      </Modal>

      <Modal modalId="user-signup-modal" openId="user-signup">
        <UserSignUp />
      </Modal>

      <Modal modalId="reset-password-modal" openId="reset-password">
        <ResetPassword />
      </Modal>

      <Modal modalId="add-fav-collection-modal" openId="add-fav-collection">
        <AddFavCollection />
      </Modal>
      <Modal
        modalId="update-fav-collection-modal"
        openId="update-fav-collection"
      >
        <UpdateFavCollection />
      </Modal>

      <Modal modalId="view-fav-collection-modal" openId="view-fav-collection">
        <ViewFavCollection />
      </Modal>

      <Modal modalId="add-address-modal" openId="add-address">
        <AddAddress />
      </Modal>

      <Modal modalId="payment-success-modal" openId="payment-success">
        <PaymentSuccess />
      </Modal>

      <Modal modalId="payment-failed-modal" openId="payment-failed">
        <PaymentFailed />
      </Modal>

      <Modal modalId="onboarding-success-modal" openId="onboarding-success">
        <OnboardingSuccess />
      </Modal>

      <Modal modalId="onboarding-refresh-modal" openId="onboarding-refresh">
        <OnboardingRefresh />
      </Modal>

      <Modal modalId="report-product-modal" openId="report-product">
        <ReportProduct />
      </Modal>

      <Modal modalId="add-product-modal" openId="add-product">
        <AddProduct />
      </Modal>

      <Modal modalId="add-review-modal" openId="add-review">
        <AddReview />
      </Modal>

      <Modal
        modalId="product-details-modal"
        openId="product-details"
        cleanupKeys={["id"]}
      >
        <ProductDetailsModal />
      </Modal>

      <Modal
        modalId="product-edit-modal"
        openId="product-edit"
        cleanupKeys={["id"]}
      >
        <EditProduct />
      </Modal>

      <Modal modalId="product-delate-modal" openId="product-delate">
        <DeleteProductModal />
      </Modal>

      {/* Notification modal */}

      <Modal
        modalId="sellerBoard-notification-modal"
        openId="sellerBoard-notification"
      >
        <NotificationPanel />
      </Modal>

      {/*  Action Modal (GLOBAL) */}

      <Modal
        modalId="action-modal"
        openId="action"
        cleanupKeys={["id", "orderNumber", "status"]}
      >
        <ActionModal />
      </Modal>

      {/* chart modal */}

      <Modal modalId="chart-modal" openId="chart">
        <ChatModal></ChatModal>
      </Modal>

      {/* order details modal */}

      <Modal modalId="details-modal" openId="details" cleanupKeys={["id"]}>
        <OrderDetailsModal />
      </Modal>
      {/* marketing promotion created modal */}

      <Modal modalId="preview-modal" openId="preview">
        <PreviewDialog />
      </Modal>

      <Modal modalId="checkout-modal" openId="checkout">
        <CheckoutModal />
      </Modal>

      {/* Marketing preview modal */}
      <Modal modalId="create-promotion-modal" openId="create-promotion">
        <PromotionDialog mode="create" />
      </Modal>

      <Modal modalId="promotion-edit-modal" openId="promotion-edit">
        <PromotionDialog mode="edit" />
      </Modal>

      {/* ShippingRules Modal create */}
      <Modal modalId="shipping-rules-modal" openId="shipping-rules">
        <ShippingRulesDialog mode="create" />
      </Modal>
      {/* Shipping Modal edit */}
      <Modal
        modalId="shipping-rules-modal"
        openId="shipping-rules-edit"
        cleanupKeys={["id"]}
      >
        <ShippingEditWrapper />
      </Modal>

      {/* coupons modal */}
      <Modal modalId="coupon-modal" openId="create-coupon">
        <CouponsDialog mode="create" />
      </Modal>

      {/* Coupons Edit modal */}

      <Modal modalId="coupon-modal" openId="edit-coupon">
        <CouponsDialog mode="edit" />
      </Modal>
      {/* journal create modal */}

      <Modal modalId="journal-post-create-modal" openId="journal-post">
        <CreatePostDialog mode="create" />
      </Modal>
      <Modal
        modalId="journal-preview-modal"
        openId="journal-preview"
        cleanupKeys={["id"]}
      >
        <JournalPreviewWrapper />
      </Modal>

      {/* journal edit modal */}

      <Modal
        modalId="journal-post-edit-modal"
        openId="journal-edit"
        cleanupKeys={["id"]}
      >
        <JournalEditWrapper />
      </Modal>

      <Modal
        modalId="journal-post-comments-modal"
        openId="journal-comment"
        cleanupKeys={["id"]}
      >
        <Commentsmodalwrapper />
      </Modal>
    </>
  );
}
