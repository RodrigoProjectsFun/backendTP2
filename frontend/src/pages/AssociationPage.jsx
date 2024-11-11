// src/pages/AssociationPage.js
import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_PRODUCTS } from "../graphql/queries/product.query";
import { CREATE_OR_UPDATE_ASSOCIATION } from "../graphql/mutations/association.mutation";
import toast from "react-hot-toast";
import TagInputForm from "../components/TagInputForm";
import SelectFieldProduct from "../components/SelectFieldProduct";

const AssociationPage = () => {
  const [associationData, setAssociationData] = useState({
    uidResult: "",
    productId: "",
  });

  const { loading: productsLoading, error: productsError, data } = useQuery(GET_PRODUCTS);
  const [createAssociation, { loading }] = useMutation(CREATE_OR_UPDATE_ASSOCIATION);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAssociationData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUidResult = (newUidResult) => {
    setAssociationData((prevData) => ({
      ...prevData,
      uidResult: newUidResult,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { uidResult, productId } = associationData;

    if (!uidResult || !productId) {
      return toast.error("Please scan a tag and select a product");
    }

    try {
      await createAssociation({
        variables: {
          productId,
          UIDresult: uidResult, // Ensure this is a string
        },
      });
      toast.success("Association created successfully!");
      // Reset form if needed
      setAssociationData({
        uidResult: "",
        productId: "",
      });
    } catch (error) {
      console.error("Error creating association:", error);
      if (error.graphQLErrors.length > 0) {
        toast.error(error.graphQLErrors[0].message);
      } else {
        toast.error("Failed to create association.");
      }
    }
  };

  if (productsLoading) return <p>Loading products...</p>;
  if (productsError) return <p>Error loading products.</p>;

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex rounded-lg overflow-hidden z-50 bg-gray-300">
        <div className="w-full bg-gray-100 min-w-80 sm:min-w-96 flex items-center justify-center">
          <div className="max-w-md w-full p-6">
            <h1 className="text-3xl font-semibold mb-6 text-black text-center">Create Association</h1>
            <h1 className="text-sm font-semibold mb-6 text-gray-500 text-center">
              Scan a tag and select a product to create an association
            </h1>
            <TagInputForm onUidResult={handleUidResult} uidResult={associationData.uidResult} />
            <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
              <SelectFieldProduct
                label="Select Product"
                id="productId"
                name="productId"
                value={associationData.productId}
                onChange={handleChange}
                options={[
                  { value: "", label: "-- Select a Product --" },
                  ...data.products.map((product) => ({
                    value: product.id,
                    label: product.name,
                  })),
                ]}
              />
              <button
                type="submit"
                className="w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:bg-black focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Association"}
              </button>
            </form>
            {associationData.uidResult && (
              <p className="mt-4 text-center text-green-600">{associationData.uidResult}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssociationPage;
