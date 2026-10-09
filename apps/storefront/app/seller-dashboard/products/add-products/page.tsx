import AddProduct from "../components/AddProduct";

const AddProductsPage = () => {
  return (
    <div className="min-h-screen w-full bg-muted/40 flex items-center justify-center px-3 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-6xl bg-card rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
        <AddProduct />
      </div>
    </div>
  );
};

export default AddProductsPage;
