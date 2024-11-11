import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CATEGORIES } from '../graphql/queries/category.query';
import {
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
} from '../graphql/mutations/category.mutation';
import toast from 'react-hot-toast';
import CategoryForm from '../components/CategoryForm';

const CategoriesPage = () => {
  // Fetch categories
  const { loading, error, data, refetch } = useQuery(GET_CATEGORIES);

  // Mutations
  const [createCategory] = useMutation(CREATE_CATEGORY, {
    onCompleted: () => {
      toast.success('Category created successfully!');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create category.');
    },
  });

  const [updateCategory] = useMutation(UPDATE_CATEGORY, {
    onCompleted: () => {
      toast.success('Category updated successfully!');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update category.');
    },
  });

  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    onCompleted: () => {
      toast.success('Category deleted successfully!');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete category.');
    },
  });

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    id: '',
    name: '',
    description: '',
  });

  // Handlers
  const handleAdd = () => {
    setCurrentCategory({
      id: '',
      name: '',
      description: '',
    });
    setShowForm(true);
  };

  const handleEdit = (category) => {
    setCurrentCategory({
      id: category.id,
      name: category.name,
      description: category.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory({ variables: { id } });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const { id, name, description } = currentCategory;

    if (!name) {
      return toast.error('Name is required');
    }

    if (id) {
      updateCategory({
        variables: { id, name, description },
      });
    } else {
      createCategory({
        variables: { name, description },
      });
    }
    setShowForm(false);
    setCurrentCategory({
      id: '',
      name: '',
      description: '',
    });
  };

  if (loading) return <p>Loading categories...</p>;
  if (error) return <p>Error loading categories.</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <button
        onClick={handleAdd}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Category
      </button>

      {showForm && (
        <CategoryForm
          category={currentCategory}
          onChange={handleFormChange}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setCurrentCategory({
              id: '',
              name: '',
              description: '',
            });
          }}
          loading={false} // You can pass actual loading state if needed
        />
      )}

      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Description</th>
            <th className="py-2 px-4 border-b">Operations</th>
          </tr>
        </thead>
        <tbody>
          {data.categories.map((category) => (
            <tr key={category.id} className="hover:bg-gray-100">
              <td className="py-2 px-4 border-b">{category.name}</td>
              <td className="py-2 px-4 border-b">{category.description || 'N/A'}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => handleEdit(category)}
                  className="mr-2 px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {data.categories.length === 0 && (
            <tr>
              <td colSpan="3" className="py-2 px-4 text-center">No categories found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoriesPage;
