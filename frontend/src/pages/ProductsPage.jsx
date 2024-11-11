import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PRODUCTS } from '../graphql/queries/product.query';
import { GET_CATEGORIES } from '../graphql/queries/category.query';
import {
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
} from '../graphql/mutations/product.mutation';
import toast from 'react-hot-toast';

const ProductsPage = () => {
  // Fetch products
  const { loading, error, data, refetch } = useQuery(GET_PRODUCTS);
  
  // Fetch categories
  const { loading: categoriesLoading, error: categoriesError, data: categoriesData } = useQuery(GET_CATEGORIES);

  // Mutations
  const [createProduct] = useMutation(CREATE_PRODUCT, {
    onCompleted: () => {
      toast.success('Product created successfully!');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create product.');
    },
  });

  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    onCompleted: () => {
      toast.success('Product updated successfully!');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update product.');
    },
  });

  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    onCompleted: () => {
      toast.success('Product deleted successfully!');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete product.');
    },
  });

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    id: '',
    name: '',
    price: '',
    description: '',
    categoryId: '',
  });

  // Handlers
  const handleAdd = () => {
    setCurrentProduct({
      id: '',
      name: '',
      price: '',
      description: '',
      categoryId: '',
    });
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setCurrentProduct({
      id: product.id,
      name: product.name,
      price: product.price || '',
      description: product.description || '',
      categoryId: product.category ? product.category.id : '',
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct({ variables: { id } });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const { id, name, price, description, categoryId } = currentProduct;

    if (!name) {
      return toast.error('Name is required');
    }

    if (id) {
      updateProduct({
        variables: { id, name, price: parseFloat(price), description, categoryId },
      });
    } else {
      createProduct({
        variables: { name, price: parseFloat(price), description, categoryId },
      });
    }
    setShowForm(false);
    setCurrentProduct({
      id: '',
      name: '',
      price: '',
      description: '',
      categoryId: '',
    });
  };

  if (loading || categoriesLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading products.</p>;
  if (categoriesError) return <p>Error loading categories.</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <button
        onClick={handleAdd}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Product
      </button>
      
      {showForm && (
        <div className="mb-6 p-4 border rounded bg-gray-100">
          <h2 className="text-xl font-semibold mb-2">{currentProduct.id ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Name<span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                value={currentProduct.name}
                onChange={handleFormChange}
                required
                className="mt-1 p-2 w-full border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Price</label>
              <input
                type="number"
                name="price"
                value={currentProduct.price}
                onChange={handleFormChange}
                step="0.01"
                className="mt-1 p-2 w-full border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={currentProduct.description}
                onChange={handleFormChange}
                className="mt-1 p-2 w-full border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Category</label>
              <select
                name="categoryId"
                value={currentProduct.categoryId}
                onChange={handleFormChange}
                className="mt-1 p-2 w-full border rounded"
              >
                <option value="">-- Select a Category --</option>
                {categoriesData.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {currentProduct.id ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setCurrentProduct({
                    id: '',
                    name: '',
                    price: '',
                    description: '',
                    categoryId: '',
                  });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Price</th>
            <th className="py-2 px-4 border-b">Description</th>
            <th className="py-2 px-4 border-b">Category</th>
            <th className="py-2 px-4 border-b">Operations</th>
          </tr>
        </thead>
        <tbody>
          {data.products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-100">
              <td className="py-2 px-4 border-b">{product.name}</td>
              <td className="py-2 px-4 border-b">{product.price !== null ? `$${product.price.toFixed(2)}` : 'N/A'}</td>
              <td className="py-2 px-4 border-b">{product.description || 'N/A'}</td>
              <td className="py-2 px-4 border-b">{product.category ? product.category.name : 'Uncategorized'}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => handleEdit(product)}
                  className="mr-2 px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {data.products.length === 0 && (
            <tr>
              <td colSpan="5" className="py-2 px-4 text-center">No products found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsPage;
