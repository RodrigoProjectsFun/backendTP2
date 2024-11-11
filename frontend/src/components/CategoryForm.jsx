import React from 'react';

const CategoryForm = ({ category, onChange, onSubmit, onCancel, loading }) => {
  return (
    <div className="p-4 border rounded bg-gray-100">
      <h2 className="text-xl font-semibold mb-2">{category.id ? 'Edit Category' : 'Add New Category'}</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name<span className="text-red-500">*</span></label>
          <input
            type="text"
            name="name"
            value={category.name}
            onChange={onChange}
            required
            className="mt-1 p-2 w-full border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={category.description}
            onChange={onChange}
            className="mt-1 p-2 w-full border rounded"
          />
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={loading}
          >
            {category.id ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
